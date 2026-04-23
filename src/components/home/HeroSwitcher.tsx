'use client';

import { useSearchParams } from 'next/navigation';
import { Hero as HeroGallery } from '@/components/home/Hero';
import { Hero as HeroSlider } from '@/components/home/HeroSlider';

const VARIANTS = {
  gallery: HeroGallery,
  slider: HeroSlider,
} as const;

type Variant = keyof typeof VARIANTS;

export const HERO_VARIANTS = Object.keys(VARIANTS) as Variant[];
export const DEFAULT_HERO_VARIANT: Variant = 'gallery';

function isVariant(value: string | null): value is Variant {
  return value !== null && value in VARIANTS;
}

export function HeroSwitcher() {
  const params = useSearchParams();
  const raw = params.get('hero');
  const key = isVariant(raw) ? raw : DEFAULT_HERO_VARIANT;
  const Component = VARIANTS[key];
  return <Component />;
}
