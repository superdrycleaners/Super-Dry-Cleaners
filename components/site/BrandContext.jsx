'use client';

import { createContext, useContext } from 'react';
import seed from '@/content/site-content.json';

const BrandContext = createContext(seed.brand);

/**
 * Provider component for admin brand content.
 *
 * @param {object} props
 * @param {object} props.value - Brand settings object from CMS/Supabase.
 * @param {import('react').ReactNode} props.children - Children.
 */
export function BrandProvider({ value, children }) {
  const mergedBrand = { ...seed.brand, ...(value || {}) };
  return (
    <BrandContext.Provider value={mergedBrand}>
      {children}
    </BrandContext.Provider>
  );
}

/**
 * Custom hook to access centralized brand settings.
 * Returns merged brand content (CMS database overrides falling back to seed defaults).
 *
 * @returns {object} Brand details (name, email, phone, phoneHref, whatsapp, address, openingHours, closedDay, freeDeliveryThreshold, areasServed, etc.)
 */
export function useBrand() {
  const context = useContext(BrandContext);
  return context || seed.brand;
}
