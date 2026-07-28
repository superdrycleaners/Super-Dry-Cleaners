/**
 * Focused checks for CMS mutation error handling (task 10).
 *
 * Proves that saveContentSection:
 * - Requires a session before any parsing or data access.
 * - Returns user-actionable messages for expected validation failures.
 * - Returns a generic client-safe message for unexpected data-layer failures.
 * - Never discloses internal exception messages, file paths, stack details,
 *   or storage internals in the client response.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock next/cache — revalidatePath is called on success.
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Mock session — allow tests to control whether session passes.
const mockRequireSession = vi.fn();
vi.mock('@/lib/session', () => ({
  requireSession: (...args) => mockRequireSession(...args),
}));

// Mock the data layer so we can control successes and failures.
const mockUpdateContentSection = vi.fn();
vi.mock('@/lib/data/content', () => ({
  updateContentSection: (...args) => mockUpdateContentSection(...args),
}));

// Import the server action under test.
const { saveContentSection } = await import(
  '../app/admin/(dashboard)/actions.js'
);

/**
 * Helper to build a FormData-like object with the expected keys.
 *
 * @param {string} section - Section name.
 * @param {string} payload - Raw JSON payload string.
 * @returns {{ get: (key: string) => string|null }}
 */
function makeFormData(section, payload) {
  const data = { section, payload };
  return { get: (key) => data[key] ?? null };
}

