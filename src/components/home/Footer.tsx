import Link from "next/link";

const footerLinks = [
  { label: "Home", href: "/" },
  { label: "Spaces", href: "/spaces" },
  { label: "Pricing", href: "#pricing" },
  { label: "Privacy", href: "#privacy" },
];

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-4 py-12 sm:flex-row sm:items-center sm:px-6 lg:px-8">
        <div>
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-foreground"
          >
            Japandi
          </Link>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            AI-powered interior design inspired by the Japandi aesthetic.
          </p>
        </div>

        <nav className="flex flex-wrap gap-6">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl justify-end px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Japandi. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
