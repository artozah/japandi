import type { Metadata } from 'next';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Spaces — Japandi',
  description: 'AI-powered interior design editor.',
};

export default function SpacesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-dvh w-dvw overflow-hidden">
      {children}
      <Toaster richColors position="top-right" />
    </div>
  );
}
