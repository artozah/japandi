import { Upload, Sparkles, Download } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload Your Space",
    description:
      "Take a photo of any room and upload it to our platform. We support all common image formats.",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "AI Transforms It",
    description:
      "Our AI analyzes your space and generates stunning Japandi-inspired redesigns in seconds.",
  },
  {
    number: "03",
    icon: Download,
    title: "Download & Share",
    description:
      "Save your favorite designs, compare variations, and share them with friends or your designer.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-border px-4 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Three simple steps to your dream interior.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className="relative rounded-xl border border-border bg-card p-8"
            >
              <span className="text-xs font-semibold text-muted-foreground">
                {step.number}
              </span>
              <div className="mt-4 flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <step.icon className="h-5 w-5 text-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
