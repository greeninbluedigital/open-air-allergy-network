import { Fragment } from "react";
import Link from "next/link";
import { clinicLinksFor } from "@/lib/regionalArticles";

/**
 * "Find an allergy clinic in Houston →" at the top of a regional guide
 * (owner, 2026-11-27), so a reader who came from a state page or a search
 * can get straight back to the practices for that area. Points at the
 * metro's section of the state page. Renders nothing on other articles.
 */
export async function ArticleClinicLink({ slug }: { slug: string }) {
  const links = await clinicLinksFor(slug);
  if (links.length === 0) return null;

  if (links.length === 1) {
    return (
      <p className="mb-6 text-sm">
        <Link href={links[0].href} data-cta="article_find_clinic" className="font-semibold text-sage hover:underline">
          Find an allergy clinic in {links[0].name} →
        </Link>
      </p>
    );
  }

  // "Find an allergy clinic in Kansas City or St. Louis", each place its own link.
  return (
    <p className="mb-6 text-sm text-foreground/80">
      Find an allergy clinic in{" "}
      {links.map((l, i) => (
        <Fragment key={l.href}>
          {i > 0 && (i === links.length - 1 ? " or " : ", ")}
          <Link href={l.href} data-cta="article_find_clinic" className="font-semibold text-sage hover:underline">
            {l.name}
            {i === links.length - 1 && " →"}
          </Link>
        </Fragment>
      ))}
    </p>
  );
}
