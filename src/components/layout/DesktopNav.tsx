"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS, isCurrentNav } from "./nav-links";

/** Header links at md and up. The current section gets an outlined green pill:
 * the button green, but on white, so it doesn't read as a button. */
export function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-1 text-sm md:flex">
      {NAV_LINKS.map((link) => {
        const current = isCurrentNav(pathname, link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            data-cta="nav_header"
            aria-current={current ? "page" : undefined}
            className={`rounded border px-3 py-1.5 transition-colors ${
              current
                ? "border-action bg-white font-bold text-action"
                : "border-transparent text-foreground/80 underline-offset-4 hover:underline"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
