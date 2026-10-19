import Link from "next/link";
import { MobileNav } from "./MobileNav";
import { DesktopNav } from "./DesktopNav";

export function SiteHeader() {
  return (
    <header className="relative z-20 flex items-center justify-between border-b border-line bg-background px-6 py-4 sm:px-10">
      <Link href="/" data-cta="nav_header_logo" className="shrink-0">
        {/* An SVG at a fixed height: crisp on every screen, and the alt text
            keeps the name for screen readers and search engines. */}
        {/* eslint-disable-next-line @next/next/no-img-element -- a small static SVG needs no image optimization */}
        <img src="/logo-stacked.svg" alt="Open Air Allergy Network" width={698} height={166} className="h-11 w-auto sm:h-12" />
      </Link>

      <DesktopNav />

      <MobileNav />
    </header>
  );
}
