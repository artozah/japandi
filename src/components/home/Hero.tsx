'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSignInGate } from '@/hooks/useSignInGate';

export function Hero() {
  const gate = useSignInGate();

  return (
    <section className="flex flex-col items-center justify-center px-4 py-24 text-center sm:py-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="mx-auto max-w-3xl"
      >
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Design Your Space with
          <br />
          <span className="text-muted-foreground">AI-Powered Simplicity</span>
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl">
          Upload a photo of any room and let our AI redesign it to match your
          preferred style — new look, new mood, and instant results.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/spaces"
            onClick={(e) => gate('/spaces', e)}
            className="inline-flex h-11 items-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Start Designing
          </Link>
          <Link
            href="#how-it-works"
            className="inline-flex h-11 items-center rounded-md border border-border px-6 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            See How It Works
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
