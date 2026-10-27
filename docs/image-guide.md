# Image guide: sizes and shapes for every page

What to upload for each kind of image on the site, measured from how each
page actually displays it. Last updated 2026-10-06.

## The basics (every image)

- **Host on Cloudinary.** The site only loads images from
  `res.cloudinary.com`. Paste the image's Cloudinary URL into the sheet or
  the article draft.
- **JPG at about 80% quality** for photos. Upload the full-size file; the
  site resizes it for each screen.
- **Descriptive filenames** (e.g. `blog-allergy-skin-test-vs-blood-test.jpg`).
  Cloudinary puts the filename in the image's URL, which helps image search
  a little.
- **Write alt text** describing what's in the photo, wherever there's a
  field for it. Screen readers read it aloud, and Google uses it.
- **Keep the subject in the middle.** Most images are cropped differently on
  phones and computers, so edges get trimmed.
- **Free stock photos:** Unsplash and Pexels allow commercial use without
  credit. Avoid showing an identifiable person as sick, avoid visible brand
  names, and skip needles (they put people off).

## Image style (owner's direction, 2026-10-06)

- **Realistic over obviously generated.** Photos, or images that pass as
  photos: real materials and light (a wooden desk, a paper planner, a
  stethoscope, a plant), not flat, glossy or floating "AI render" scenes.
- **Saturated, warm color.** Rich, natural color reads more professional
  than washed-out grays. It also matches the homepage hero photos.
- **A clear subject tied to the article,** set in a real place. The
  allergy shots article's open planner with circled appointments is the
  reference example
  (`allergy-treatment-appointment-schedule.jpg` on Cloudinary).

## Quick reference

| Image | Where it's set | Upload size | Shape |
|---|---|---|---|
| Homepage hero photo | "Homepage Hero Images" sheet tab | **2400 × 800** | 3:1 |
| Blog and Learn article image | Article draft ("Feature image") | **1600 × 900** | 16:9 |
| Photos inside an article | Article body (wraps beside the text) | **1200 × 1500** | 4:5 portrait |
| Provider main photo | Providers tab, Provider Photo URL (AC) | **1200 × 1500** | 4:5 (portrait) |
| Provider secondary photos | Providers tab, Secondary Photo URLs (AD), up to 4 | **1600 × 1200** | 4:3 |
| Search result card photo | Providers tab, SRP Card Photo URL (AE) | **400 × 400** | 1:1 (square) |
| Article author photo | Practitioners tab, Practitioner Thumbnail URL (E) | **400 × 400**, face centered | 1:1 |
| Learn About ILIT hero | Set in the site code (ask Claude) | **2400 wide**, landscape | About 3:1 or wider |

## Details

### Homepage hero photo
- **2400 × 800 (3:1).** On laptops and desktops the hero is exactly 3:1
  (capped at 600 pixels tall on very wide screens), so the whole photo
  shows. Phones and tablets show a center slice.
- The search box covers the **lower left** on desktop, so keep the subject
  clear of it, in the middle half of the frame.
- Bright, saturated, nature-forward photos match the current set.
- After adding new photos, ask Claude to run the image **warm-up**, so the
  first visitors don't wait for resizing.
- A photo that won't crop to 3:1 can be widened with Cloudinary's AI fill,
  but extending one side only, with a small added area, works best. Large
  extensions leave a visible blur seam.

### Blog and Learn article image
- **1600 × 900 (16:9).** One image covers both the article header and the
  article's card on the Blog and Learn pages.
- The article header shows a wide slice (about 2:1 on computers, closer to
  4:3 on phones), and the cards show 16:9. Keep the subject centered.
- Also used when the article is shared on social media.
- Give it alt text in the draft ("Image alt").

### Photos inside an article
- **Standard (owner, 2026-10-24): portrait, wrapped.** Every photo inside an
  article floats on the right with the text wrapping around it, so it never
  makes a big full-width break.
- **Size: 1200 × 1500 (4:5, portrait).** 3:4 also works. It shows at up to
  280px wide on laptops (about 40% of the column) and centered at a smaller
  size on phones; 1200 wide keeps it sharp on high resolution screens. Any
  file size or format is fine: the page serves a resized, compressed copy.
  Minimum 600 × 750.
- Add it in the body on a line of its own, just before the paragraph it
  belongs beside: `![alt text](Cloudinary URL "Caption text")`. The caption
  in quotes is optional and shows under the photo. The next `##` heading
  always starts below the photo.
- **Exception, full width:** start the caption with `full:` for a wide chart
  or diagram that needs the whole column, e.g.
  `![alt](URL "full: Caption")`. Size 1600 wide, any height.
- **Gallery row (2026-10-27):** two or three images on consecutive lines
  (no blank line between them) show side by side, each cropped to 4:3 with
  its caption underneath, stacked on phones. Landscape, about 1600 wide.
  Put each photo's credit in its caption, and for any image whose license
  asks for a link (Creative Commons), add an italic "Image credits" line at
  the end of the article with the source and license links. First used for
  the dust mite micrographs in "What Do Dust Mites Look Like?".

