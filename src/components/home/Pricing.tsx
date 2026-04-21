import { PricingCards } from '@/components/home/PricingCards';
import { Section, SectionHeader } from '@/components/home/Section';

export function Pricing() {
  return (
    <Section id="pricing">
      <SectionHeader
        eyebrow="Pricing"
        title="Pay for what you render."
        subtitle="Buy tokens to generate redesigns. 1 token = 1 image. No subscription required."
      />

      <div className="mt-16">
        <PricingCards />
      </div>

      <div className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-xs text-muted-foreground">
        <span>✓ 14-day refund</span>
        <span>✓ Tokens never expire</span>
        <span>✓ Commercial use included</span>
        <span>✓ Cancel anytime</span>
      </div>
    </Section>
  );
}
