import type Anthropic from '@anthropic-ai/sdk';
import { accordionData } from '@/data/spaces';
import type { PromptSpec } from '@/types/spaces';

const MAX_SPEC_FIELD_LENGTH = 64;

export const DESCRIBE_SYSTEM_PROMPT = `You are an interior-photography analyst. Read the attached photo and produce ONE observational paragraph (120–200 words) describing what is physically present in the room. No design opinions, no suggestions, no style labels.

Cover, in natural prose:
- Room type and approximate scale / proportions.
- Architectural bones: walls, ceiling, floor, doors, windows (orientation, size, count), built-ins, alcoves.
- Natural light character (direction, warmth, diffusion).
- Every visible piece of furniture and decor, with materials, finishes, and colors as specific as you can tell (e.g. "light oak slat chair", "cream matte ceramic lamp").
- Any distinctive features: fireplace, exposed beams, skylights, radiators, rugs.

Hard rules:
- ALWAYS call the describe_room tool. Never reply in plain text.
- Never propose changes. Never mention styles or aesthetics. Pure observation.
- Aim for 120–200 words. One paragraph.`;

export const DESCRIBE_ROOM_TOOL: Anthropic.Tool = {
  name: 'describe_room',
  description:
    'Emit a 120–200 word observational paragraph describing the room in the attached photo. Pure description — no design suggestions, no style labels.',
  input_schema: {
    type: 'object',
    properties: {
      description: {
        type: 'string',
        description:
          'One paragraph, 120–200 words. Covers room type, architecture, light, furniture, decor — with specific materials and colors.',
      },
    },
    required: ['description'],
  },
};

export const VISION_SYSTEM_PROMPT = `You rewrite interior-design prompts for an image-to-image redesign model (Flux Kontext / similar). You receive (1) a photo of a real room and (2) a short baseline describing the desired transformation. You produce ONE long, vivid, highly specific final prompt that will guide the model to make that change in THIS exact room.

Your output MUST read like a detailed design brief, not a generic style label. Specifically:

1. Open by naming the room type and its current state grounded in the photo: "this narrow galley kitchen with a tall window and checkerboard floor", "this bright living room with bay windows and a brick fireplace", etc.
2. Walk through the visible surfaces and elements in turn — walls, floor, ceiling, cabinets, countertops, windows/window treatments, lighting fixtures, furniture, and any focal props — and for each one specify what it BECOMES: the material, finish, color, texture, and form. Aim to cover 8–15 concrete elements.
3. Use specific, evocative descriptors, not abstract ones. Instead of "warm palette" say "aged oak, bleached linen, matte terracotta". Instead of "modern lighting" say "brushed brass pendant with frosted glass globe". Name materials (walnut, travertine, washi, boucle, jute, rattan), finishes (matte, oiled, limewashed, honed), and hues (muted clay, moss green, aged white, soft taupe).
4. Name specific furniture/decor pieces to add or swap — e.g., "low-slung oak slat bench", "handwoven jute runner", "paper washi pendant", "a single bonsai on the sill".
5. Specify lighting character: direction, color temperature, diffusion, and which existing fixtures are kept vs replaced.
6. Preserve layout, camera angle, window positions, and architectural bones unless the baseline explicitly overrides (Remove / Relight / Recolor / Aspect Ratio can override specific pieces — follow their intent).
7. End with a one-sentence mood line.

Hard rules:
- ALWAYS call the finalize_prompt tool. Never reply in plain text.
- Never ask questions. Never emit meta-commentary.
- Never output a short or generic prompt. Target 150–250 words.
- Never mention "style" without also describing concrete materials, colors, and pieces.`;

export const ADJUST_SYSTEM_PROMPT = `You rewrite interior-design prompts for an image-to-image redesign model. You receive (1) a plain-text DESCRIPTION of a real room and (2) a short baseline describing the desired transformation. You produce ONE long, vivid, highly specific final prompt that will guide the model to make that change in that exact room.

Your output MUST read like a detailed design brief, not a generic style label. Specifically:

1. Open by naming the room type and its current state grounded in the description: "this narrow galley kitchen with a tall window and checkerboard floor", etc.
2. Walk through the visible surfaces and elements in turn — walls, floor, ceiling, cabinets, countertops, windows/window treatments, lighting fixtures, furniture, and any focal props — and for each one specify what it BECOMES: the material, finish, color, texture, and form. Aim to cover 8–15 concrete elements drawn from the description.
3. Use specific, evocative descriptors, not abstract ones. Instead of "warm palette" say "aged oak, bleached linen, matte terracotta". Name materials, finishes, and hues concretely.
4. Name specific furniture/decor pieces to add or swap.
5. Specify lighting character: direction, color temperature, diffusion.
6. Preserve layout, camera angle, window positions, and architectural bones unless the baseline explicitly overrides.
7. End with a one-sentence mood line.

Hard rules:
- ALWAYS call the finalize_prompt tool. Never reply in plain text.
- Never ask questions. Never emit meta-commentary.
- Target 150–250 words.
- Never mention "style" without also describing concrete materials, colors, and pieces.
- Ground every claim in elements that appear in the DESCRIPTION. Do not invent new architectural features.`;

