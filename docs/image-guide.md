# Image guide: sizes and shapes for every page

What to upload for each kind of image on the site, measured from how each
page actually displays it. Last updated 2026-09-30.

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

## Quick reference

| Image | Where it's set | Upload size | Shape |
|---|---|---|---|
| Homepage hero photo | "Homepage Hero Images" sheet tab | **2400 × 800** | 3:1 |
| Blog and Learn article image | Article draft ("Feature image") | **1600 × 900** | 16:9 |
| Photos inside an article | Article body | **1600 wide**, any height | Any |
| Provider main photo | Providers tab, Provider Photo URL (X) | **1200 × 1500** | 4:5 (portrait) |
| Provider secondary photos | Providers tab, Secondary Photo URLs (Y), up to 4 | **1600 × 1200** | 4:3 |
| Search result card photo | Providers tab, SRP Card Photo URL (Z) | **400 × 400** | 1:1 (square) |
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
- Any shape, **at least 1600 wide**. They display at the full width of the
  article column.
- Add them in the article body as `![description](Cloudinary URL)`. The
  description becomes the alt text.

### Provider main photo
- **Portrait, 4:5, e.g. 1200 × 1500.** Shown beside the bio on the provider
  page, and on that practice's SEM landing pages.
- Clicking it opens a full-size view, so a larger upload looks sharper.
- A building or team photo works better than a tight headshot.

### Provider secondary photos
- **Landscape, 4:3, e.g. 1600 × 1200**, up to 4, separated by semicolons in
  the cell.
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
