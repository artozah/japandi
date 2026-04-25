export type ModelId = 'qwen-image-edit' | 'gemini-flash';
export type ProviderId = 'replicate' | 'google';

export type ReplicateInput = Record<string, unknown>;

export interface ModelDef {
  id: ModelId;
  provider: ProviderId;
  replicateModel?: `${string}/${string}`;
  buildInput?: (imageUrl: string, prompt: string) => ReplicateInput;
}

const defaultInput = (imageUrl: string, prompt: string): ReplicateInput => ({
  image: imageUrl,
  prompt,
});

const MODELS: Record<ModelId, ModelDef> = {
  'qwen-image-edit': {
    id: 'qwen-image-edit',
    provider: 'replicate',
    replicateModel: 'qwen/qwen-image-edit',
  },
  'gemini-flash': {
    id: 'gemini-flash',
    provider: 'google',
  },
};

const DEFAULT_MODEL: ModelId = 'gemini-flash';

function isValidModelId(value: unknown): value is ModelId {
  return typeof value === 'string' && value in MODELS;
}

export function getActiveModel(): ModelDef {
  const env = process.env.AI_MODEL;
  const id = isValidModelId(env) ? env : DEFAULT_MODEL;
  return MODELS[id];
}

export function buildReplicateInput(
  modelId: ModelId,
  imageUrl: string,
  prompt: string,
): ReplicateInput {
  const def = MODELS[modelId];
  return (def.buildInput ?? defaultInput)(imageUrl, prompt);
}

export function getReplicateModelId(modelId: ModelId): `${string}/${string}` {
  const def = MODELS[modelId];
  if (def.replicateModel) return def.replicateModel;
  throw new Error(`No Replicate model configured for ${modelId}`);
}
