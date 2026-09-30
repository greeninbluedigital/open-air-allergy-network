import Link from "next/link";
import { MobileNav } from "./MobileNav";
import { DesktopNav } from "./DesktopNav";

export function SiteHeader() {
  return (
    <header className="relative z-20 flex items-center justify-between border-b border-line bg-background px-6 py-4 sm:px-10">
      <Link href="/" data-cta="nav_header_logo" className="text-lg font-bold">
        Open Air Allergy Network
      </Link>

      <DesktopNav />

      <MobileNav />
    </header>
  );
}
