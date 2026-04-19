export type SupportedImageMediaType =
  | 'image/jpeg'
  | 'image/png'
  | 'image/gif'
  | 'image/webp';

export const SUPPORTED_IMAGE_MEDIA_TYPES: readonly SupportedImageMediaType[] = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

export type ImageSource =
  | { type: 'base64'; media_type: SupportedImageMediaType; data: string }
  | { type: 'url'; url: string };

export function toImageSource(value: string): ImageSource | null {
  if (value.startsWith('data:')) {
    const match = /^data:([^;,]+);base64,(.+)$/.exec(value);
    if (!match) return null;
    const mediaType = match[1] as SupportedImageMediaType;
    if (!SUPPORTED_IMAGE_MEDIA_TYPES.includes(mediaType)) return null;
    return { type: 'base64', media_type: mediaType, data: match[2] };
  }
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== 'https:') return null;
    if (!parsed.hostname.endsWith('.blob.vercel-storage.com')) return null;
    return { type: 'url', url: value };
  } catch {
    return null;
  }
}
