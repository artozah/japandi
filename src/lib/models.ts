export type ModelId = 'flux-kontext' | 'p-image-edit' | 'qwen-image-edit' | 'gemini-flash';
export type ProviderId = 'replicate' | 'google';

export type ReplicateInput = Record<string, unknown>;

export interface ModelDef {
  id: ModelId;
  label: string;
  provider: ProviderId;
  replicateModel?: `${string}/${string}`;
  buildInput?: (imageUrl: string, prompt: string) => ReplicateInput;
}

const defaultInput = (imageUrl: string, prompt: string): ReplicateInput => ({
  image: imageUrl,
  prompt,
});

export const MODELS: Record<ModelId, ModelDef> = {
  'flux-kontext': {
    id: 'flux-kontext',
    label: 'Flux Kontext',
    provider: 'replicate',
  },
  'p-image-edit': {
    id: 'p-image-edit',
    label: 'Pruna',
    provider: 'replicate',
    replicateModel: 'prunaai/p-image-edit',
    buildInput: (imageUrl, prompt) => ({
      turbo: true,
      images: [imageUrl],
      prompt,
      aspect_ratio: '1:1',
    }),
  },
  'qwen-image-edit': {
    id: 'qwen-image-edit',
    label: 'Qwen Image Edit',
    provider: 'replicate',
    replicateModel: 'qwen/qwen-image-edit',
  },
  'gemini-flash': {
    id: 'gemini-flash',
    label: 'Gemini Flash',
    provider: 'google',
  },
};

export function buildReplicateInput(
  modelId: ModelId,
  imageUrl: string,
  prompt: string,
): ReplicateInput {
  const def = MODELS[modelId];
  return (def.buildInput ?? defaultInput)(imageUrl, prompt);
}

export const MODEL_IDS = Object.keys(MODELS) as ModelId[];
export const DEFAULT_MODEL: ModelId = 'flux-kontext';

export function isValidModelId(value: unknown): value is ModelId {
  return typeof value === 'string' && value in MODELS;
}

export function getReplicateModelId(modelId: ModelId): `${string}/${string}` {
  const def = MODELS[modelId];
  if (def.replicateModel) return def.replicateModel;
  // Default Flux model from env
  const envModel = process.env.REPLICATE_MODEL;
  if (!envModel || !/^[^/]+\/[^/]+$/.test(envModel)) {
    throw new Error('REPLICATE_MODEL must be set for flux-kontext');
  }
  return envModel as `${string}/${string}`;
}
