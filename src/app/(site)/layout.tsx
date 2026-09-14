import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

/**
 * Shared chrome for every ordinary site page. SEM landing pages deliberately
 * opt out of this layout (their own route has a stripped header + minimal
 * footer instead) — see Section 9 of PROJECT_SPEC.md.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col">{children}</main>
      <SiteFooter />
    </>
  );
}
