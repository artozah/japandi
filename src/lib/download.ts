const MIME_EXTENSION_OVERRIDES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/svg+xml': 'svg',
};

function extensionForMime(mime: string | undefined): string {
  if (!mime) return 'bin';
  const normalized = mime.split(';')[0].trim().toLowerCase();
  if (MIME_EXTENSION_OVERRIDES[normalized]) {
    return MIME_EXTENSION_OVERRIDES[normalized];
  }
  const subtype = normalized.split('/')[1];
  return subtype?.replace(/[^a-z0-9]+/g, '') || 'bin';
}

export async function downloadBlobUrl(
  url: string,
  filenameBase: string,
): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  const blob = await res.blob();
  const filename = `${filenameBase}.${extensionForMime(blob.type)}`;
  const objectUrl = URL.createObjectURL(blob);
  try {
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = filename;
    anchor.rel = 'noopener';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
