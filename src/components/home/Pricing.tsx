import { PricingCards } from '@/components/home/PricingCards';

export function Pricing() {
  return (
    <section
      id="pricing"
      className="border-t border-border px-4 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Buy tokens to generate redesigns. 1 token = 1 image.
          </p>
        </div>

        <div className="mt-16">
          <PricingCards />
        </div>
      </div>
    </section>
  );
}
