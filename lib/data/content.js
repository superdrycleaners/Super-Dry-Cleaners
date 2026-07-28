/**
 * Content data-access layer.
 *
 * This module is the single source of truth for CMS-managed site content.
 * Pages and the admin CMS read/write ONLY through these functions.
 *
 * Backend: Supabase `site_content` table (key/value: section → JSONB value).
 * Falls back to the JSON seed if a section is not yet in the database.
 */

import { supabase } from '@/lib/supabase';
import seed from '@/content/site-content.json';

/**
 * Deep clone via structuredClone with a JSON fallback.
 * @template T
 * @param {T} value - Value to clone.
 * @returns {T} A deep copy.
 */
function clone(value) {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

/**
 * Read the full site content object.
 * Merges seed defaults with any database overrides.
 *
 * @returns {Promise<object>} All CMS-managed content.
 */
export async function getContent() {
  const base = clone(seed);

  if (!supabase) return base;

  const { data, error } = await supabase
    .from('site_content')
    .select('section, value');

  if (error) {
    console.error('[Content] Failed to read from Supabase, using seed:', error.message);
    return base;
  }

  // Override seed values with database values
  for (const row of data || []) {
    if (row.section && row.value !== undefined) {
      base[row.section] = row.value;
    }
  }

  return base;
}

/**
 * Read a single top-level content section by key.
 *
 * @param {string} section - Top-level key, e.g. 'home' or 'catalogue'.
 * @returns {Promise<*>} That section's value, or undefined if missing.
 */
export async function getContentSection(section) {
  if (!supabase) {
    return section in seed ? clone(seed[section]) : undefined;
  }

  // Try database first
  const { data, error } = await supabase
    .from('site_content')
    .select('value')
    .eq('section', section)
    .single();

  if (!error && data) {
    return clone(data.value);
  }

  // Fall back to seed
  if (section in seed) {
    return clone(seed[section]);
  }

  return undefined;
}

/**
 * Replace one top-level content section.
 *
 * @param {string} section - Top-level key to update.
 * @param {*} value - New value for the section (already validated/parsed).
 * @returns {Promise<object>} The updated full content.
 */
export async function updateContentSection(section, value) {
  // Validate section exists in seed (known sections only)
  if (!(section in seed)) {
    throw new Error(`Unknown content section: ${section}`);
  }

  if (!supabase) {
    // Fallback: update seed in memory (won't persist across restarts)
    seed[section] = clone(value);
    return clone(seed);
  }

  const { error } = await supabase
    .from('site_content')
    .upsert(
      { section, value, updated_at: new Date().toISOString() },
      { onConflict: 'section' }
    );

  if (error) {
    throw new Error(`Failed to save content: ${error.message}`);
  }

  return getContent();
}

/**
 * List the editable top-level section keys.
 *
 * @returns {Promise<string[]>} The section keys available in the CMS.
 */
export async function listContentSections() {
  return Object.keys(seed);
}
