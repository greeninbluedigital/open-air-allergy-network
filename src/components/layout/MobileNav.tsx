"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS, isCurrentNav } from "./nav-links";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 flex-col items-center justify-center gap-1.5"
      >
        <span
          className={`h-0.5 w-6 bg-foreground transition-transform ${open ? "translate-y-2 rotate-45" : ""}`}
        />
        <span
          className={`h-0.5 w-6 bg-foreground transition-opacity ${open ? "opacity-0" : ""}`}
        />
        <span
          className={`h-0.5 w-6 bg-foreground transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`}
        />
      </button>

      {open && (
        <nav className="absolute inset-x-0 top-full flex flex-col border-b border-line bg-background px-6 py-4 shadow-sm">
          {NAV_LINKS.map((link) => {
            const current = isCurrentNav(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                data-cta="nav_mobile"
                aria-current={current ? "page" : undefined}
                onClick={() => setOpen(false)}
                className={`border-b border-line py-3 text-sm last:border-none ${
                  current ? "-mx-3 rounded bg-action px-3 font-semibold text-white" : "text-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
