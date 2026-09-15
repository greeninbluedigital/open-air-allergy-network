import { StrippedHeader } from "@/components/layout/StrippedHeader";
import { MinimalFooter } from "@/components/layout/SiteFooter";

/** SEM landing pages get their own stripped chrome — deliberately outside
 * the (site) route group's SiteHeader/SiteFooter. See Section 9. */
export default function LpLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StrippedHeader />
      <main className="flex flex-1 flex-col">{children}</main>
      <MinimalFooter />
    </>
  );
}
