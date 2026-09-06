'use client';

import { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

/** Default map centre — Leicester city centre (SuperDryCleaners service area). */
const DEFAULT = { lat: 52.6369, lng: -1.1398 };

/**
 * Interactive pickup-location map built on Leaflet + OpenStreetMap.
 *
 * The user drops/drags a pin; the chosen coordinates are reported upward via
 * `onPick`. Optionally reverse-geocodes the pin to help fill the address.
 * Leaflet is imported dynamically so it only loads in the browser (it touches
 * `window`), keeping it out of the server bundle.
 *
 * @param {object} props
 * @param {(coords: {lat: number, lng: number}) => void} props.onPick - Called
 *   whenever the pin moves, with the new coordinates.
 * @param {(address: {line1?: string, city?: string, postcode?: string}) => void}
 *   [props.onGeocode] - Called with a best-effort reverse-geocoded address.
 */
const PickupMap = ({ onPick, onGeocode }) => {
  const containerRef = useRef(null);
  // Hold Leaflet map/marker instances across renders without causing re-renders.
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    let cancelled = false;

    /**
     * Reverse-geocode a coordinate via Nominatim (no API key required).
     * Failures are swallowed — the user can still type the address manually.
     * @param {number} lat - Latitude.
     * @param {number} lng - Longitude.
     */
    async function reverseGeocode(lat, lng) {
      if (!onGeocode) return;
      try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
        const res = await fetch(url, { headers: { 'Accept-Language': 'en-GB' } });
        if (!res.ok) return;
        const data = await res.json();
        const a = data.address || {};
        onGeocode({
          line1: [a.house_number, a.road].filter(Boolean).join(' ') || undefined,
          city: a.city || a.town || a.village || a.suburb || a.city_district || undefined,
          postcode: a.postcode || undefined,
        });
      } catch {
        /* silent — geocoding is a convenience, not a requirement */
      }
    }

    // Dynamically load Leaflet and its CSS in the browser only.
    async function init() {
      await import('leaflet/dist/leaflet.css');
      const L = (await import('leaflet')).default;
      if (cancelled || !containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, { scrollWheelZoom: false }).setView(
        [DEFAULT.lat, DEFAULT.lng],
        14,
      );
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      // Create custom SVG Map Pin icon using Lucide style pin
      const pinIcon = L.divIcon({
        className: 'custom-pickup-pin',
        html: `
          <div style="
            width: 38px;
            height: 38px;
            background-color: #0a1f44;
            border: 2.5px solid #ffffff;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 4px 14px rgba(0,0,0,0.35);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: grab;
          ">
            <svg style="transform: rotate(45deg); color: #ffffff; width: 20px; height: 20px; display: block;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 38],
        popupAnchor: [0, -38],
      });

      const marker = L.marker([DEFAULT.lat, DEFAULT.lng], {
        icon: pinIcon,
        draggable: true,
        autoPan: true,
        title: 'Drag me to your pickup location',
      }).addTo(map);
      markerRef.current = marker;

      // Show a tooltip so users know the pin is interactive.
      marker.bindPopup('Drag me to your pickup spot').openPopup();
      setTimeout(() => marker.closePopup(), 3000);

      /**
       * Move the pin, report coordinates upward, and reverse-geocode.
       * @param {number} lat - Latitude.
       * @param {number} lng - Longitude.
       */
      const setPin = (lat, lng) => {
        marker.setLatLng([lat, lng]);
        onPick({ lat, lng });
        reverseGeocode(lat, lng);
      };

      marker.on('dragend', () => {
        const p = marker.getLatLng();
        setPin(p.lat, p.lng);
      });
      map.on('click', (e) => setPin(e.latlng.lat, e.latlng.lng));

      // Only enable wheel zoom while focused, so the page scrolls smoothly past.
      map.on('focus', () => map.scrollWheelZoom.enable());
      map.on('blur', () => map.scrollWheelZoom.disable());

      // Expose a locate handler for the parent button via a DOM custom event.
      containerRef.current.__setPin = setPin;
    }

    init();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
    // Handlers are stable (defined in parent with useCallback); safe deps.
  }, [onPick, onGeocode]);

  /**
   * Ask the browser for the user's location and drop the pin there.
   */
  const handleLocate = () => {
    if (!navigator.geolocation || !mapRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        mapRef.current.setView([latitude, longitude], 16);
        const setPin = containerRef.current?.__setPin;
        if (setPin) setPin(latitude, longitude);
      },
      () => {
        /* permission denied or unavailable — user drops the pin manually */
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim() || !mapRef.current) return;

    setIsSearching(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(searchQuery + ' Leicester')}`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'en-GB' } });
      const data = await res.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);

        mapRef.current.setView([latitude, longitude], 16);
        const setPin = containerRef.current?.__setPin;
        if (setPin) setPin(latitude, longitude);
      } else {
        alert("Couldn't find that address. Please try dragging the pin manually.");
      }
    } catch {
      alert("Error searching for address. Please try again or drag the pin.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="map__wrap" style={{ position: 'relative' }}>
      <form
        onSubmit={handleSearch}
        style={{ position: 'absolute', top: '10px', left: '50px', right: '10px', zIndex: 400, display: 'flex', gap: '5px' }}
      >
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search postcode or address..."
          style={{ flex: 1, padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', fontSize: '1rem', outline: 'none' }}
        />
        <button
          type="submit"
          disabled={isSearching}
          style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', background: 'var(--teal)', color: 'white', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', fontWeight: 600 }}
        >
          {isSearching ? '...' : 'Search'}
        </button>
      </form>
      <div
        ref={containerRef}
        className="map"
        role="application"
        aria-label="Pickup location map. Drag the pin or click anywhere to set your exact pickup point."
      />
      <button
        type="button"
        className="map__locate"
        onClick={handleLocate}
        aria-label="Use my current location"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
          <circle cx="12" cy="12" r="8" />
        </svg>
        Use my location
      </button>
    </div>
  );
};

PickupMap.propTypes = {
  onPick: PropTypes.func.isRequired,
  onGeocode: PropTypes.func,
};

export default PickupMap;
