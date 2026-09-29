"use client";

import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/track";

/**
 * An outbound link (opens in a new tab) that logs a lead action for the
 * practice on click: its website, or its address on Google Maps. Opening in a
 * new tab keeps this page alive, so the keepalive request always gets out.
 */
export function TrackedLink({
  href,
  type,
  providerId,
  className,
  children,
}: {
  href: string;
  type: "WEBSITE_CLICK" | "ADDRESS_CLICK";
  providerId: string;
  className?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => trackEvent(type, { providerId, path: pathname })}
    >
      {children}
    </a>
  );
}