### Provider main photo
- **Portrait, 4:5, e.g. 1200 × 1500.** Shown beside the bio on the provider
  page (Verified and up), and on that practice's SEM landing pages.
- Clicking it opens a full-size view, so a larger upload looks sharper.
- A building or team photo works better than a tight headshot.

### Provider secondary photos
- **Landscape, 4:3, e.g. 1600 × 1200**, up to 4, separated by semicolons in
  the cell. Full Profile and Featured only.
- Shown as a row of thumbnails under the bio. Each opens full size when
  clicked.

### Search result card photo
- **Square, 400 × 400** (shown at 64 × 64 pixels, so 400 keeps it sharp on
  high-resolution screens).
- Kept separate from the main photo on purpose: a portrait photo crops
  badly into a small square. A logo or a simple, recognizable photo reads
  best at this size.
- Only shown for Full Profile and Featured practices. Blank shows no photo,
  not a placeholder.

### Article author photo
- **Square, 400 × 400**, with the face roughly centered. The site finds the
  face automatically and crops it into a small circle beside the "Contributed
  by" or "Medically reviewed by" credit.
- It must be a photo of that specific person, not a general practice photo.
- Set once per person on the Practitioners tab (column E). It shows on every
  article that person is credited on.

### Learn About ILIT hero
- Set in the site code rather than the sheet, so ask Claude to change it.
- **At least 2400 wide**, landscape. The page darkens the photo slightly and
  puts white text over its left side, so a calm scene with no important
  detail on the left works best.

## Not yet set up
- **Logo:** when it's designed, Claude adds it to the header and to the
  site's structured data. A square version (at least 512 × 512) will also be
  useful for search results and social profiles.
  - **Header size:** shown about **40 pixels tall** on computers and about
    **32 tall** on phones. On tablets it must fit in about **180 pixels of
    width** beside the menu, so the shape should be no wider than about
    4.5:1. A one-line "Open Air Allergy Network" at 40 tall would be about
    350 wide, so plan a stacked version (icon plus two lines of text) or an
    icon plus a shorter wordmark.
  - **File:** SVG is best (sharp at every size, tiny file). Otherwise a
    transparent PNG at 3× display size (about 120 pixels tall), trimmed with
    no empty margin around it.
- **Social sharing for provider pages:** shared links use the provider's main
  photo, which is portrait. Social sites crop it to a wide rectangle, so
  part of the photo gets cut off. A dedicated landscape share image would
  fix that if it ever matters.

## Generic photos for practice pages (2026-10-09)

Practice pages without a photo of their own show a generic allergen photo
instead, listed in `src/lib/stockPhotos.ts` (Cloudinary URL plus alt text that
describes the photo, never the practice). Basic listings always use one, even
if the sheet has a practice photo, since there's no permission to show their
own. Trial pages use the practice's Provider Photo URL (AC) when it's filled
in. Each page keeps the same photo on every visit (picked from its slug).
Stock photos never go into structured data or social previews.

To add one: upload a 4:5 portrait (realistic, saturated, real setting; no
faces, no clinic interiors that could pass for a practice's office) and ask
Claude to add it with alt text. Check what the plant actually is: an
early "ragweed" upload turned out to be goldenrod, the plant people wrongly
blame for hay fever. In use (2026-10-09): two oaks, dust in a sunbeam, a
grassy hillside, a ragweed field (AI generated, checked for accuracy) and a
pine cone.

## Brand logo (added 2026-10-18)

Masters live in OneDrive (OPEN AIR ALLERGY NETWORK/logo): the v15 open blue
circle (#0077D6) with a green smile (#008A4A), and a Corbel wordmark
converted to outlines. In the site:

| File | Used for |
|---|---|
| `public/logo-stacked.svg` | Site header (44 px tall on phones, 48 px from `sm`) and landing page header (40 px), since 2026-10-18. The stacked master with its margins trimmed (viewBox only, measured from the rendered artwork). Two lines give bigger letters in less width than the horizontal logo |
| `public/logo.svg` | Spare horizontal logo, not used in the headers now. The master SVG with its empty margins trimmed (viewBox only, measured from the rendered artwork). When replacing it, check the master is valid XML: the 2026-10-18 update had an unclosed `<g>`, which browsers refuse to draw |
| `src/app/icon.svg`, `src/app/favicon.ico` (16, 32, 48 px, built from the 512 px icon) | Browser tab and Google's search result icon |
| `src/app/apple-icon.png` (180 px, white background) | iPhone home screen |
| `src/app/opengraph-image.png`, `twitter-image.png` (1200 x 630) | Default share image. Pages with their own photo (articles, practices) use it instead; pages that set their own share text use `DEFAULT_OG_IMAGE` (`src/lib/metadata.ts`) |
| `public/logo-icon-512.png` | `logo` in the homepage's Organization structured data |
| `public/logo-1200x240.png` | Spare PNG of the horizontal logo (emails, documents) |
