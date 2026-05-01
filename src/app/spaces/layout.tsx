import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { ensureUserRow, requireUserId } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Spaces — Envisio',
  description: 'AI-powered interior design editor.',
};

export default async function SpacesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await requireUserId();
  await ensureUserRow(userId);

  return (
    <div className="h-dvh w-dvw overflow-hidden">
      {children}
      <Toaster richColors position="top-right" />
    </div>
  );
}
