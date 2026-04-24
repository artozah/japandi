import { GoogleGenAI } from '@google/genai';
import { storeGenerationBlob } from '@/lib/generations';

let client: GoogleGenAI | null = null;

function getGoogleClient(): GoogleGenAI {
  if (client) return client;
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error('GOOGLE_API_KEY is not set.');
  client = new GoogleGenAI({ apiKey });
  return client;
}

async function fetchImageAsBase64(url: string): Promise<{
  base64: string;
  mimeType: string;
}> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch source image: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const mimeType = res.headers.get('content-type') ?? 'image/png';
  return { base64: buffer.toString('base64'), mimeType };
}

export interface GeminiResult {
  blobUrl: string;
  blobPathname: string;
}

export async function runGeminiGeneration(
  sourceImageUrl: string,
  prompt: string,
  userId: string,
  generationId: string,
): Promise<GeminiResult> {
  const ai = getGoogleClient();
  const { base64, mimeType } = await fetchImageAsBase64(sourceImageUrl);

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: [
      {
        role: 'user',
        parts: [
          { inlineData: { data: base64, mimeType } },
          { text: prompt },
        ],
      },
    ],
    config: {
      responseModalities: ['image'],
      temperature: 0.7,
    },
  });

  const parts = response.candidates?.[0]?.content?.parts ?? [];
  const imagePart = parts.find((p: { inlineData?: { mimeType?: string } }) =>
    p.inlineData?.mimeType?.startsWith('image/'),
  );
  if (!imagePart?.inlineData?.data) {
    throw new Error('Gemini returned no image output');
  }

  const outputMime = imagePart.inlineData.mimeType ?? 'image/png';
  const imageBuffer = Buffer.from(imagePart.inlineData.data, 'base64');
  const blob = await storeGenerationBlob(userId, generationId, imageBuffer, outputMime);

  return { blobUrl: blob.url, blobPathname: blob.pathname };
}
