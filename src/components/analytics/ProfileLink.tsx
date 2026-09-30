"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/track";

/**
 * SEM landing page link to the practice's full profile. Clicks are logged as
 * PROFILE_CLICK, a soft lead in practice reports (docs/analytics.md), and
 * sent to GA4 as oaan_profile_click.
 */
export function ProfileLink({
  href,
  providerId,
  providerName,
  className,
  children,
}: {
  href: string;
  providerId: string;
  providerName: string;
  className?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <Link
      href={href}
      className={className}
      onClick={() => trackEvent("PROFILE_CLICK", { providerId, providerName, path: pathname })}
    >
      {children}
    </Link>
  );
}
