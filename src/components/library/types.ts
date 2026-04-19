export interface LibraryGeneration {
  id: string;
  styleLabel: string;
  outputBlobUrl: string;
  sourceImageUrl: string | null;
  sourceUploadId: string | null;
  sourceGenerationId: string | null;
  prompt: string | null;
  createdAt: string;
}

export interface LibraryUpload {
  id: string;
  blobUrl: string;
  createdAt: string;
  label: string;
}
