import Link from "next/link";

const YEAR = new Date().getFullYear();

const LEGAL_LINKS = [
  { href: "/legal/privacy-notice", label: "Privacy Notice" },
  { href: "/legal/terms-and-conditions", label: "Terms & Conditions" },
  { href: "/legal/cookie-policy", label: "Cookie Policy" },
  { href: "/legal/privacy-choices", label: "My Privacy Choices" },
  { href: "/legal/medical-disclaimer", label: "Medical Disclaimer" },
  { href: "/legal/accessibility-statement", label: "Accessibility Statement" },
];

/**
 * Full footer on every page except the SEM landing page (Section 9), which
 * uses <MinimalFooter> instead — just the two links a data-collecting contact
 * form legally needs, without reintroducing the stripped page's nav/footer.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-line px-6 py-10 text-sm text-muted sm:px-10">
      <div className="flex flex-col justify-between gap-8 sm:flex-row sm:gap-6">
        <div className="flex flex-col gap-2">
          <div className="mb-1 text-xs font-semibold tracking-wide text-muted uppercase">
            Explore
          </div>
          <Link href="/learn-about-ilit" className="text-foreground/80 hover:text-foreground">
            Learn About ILIT
          </Link>
          <Link href="/find-an-ilit-provider" className="text-foreground/80 hover:text-foreground">
            Find a Provider
          </Link>
          <Link href="/blog" className="text-foreground/80 hover:text-foreground">
            Blog
          </Link>
        </div>

        <div className="flex flex-col gap-2">
          <div className="mb-1 text-xs font-semibold tracking-wide text-muted uppercase">
            Organization
          </div>
          <Link href="/about" className="text-foreground/80 hover:text-foreground">
            About
          </Link>
          <Link href="/about#contact" className="text-foreground/80 hover:text-foreground">
            Contact
          </Link>
          <Link href="/for-practices" className="text-foreground/80 hover:text-foreground">
            For Practices
          </Link>
        </div>

        <div className="flex flex-col gap-2">
          <div className="mb-1 text-xs font-semibold tracking-wide text-muted uppercase">
            Legal
          </div>
          {LEGAL_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-foreground/80 hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 border-t border-line pt-4 text-xs">
        <span>© {YEAR} Open Air Allergy Network</span>
      </div>
    </footer>
  );
}

export function MinimalFooter() {
  return (
    <footer className="border-t border-line px-6 py-6 text-xs text-muted sm:px-10">
      <div className="flex flex-wrap items-center gap-4">
        <Link href="/legal/privacy-notice" className="text-foreground/80 hover:text-foreground">
          Privacy Notice
        </Link>
        <Link href="/legal/terms-and-conditions" className="text-foreground/80 hover:text-foreground">
          Terms & Conditions
        </Link>
        <span>© {YEAR} Open Air Allergy Network</span>
      </div>
    </footer>
  );
}