export const FINALIZE_PROMPT_TOOL: Anthropic.Tool = {
  name: 'finalize_prompt',
  description:
    'Emit the final image-grounded redesign prompt. A single self-contained instruction for an image-to-image model, 150–250 words, referencing 8–15 concrete visible elements with specific materials, finishes, colors, and named pieces.',
  input_schema: {
    type: 'object',
    properties: {
      prompt: {
        type: 'string',
        description:
          'The final prompt. Opens by naming the room from the description; walks through 8–15 surfaces/elements specifying concrete materials, finishes, colors, and named pieces; preserves layout and camera angle; ends with a one-sentence mood line.',
      },
    },
    required: ['prompt'],
  },
};

const VALID_SPEC_KEYS: Set<string> = (() => {
  const set = new Set<string>();
  for (const [category, groups] of Object.entries(accordionData)) {
    for (const group of groups) {
      const titles: string[] = [];
      if ('items' in group) {
        for (const it of group.items) titles.push(it.title);
      }
      if ('badges' in group) {
        for (const badge of group.badges) titles.push(badge);
      }
      for (const title of titles) {
        set.add(`${category}|${group.title}|${title}`);
      }
    }
  }
  return set;
})();

export function isSpecShape(value: unknown): value is PromptSpec {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.category === 'string' &&
    typeof v.groupTitle === 'string' &&
    typeof v.itemTitle === 'string' &&
    v.category.length <= MAX_SPEC_FIELD_LENGTH &&
    v.groupTitle.length <= MAX_SPEC_FIELD_LENGTH &&
    v.itemTitle.length <= MAX_SPEC_FIELD_LENGTH
  );
}

export function isKnownSpec(spec: PromptSpec): boolean {
  return VALID_SPEC_KEYS.has(
    `${spec.category}|${spec.groupTitle}|${spec.itemTitle}`,
  );
}

export function buildTemplate(spec: PromptSpec): string {
  const { category, groupTitle, itemTitle } = spec;
  const item = itemTitle.trim();

  switch (category) {
    case 'style':
      return `Redesign this interior in ${item} style. Render it as a coherent ${item} space — signature palette, materials, furniture silhouettes, and lighting. Preserve the existing layout, camera angle, window placement, and architectural bones. Photorealistic, natural light.`;

    case 'occasions':
      return `Decorate the existing room for ${item}. Add appropriate décor, props, and warm ambient lighting. Keep the existing furniture, walls, floors, and camera angle unchanged.`;

    case 'locations':
      return `Infuse this room with ${item} aesthetic — characteristic materials, palette, patterns, textiles, and artifacts. Preserve the layout, proportions, and camera angle.`;

    case 'themes':
      return `Transform this room into a ${item}-inspired space, evoking its signature colors, materials, lighting, and iconography while preserving the original layout and camera angle.`;

    case 'enhance': {
      if (groupTitle === 'Remove') {
        const target = item.replace(/^Remove\s+/i, '').toLowerCase();
        return `Remove all ${target} from the scene. Reconstruct the floor, wall, and surfaces behind them consistently with the existing materials and lighting. Keep layout, proportions, and camera angle unchanged.`;
      }
      if (groupTitle === 'Relight') {
        return `Re-render this exact room under ${item.toLowerCase()} lighting. Preserve every object, material, layout, and camera angle — change only the light source, color temperature, and shadows.`;
      }
      return `Apply ${item} to this room while preserving the layout, materials, and camera angle.`;
    }

    case 'finalize': {
      if (groupTitle === 'Recolor') {
        return `Recolor this room to a ${item.toLowerCase()} palette. Keep every object, material texture, layout, and camera angle — only shift color tones.`;
      }
      if (groupTitle === 'Camera Views') {
        return `Re-render this exact room from a ${item.toLowerCase()} camera angle. Preserve the room's furniture, materials, palette, and lighting.`;
      }
      if (groupTitle === 'Aspect Ratio') {
        return `Re-render this room at ${item} aspect ratio. Preserve every object, material, palette, and lighting — reframe or extend the scene naturally.`;
      }
      if (groupTitle === 'Rebuild') {
        return `Upscale this exact scene (${item}) with sharper detail and cleaner edges while preserving the content, palette, composition, and camera angle.`;
      }
      return `Finalize this scene with ${item} while preserving content and composition.`;
    }

    default:
      return `Redesign this interior using ${item}. Preserve the original layout, camera angle, and architectural features.`;
  }
}

export function shouldEnrich(spec: PromptSpec): boolean {
  if (spec.category === 'finalize') {
    if (spec.groupTitle === 'Aspect Ratio') return false;
    if (spec.groupTitle === 'Rebuild') return false;
  }
  return true;
}
