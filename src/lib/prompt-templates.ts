import type { PromptSpec } from '@/types/spaces';

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
