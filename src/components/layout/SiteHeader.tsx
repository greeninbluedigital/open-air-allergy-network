import Link from "next/link";
import { MobileNav } from "./MobileNav";
import { NAV_LINKS } from "./nav-links";

export function SiteHeader() {
  return (
    <header className="relative z-20 flex items-center justify-between border-b border-line bg-background px-6 py-4 sm:px-10">
      <Link href="/" className="text-lg font-bold">
        Open Air Allergy Network
      </Link>

      <nav className="hidden gap-6 text-sm text-foreground/80 md:flex">
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="hover:text-foreground">
            {link.label}
          </Link>
        ))}
      </nav>

      <MobileNav />
    </header>
  );
}
