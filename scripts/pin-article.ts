/**
 * Pins and unpins articles in an Article Feed slot (Article.pinnedTo), e.g.
 * the blog landing page's Featured row ("blog_featured", up to 3 articles).
 *
 *   npx tsx scripts/pin-article.ts blog_featured --list
 *   npx tsx scripts/pin-article.ts blog_featured --add pets-ranked-by-allergies --remove how-long-do-cat-allergy-symptoms-last
 *
 * Clears the live site's article cache afterward so the change shows.
 */
import "dotenv/config";
import { db } from "@/lib/db";
import { refreshLiveSite } from "@/lib/liveCache";

async function main() {
  const [slot, ...rest] = process.argv.slice(2);
  if (!slot) throw new Error("Usage: pin-article.ts <slot> [--list] [--add <slug>] [--remove <slug>]");
  const arg = (name: string) => {
    const i = rest.indexOf(name);
    return i === -1 ? undefined : rest[i + 1];
  };
  const add = arg("--add");
  const remove = arg("--remove");

  if (remove) {
    const r = await db.article.updateMany({ where: { slug: remove, pinnedTo: slot }, data: { pinnedTo: null } });
    if (r.count === 0) throw new Error(`${remove} isn't pinned to ${slot}`);
    console.log(`Unpinned ${remove}`);
  }
  if (add) {
    const r = await db.article.updateMany({ where: { slug: add }, data: { pinnedTo: slot } });
    if (r.count === 0) throw new Error(`No article with slug ${add}`);
    console.log(`Pinned ${add}`);
  }

  const pinned = await db.article.findMany({ where: { pinnedTo: slot }, select: { slug: true }, orderBy: { publishedDate: "desc" } });
  console.log(`${slot}: ${pinned.map((a) => a.slug).join(", ") || "(none)"}`);
  if (add || remove) console.log(`Live site cache: ${await refreshLiveSite("articles")}`);
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
