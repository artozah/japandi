import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Spaces — Japandi",
  description: "AI-powered interior design editor.",
};

export default function SpacesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-dvh w-dvw overflow-hidden">{children}</div>
  );
}
