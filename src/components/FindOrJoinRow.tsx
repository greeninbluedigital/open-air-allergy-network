import Link from "next/link";
import { ZipSearchForm } from "@/components/ZipSearchForm";

/** Bottom-of-page provider search + For Practices panels (Homepage, About). */
export function FindOrJoinRow({ searchHeading }: { searchHeading: string }) {
  return (
    <div className="mx-6 my-7 grid grid-cols-1 gap-5 sm:mx-10 md:grid-cols-[2fr_1fr]">
      <div className="rounded border border-line bg-bg-alt p-6">
        <div className="mb-4 text-base font-semibold">{searchHeading}</div>
        <ZipSearchForm />
      </div>
      <div className="flex flex-col items-start justify-between gap-4 rounded border border-line bg-bg-alt p-6">
        <div className="text-base font-semibold">Are you a provider? Join the network.</div>
        <Link
          href="/for-practices"
          className="rounded border border-foreground/30 bg-white px-4 py-2.5 text-sm font-semibold whitespace-nowrap hover:border-foreground/60"
        >
          For Practices →
        </Link>
      </div>
    </div>
  );
}
