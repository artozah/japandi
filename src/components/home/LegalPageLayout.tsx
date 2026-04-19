import type { ReactNode } from 'react';
import { Footer } from '@/components/home/Footer';
import { Header } from '@/components/home/Header';
import { SUPPORT_EMAIL } from '@/lib/contact';

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}

export function LegalPageLayout({
  title,
  lastUpdated,
  children,
}: LegalPageLayoutProps) {
  return (
    <>
      <Header />
      <main className="flex-1">
        <article
          className="mx-auto max-w-3xl px-4 py-24 text-base leading-7 text-muted-foreground [&_h2]:mt-12 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-foreground [&_p]:mt-4 [&_strong]:font-medium [&_strong]:text-foreground [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 sm:py-32"
        >
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Last updated: {lastUpdated}
          </p>
          {children}
        </article>
      </main>
      <Footer />
    </>
  );
}

export function SupportEmailLink() {
  return (
    <a
      href={`mailto:${SUPPORT_EMAIL}`}
      className="font-medium text-foreground underline"
    >
      {SUPPORT_EMAIL}
    </a>
  );
}
