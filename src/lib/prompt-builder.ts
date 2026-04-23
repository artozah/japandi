import {
  LOCATION_DATA,
  OCCASION_DATA,
  STYLE_DATA,
  THEME_DATA,
  buildLocationPromptFromData,
  buildOccasionPromptFromData,
  buildStylePromptFromData,
  buildThemePromptFromData,
} from '@/lib/prompt-data';
import { buildTemplate } from '@/lib/prompt-templates';
import type { PromptSpec } from '@/types/spaces';

export function buildStaticPrompt(spec: PromptSpec): string {
  switch (spec.category) {
    case 'style': {
      const data = STYLE_DATA[spec.itemTitle];
      return data
        ? buildStylePromptFromData(spec.itemTitle, data)
        : buildTemplate(spec);
    }
    case 'occasions': {
      const data = OCCASION_DATA[spec.itemTitle];
      return data
        ? buildOccasionPromptFromData(spec.itemTitle, data)
        : buildTemplate(spec);
    }
    case 'locations': {
      const data = LOCATION_DATA[spec.itemTitle];
      return data
        ? buildLocationPromptFromData(spec.itemTitle, data)
        : buildTemplate(spec);
    }
    case 'themes': {
      const data = THEME_DATA[spec.itemTitle];
      return data
        ? buildThemePromptFromData(spec.itemTitle, data)
        : buildTemplate(spec);
    }
    case 'enhance':
    case 'finalize':
    default:
      return buildTemplate(spec);
  }
}
