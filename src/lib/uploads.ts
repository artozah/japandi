import { upload } from '@vercel/blob/client';
import { safeReadError } from '@/lib/http';

export interface UploadedImage {
  id: string;
  url: string;
  pathname: string;
  createdAt: string;
  width: number | null;
  height: number | null;
  sizeBytes: number | null;
  mimeType: string | null;
}

interface RecordResponse {
  upload: {
    id: string;
    blobUrl: string;
    blobPathname: string;
    mimeType: string | null;
    width: number | null;
    height: number | null;
    sizeBytes: number | null;
    createdAt: string;
  };
}

export async function uploadImage(file: File): Promise<UploadedImage> {
  if (!file.type.startsWith('image/')) {
    throw new Error('File is not an image');
  }

  const dimensions = await readImageDimensions(file).catch(() => null);

  const blob = await upload(file.name, file, {
    access: 'public',
    handleUploadUrl: '/api/uploads',
    contentType: file.type,
  });

  const res = await fetch('/api/uploads/record', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: blob.url,
      pathname: blob.pathname,
      contentType: blob.contentType ?? file.type,
      width: dimensions?.width ?? null,
      height: dimensions?.height ?? null,
      sizeBytes: file.size,
    }),
  });

  if (!res.ok) {
    const error = await safeReadError(res);
    throw new Error(error ?? 'Failed to record upload');
  }

  const data = (await res.json()) as RecordResponse;
  return {
    id: data.upload.id,
    url: data.upload.blobUrl,
    pathname: data.upload.blobPathname,
    createdAt: data.upload.createdAt,
    width: data.upload.width,
    height: data.upload.height,
    sizeBytes: data.upload.sizeBytes,
    mimeType: data.upload.mimeType,
  };
}

export async function describeUpload(
  id: string,
  signal?: AbortSignal,
): Promise<string | null> {
  try {
    const res = await fetch(`/api/uploads/${id}/describe`, {
      method: 'POST',
      signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { description?: unknown };
    if (
      typeof data.description === 'string' &&
      data.description.trim().length > 0
    ) {
      return data.description.trim();
    }
    return null;
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    console.warn('[describeUpload] failed:', err);
    return null;
  }
}

function readImageDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
}