describe('saveContentSection — error handling security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: session passes, data layer succeeds.
    mockRequireSession.mockReturnValue({ sub: 'admin', exp: Date.now() + 60000 });
    mockUpdateContentSection.mockResolvedValue({});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // --- Session enforcement ---

  it('calls requireSession before any parsing or data access', async () => {
    mockRequireSession.mockImplementation(() => {
      throw new Error('REDIRECT');
    });

    await expect(
      saveContentSection(null, makeFormData('home', '{"a":1}'))
    ).rejects.toThrow('REDIRECT');

    // Data layer should never have been called.
    expect(mockUpdateContentSection).not.toHaveBeenCalled();
  });

  // --- Malformed JSON ---

  it('rejects malformed JSON with a user-actionable message', async () => {
    const result = await saveContentSection(
      null,
      makeFormData('home', '{ not valid json }')
    );

    expect(result.ok).toBe(false);
    expect(result.error).toBe(
      'Content is not valid JSON. Please check your edits.'
    );
  });

  it('does not disclose JSON parse error details in the response', async () => {
    const result = await saveContentSection(
      null,
      makeFormData('home', '{"key": undefined}')
    );

    expect(result.ok).toBe(false);
    // The error must not contain parser internals like "Unexpected token"
    // or position indicators.
    expect(result.error).not.toMatch(/unexpected token/i);
    expect(result.error).not.toMatch(/position/i);
    expect(result.error).not.toMatch(/line \d/i);
  });

  // --- Unknown section ---

  it('rejects unknown sections with a safe message', async () => {
    mockUpdateContentSection.mockRejectedValue(
      new Error('Unknown content section: nonexistent')
    );

    const result = await saveContentSection(
      null,
      makeFormData('nonexistent', '{"a":1}')
    );

    expect(result.ok).toBe(false);
    expect(result.error).toBe(
      'Unknown section. Please choose a valid content section.'
    );
    // Must not include the raw section name from the exception.
    expect(result.error).not.toContain('nonexistent');
  });

  it('does not echo the exception message for unknown sections', async () => {
    mockUpdateContentSection.mockRejectedValue(
      new Error('Unknown content section: __proto__')
    );

    const result = await saveContentSection(
      null,
      makeFormData('__proto__', '{}')
    );

    expect(result.ok).toBe(false);
    expect(result.error).not.toContain('__proto__');
    expect(result.error).not.toContain('Unknown content section:');
  });

  // --- Unexpected data-layer failures ---

  it('returns a generic message for unexpected errors', async () => {
    mockUpdateContentSection.mockRejectedValue(
      new Error('ENOENT: no such file or directory, open /var/data/cms.json')
    );

    const result = await saveContentSection(
      null,
      makeFormData('home', '{"headline":"Hi"}')
    );

    expect(result.ok).toBe(false);
    expect(result.error).toBe(
      'Could not save content. Please try again or contact support.'
    );
  });

  it('does not disclose file paths in the response', async () => {
    mockUpdateContentSection.mockRejectedValue(
      new Error('EACCES: permission denied /opt/app/content/store.json')
    );

    const result = await saveContentSection(
      null,
      makeFormData('home', '{"a":1}')
    );

    expect(result.error).not.toMatch(/\//);
    expect(result.error).not.toMatch(/EACCES/i);
    expect(result.error).not.toMatch(/permission denied/i);
  });

  it('does not disclose stack traces in the response', async () => {
    const err = new Error('Connection refused');
    err.stack = 'Error: Connection refused\n    at Object.<anonymous> (/app/lib/data/content.js:42:11)';
    mockUpdateContentSection.mockRejectedValue(err);

    const result = await saveContentSection(
      null,
      makeFormData('home', '{"a":1}')
    );

    expect(result.error).not.toContain('content.js');
    expect(result.error).not.toContain('/app/');
    expect(result.error).not.toContain('Connection refused');
  });

  it('does not disclose storage internals in the response', async () => {
    mockUpdateContentSection.mockRejectedValue(
      new Error('TypeError: Cannot read properties of null (reading "home")')
    );

    const result = await saveContentSection(
      null,
      makeFormData('home', '{"a":1}')
    );

    expect(result.error).not.toContain('Cannot read properties');
    expect(result.error).not.toContain('TypeError');
    expect(result.error).not.toContain('null');
  });

  it('handles non-Error thrown values gracefully', async () => {
    // Some libraries throw strings or plain objects.
    mockUpdateContentSection.mockRejectedValue('raw string error');

    const result = await saveContentSection(
      null,
      makeFormData('home', '{"a":1}')
    );

    expect(result.ok).toBe(false);
    expect(result.error).toBe(
      'Could not save content. Please try again or contact support.'
    );
    expect(result.error).not.toContain('raw string error');
  });

  // --- Server-side logging for unexpected failures ---

  it('logs unexpected failures server-side with section name only', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    mockUpdateContentSection.mockRejectedValue(
      new TypeError('store is null')
    );

    await saveContentSection(
      null,
      makeFormData('catalogue', '{"items":[]}')
    );

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    const [logMessage, logData] = consoleSpy.mock.calls[0];
    expect(logMessage).toContain('[CMS]');
    expect(logData.section).toBe('catalogue');
    expect(logData.errorType).toBe('TypeError');

    // Must not log the CMS payload, passwords, tokens, or PII.
    const logStr = JSON.stringify(consoleSpy.mock.calls[0]);
    expect(logStr).not.toContain('items');
    expect(logStr).not.toContain('password');
    expect(logStr).not.toContain('token');
    expect(logStr).not.toContain('store is null');

    consoleSpy.mockRestore();
  });

  it('does not log for known validation rejections (unknown section)', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    mockUpdateContentSection.mockRejectedValue(
      new Error('Unknown content section: bogus')
    );

    await saveContentSection(null, makeFormData('bogus', '{}'));

    // Known validation error — no console.error expected.
    expect(consoleSpy).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  // --- Preserved behavior ---

  it('preserves successful save with revalidation', async () => {
    const { revalidatePath } = await import('next/cache');
    mockUpdateContentSection.mockResolvedValue({ home: { headline: 'New' } });

    const result = await saveContentSection(
      null,
      makeFormData('home', '{"headline":"New"}')
    );

    expect(result.ok).toBe(true);
    expect(result.message).toBe('Saved. Changes are live on the site.');
    expect(revalidatePath).toHaveBeenCalledWith('/', 'layout');
    expect(revalidatePath).toHaveBeenCalledWith('/admin/content');
  });

  it('preserves section and payload FormData field names', async () => {
    await saveContentSection(
      null,
      makeFormData('services', '{"list":[]}')
    );

    expect(mockUpdateContentSection).toHaveBeenCalledWith('services', { list: [] });
  });

  it('rejects missing section', async () => {
    const result = await saveContentSection(null, makeFormData('', '{}'));
    expect(result.ok).toBe(false);
    expect(result.error).toBe('Missing section.');
  });
});
