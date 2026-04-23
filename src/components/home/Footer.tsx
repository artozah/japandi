import Image from 'next/image';
import Link from 'next/link';
import type { SVGProps } from 'react';

const footerLinks = [
  { label: 'Home', href: '/' },
  { label: 'Spaces', href: '/spaces' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'Terms', href: '/terms-and-conditions' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Refund', href: '/refund' },
];

type SocialIcon = (props: SVGProps<SVGSVGElement>) => React.JSX.Element;

const socialLinks: { label: string; href: string; icon: SocialIcon }[] = [
  { label: 'Instagram', href: '#', icon: InstagramIcon },
  { label: 'X', href: '#', icon: XIcon },
  { label: 'YouTube', href: '#', icon: YouTubeIcon },
];

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-4 py-12 sm:flex-row sm:items-center sm:px-6 lg:px-8">
        <div>
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground"
          >
            <Image src="/logo_dark.svg" alt="Japandi" width={180} height={52} />
          </Link>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Transform Your Space with AI-Powered Interior Design Ideas
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
        <div className="mx-auto flex max-w-7xl flex-col-reverse items-start justify-between gap-3 px-4 py-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            {socialLinks.map(({ label, href, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                aria-label={label}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-accent-warm/40 hover:text-foreground"
              >
                <Icon className="h-3.5 w-3.5" />
              </Link>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Japandi. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function YouTubeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" />
    </svg>
  );
}
