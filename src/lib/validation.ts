export const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

export function isVercelBlobUrl(raw: string, expectedPathname?: string): boolean {
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== 'https:') return false;
    if (!parsed.hostname.endsWith('.blob.vercel-storage.com')) return false;
    if (expectedPathname !== undefined) {
      const urlPath = parsed.pathname.replace(/^\//, '');
      return urlPath === expectedPathname.replace(/^\//, '');
    }
    return true;
  } catch {
    return false;
  }
}
