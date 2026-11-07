# BAKE Studio: architecture

This describes BAKE Studio as it is now (November 2026, project format **v3**). It is a static web app with no server and no build step, published by GitHub Pages from `deltaowleyes/bake-studio` (branch `main`, folder `/`). Live: https://deltaowleyes.ca/bake-studio/ (the repo's GitHub Pages address, https://deltaowleyes.github.io/bake-studio/, redirects there because of the custom domain).

## 1. What it does

A five-step wizard that turns an existing website (or a blank start) into previews of a new site in many templates, then ends with a development request.

| Step | Name | Purpose |
|---|---|---|
| 1 | Your site | Import a site by URL or pasted code (home page plus its other pages), or create a starter site |
| 2 | Brand | Logo, hero image, illustrations (generated SVG, upload, AI, or any image from the site), colours, fonts |
| 3 | Sections | Choose a page; add, delete, reorder and edit its sections and items, including images |
| 4 | Menu | Edit menu links and groups; choose a menu style for each screen size (desktop, tablet, phone) |
| 5 | Templates | Browse templates that fit, preview any page at all sizes, pick one, request development |

**Design rules that shape the code:**
- **No live page code in the studio.** Previews are PNG/JPEG screenshots, so the generated HTML is never left in the DOM.
- **No downloads.** There's no HTML or project export; the only exit is "Request development".
- **Everything runs in the browser.** State is saved to `localStorage` until Supabase is added.

## 2. File structure

```
bake-studio/
├── index.html          Studio shell: header, step nav, one <section> per step, image picker <dialog>
├── README.md           Short overview for people browsing the repo
├── ARCHITECTURE.md     This file
├── css/
│   ├── studio.css      Look of the studio itself (cards, buttons, grids, picker, light/dark)
│   └── site.css        Look of the GENERATED website (scoped to .pv); also fed into screenshots
└── js/                 Plain scripts, loaded in this order (each defines one global)
    ├── art.js          Art       palettes, font pairs, colour maths, SVG logo/hero/illustration generators
    ├── importer.js     Importer  fetch + parse an existing page into a project-shaped result
    ├── render.js       Render    project + template → page HTML string; templates and compatibility
    ├── shot.js         Shot      page HTML → full-page image (SVG foreignObject → canvas → blob URL)
    └── app.js          (IIFE)    state, saving, the five steps' UI and all event handling; exposes window.BAKE
```

**Loading:** script tags carry a cache-busting query (`?v=8` at the time of writing). Bump it in `index.html` whenever JS or CSS changes, or browsers may keep old files for up to 10 minutes.

**Module dependencies:** `importer` → `art` (colour maths); `render` → `art`; `shot` → (fetches `css/site.css`); `app` → all four.

## 3. Project state (`S`)

One plain object, created by `blank()` in `app.js` and saved whole as JSON under the `localStorage` key `bake-studio-v2`. (The key name is historical; the format version lives in `S.v`.)

```js
S = {
  v: 3,                       // format version (v2 is migrated on load, see §3.3)
  step: 1,                    // current step, 1–5 (also mirrored in the URL hash #step-N)

  source: {                   // step 1
    has: true,                // "Yes, import it" vs "No, start fresh"
    url: 'https://…',         // address typed by the user
    log: [[text, cls], …],    // import progress lines shown under the URL box
    found: { url, colours, name } | null   // summary of the last home-page import
  },

  biz: { name, desc },        // business name and one-line description

  brand: {
    pal: { name, bg, ink, acc, soft },     // live palette: background, text, accent, soft panels
    palFound: {…} | null,     // palette detected from the imported site (offered first)
    font: 0,                  // index into Art.FONTS
    seed: { logo, hero, ill },// counters so "Generate more" gives new SVG options
    opts: {                   // candidate assets per kind
      logo: [Asset], hero: [Asset], ill: [Asset]
    },
    pick: { logo: id, hero: id, ill: id }, // the asset "In use" for each kind
    star: { [assetId]: true } // starred assets (starred illustrations fill cards and galleries)
  },

  pages: [Page],              // pages[0] is always Home
  lib: [LibImage],            // every image found on the imported site(s), max 400

  footer: { motto, text },

  menu: {
    items: [MenuItem],        // shared by all pages
    cta: { label, href },     // optional header button
    vp: {                     // menu style per screen size
      desktop: MenuConfig, tablet: MenuConfig, phone: MenuConfig
    }
  },

  tpl: { pick, view, fav: { [tplId]: true }, all, favOnly },  // step 5
  notes: [Request],           // development requests (newest first)
  req: { name, email },       // remembered contact details for requests
  ai: { endpoint: '' },       // AI image service URL; empty means sample artwork only

  ui: {                       // view state, saved too so a reload returns to the same place
    vp: 'desktop',            // preview size in steps 2–3
    tvp: 'all',               // preview size in step 5 ('all' = desktop + tablet + phone)
    mvp: 'desktop',           // screen size being configured in step 4
    btab: 'logo', bsrc: 'svg',// step 2 asset tab and source tab ('svg' | 'upload' | 'ai' | 'site')
    sel: sectionId | 'footer',// section being edited in step 3
    page: pageId,             // page being edited in step 3
    tpage: pageId,            // page previewed in step 5
    open: false,              // step 4 "Show the menu open"
    prompt: { logo, hero, ill }, // edited AI prompts
    pasteFor: pageId | null,  // which page the "Paste code" box is importing
    libq: ''                  // search text for site images in step 2
  }
}
```

### 3.1 Shapes

```js
Asset      = { id, kind: 'svg', from: 'svg' | 'ai', mark|lay|up (logo) | k|s (hero/ill) }   // drawn by Art
           | { id, kind: 'img', src, from: 'site' | 'upload' | 'ai', label }               // a real image
LibImage   = { id, src, label, logo: bool }      // logo = "looks like a logo" (sorted first in logo pickers)
Page       = { id, name, url, status: 'imported' | 'waiting' | 'importing' | 'blocked' | 'new', sections: [Section] }
Section    = { id, type, title, text, …typeFields, items?: [Item], bg?, align?, image? }
Item       = { id, title, text, link, linkText, eyebrow?, duration?, image? }
ImageRef   = undefined (template default) | null (no image)
           | { kind: 'hero' } | { kind: 'ill', i } | { kind: 'img', src, label? }
MenuItem   = { id, label, href } | { id, label, href, children: [MenuItem] }   // a group has children
MenuConfig = { type: 'bar' | 'mega' | 'split' | 'hamburger' | 'bottom', logo: 'left' | 'center', sticky, cta, search }
Request    = { id, at (ms), name, email, text, tpl, status: 'Requested', summary: { sections: [titles], menu: [labels] } }
```

### 3.2 Section types (`Render.SECTION_TYPES`)

| type | Shown as | Key fields | Items |
|---|---|---|---|
| `hero` | Hero banner | eyebrow, title, text, linkText/link, link2Text/link2, layout, image | none |
| `pagehead` | Page header (inner pages) | title, text, image | none |
| `tiles` | Card grid | title, text, moreText/moreLink, cols (2–4), style, showImg | image, eyebrow, title, text, link, linkText |
| `feature` | Featured story | title, moreText/moreLink, eyebrow, headline, text, linkText/link, style, image | none |
| `list` | Link list | title, text, linkText/link | title, text, linkText, link |
| `text` | Text block | title, text (blank line = paragraph), linkText/link, image | none |
| `videos` | Video gallery | title, text, moreText/moreLink, style (`lead` / `grid` / `row`) | image (thumbnail), title, eyebrow, duration, link |
| `podcast` | Podcasts / audio | title, text, moreText/moreLink | image, title, text, link |
| `stats` | Numbers | title, text | title (number), text (label) |
| `gallery` | Gallery | title, text | image, title (caption) |
| `testimonial` | Quotes | title | text (quote), title (name) |
| `cta` | Call to action | title, text, linkText/link | none |
| `contact` | Contact details | title, text, linkText/link | title (label), text (value), link |

Every section also takes `bg` (`auto`, `default`, `soft`, `ink`, `acc`) and `align` (`auto`, `center`). The editable fields per type are defined in `FIELDS` and `ITEMF` in `app.js`. A field kind of `pick` opens the image picker.

### 3.3 Saving, loading and migration

- **Saving:** `save()` writes the whole `S` 250 ms after the last change. If the browser's storage is full (usually from large uploads), a warning banner appears.
- **Loading:** `load()` reads the key. A **v2** project (one page, `S.sections`) is converted to v3: its sections become `pages[0]` ("Home"), and site images found in `brand.opts` seed `lib`. Missing top-level keys and `ui` keys are filled from `blank()`.
- **Start over** clears the key and reloads.
- **Images in state:** uploads are stored as data URLs (shrunk to 1600 px for hero images, 700 px otherwise, WebP). Site images are stored as URLs only.

## 4. Logic per step

### Step 1: Your site
- **Import:** `Importer.fetchHtml(url)` then `runImport()` → `Importer.analyse(html, url)` → `applyImport(result)`. Most sites block this (browser CORS rules). When that happens, the user is offered **Paste code**: `#paste` → `analyse(html, url)`.
- **`applyImport` builds the project:**
  - `lib` = all found images.
  - Logo options = images flagged as logos, preferring ones whose label matches the site name.
  - Hero options = the first non-logo images.
  - SVG options are added for all three asset kinds.
  - The palette and font come from the site.
  - `pages[0]` = a suggested `hero` section plus the imported sections.
  - Each internal menu link becomes a placeholder page with status `waiting`.
  - The menu is imported, with Contact as the header button if one is found.
- **Other pages:** "Import" or "Import all pages" calls `importPage(page)` (fetch, then `analyse(…, {inner: true})`). The result replaces the page's sections, which start with a `pagehead`, and new images merge into `lib`. A page that blocks importing gets status `blocked`, and its **Paste code** button sets `ui.pasteFor`.
- **Fresh start:** `starter(kind)` (community, food, shop, services) creates Home sections plus one placeholder page per menu item.

### Step 2: Brand
- Asset tabs: logo, hero, illustrations. Source tabs:
  - **Generated:** `genSvg` keeps starred and in-use options and adds 6 new seeded ones.
  - **Upload:** `shrink()` turns the file into a data URL.
  - **AI images:** if `S.ai.endpoint` is set, it POSTs `{prompt, type, n: 4}` and expects `{images: [url]}`. Otherwise it adds seeded sample SVGs labelled "Sample for: …".
  - **From your site:** lists `lib` (searchable, logo-like images first, add an image by link). Choosing one copies it into `brand.opts` through `libOpt()`.
- Palettes: the site palette plus 8 presets; each colour can be edited with a colour picker. There are 6 font pairs.

### Step 3: Sections
- **Page bar:** choose a page (`ui.page`), add, rename or delete pages (Home can't be deleted).
- **The list** works on `SEC()` (the current page's sections): select, move up/down, delete, or add a section of any type after the selected one (`defaultSection`).
- **The editor** is built from `FIELDS[type]` + background/alignment + `ITEMF[type]` for items (add, move, delete). Inputs update `S` straight away and refresh the preview after 120 ms.
- **Image picker** (`<dialog id="picker">`): no image, the hero, illustrations 1–3, uploads (or upload a new one), and every `lib` image (searchable). The choice is stored as an `ImageRef`.
- **Clicking the preview screenshot** finds the section under the click (using section positions recorded by `Shot`) and selects it.

### Step 4: Menu
- Each screen size has its own `MenuConfig`. Allowed types: desktop `bar`, `mega`, `split`, `hamburger`; tablet `bar`, `split`, `hamburger`, `bottom`; phone `hamburger`, `bottom`. Options: logo position, sticky header, search, show button. A button copies the current style to the other sizes where it's allowed.
- **Link editor:** labels and links for top-level items and groups. You can move items, delete them, move a link into the group above, move it out of a group, and add sub-links, links or groups. The header button's label and link are set here too.
- The preview always shows Home. "Show the menu open" renders the `<details>` menus open.

### Step 5: Templates
- **Templates:** `Render.TEMPLATES` = 8 families × 3 variants = **24**.
  - Families: Newsroom, App grid, Magazine, Minimal, Bold blocks, Community portal, Storyteller, Notice board.
  - Variants: Classic (square corners), Soft (rounded corners, soft bands), Crisp (tight spacing, dark bands).
- **Fit check:** `Render.compat(template, S)` looks at every page's sections. A template doesn't fit if:
  - it doesn't offer the chosen **desktop** menu style;
  - a section type it can't show is used (Minimal: gallery);
  - a card grid has more cards than it allows (Storyteller: 6);
  - the site has neither a card grid nor a link list (Notice board needs one).
  Templates that don't fit are hidden unless "Show templates that don't fit" is ticked, and then they show the reasons.
- **Thumbnails** are made one after another: the Home page at 1280 px, cropped to 960 px, at half scale, JPEG.
- **The preview** shows the chosen page (`ui.tpage`) at all sizes or one size, with previous/next buttons and "Use this template" (`tpl.pick`).
- **Request development** needs a picked template, a name and a valid email. It adds a `Request` to `S.notes` (saved locally for now).

## 5. Rendering pipeline

```
S + template id + {pageId, sel, openMenu}
   │  Render.page()
   ▼
<div class="pv tf-{family} tv-{variant} dn-{density}" style="--bg --ink --acc --soft --oa --oi --line --mute --card --hf --bf --hw --r">
   ├─ <div class="vh vh-d">header(desktop)</div>   three headers; the visible one is chosen by
   ├─ <div class="vh vh-t">header(tablet)</div>    container queries on the frame width
   ├─ <div class="vh vh-p">header(phone)</div>     (≥1024 desktop, 600–1023 tablet, <600 phone)
   ├─ <main> sections of the page, each <section data-sec="id" class="s s-{type} bg-… al-…"> </main>
   ├─ <footer class="ft"> logo, motto, all links, bottom line </footer>
   └─ bottom tab bars (tablet/phone) when that menu type is chosen
   │  Shot.take(html, width, {maxH, scale, type})
   ▼
 1. Put the HTML in a hidden off-screen .cq box at the target width (so container queries apply).
 2. Turn every <img> into a data URL (fetch → FileReader). Images that can't be fetched are dropped.
    `loading="lazy"` is removed first, because lazy images never load off-screen.
 3. Measure the full height and each [data-sec] position (used for click-to-select).
 4. Serialize to XHTML and wrap it with the contents of css/site.css in <svg><foreignObject>.
 5. Draw it on a canvas (scale 1 for desktop, 2 for tablet/phone, 0.5 for thumbnails) → blob URL.
 6. Results are cached by width + options + HTML (last 80).
```

- **How template differences work:** in `render.js`, each family has defaults for `hero` layout, `tiles` style, `feature` style and `videos` layout (`lead`, `grid` or `row`). In `site.css`, `.tf-{family}` rules adjust typography, headers, bands and panels. A section's own `layout` or `style` field overrides the family default.
- **Menus** are plain `<details>`/`<summary>` HTML (dropdowns, mega panel, drawer, bottom-bar "More"), so they need no JavaScript.
- **The site's colours** for the generated page are derived from the palette: text on accent, text on dark, lines, muted text and card background are all computed with `Art.mix` and `Art.onColor`.

## 6. Importer logic (`Importer.analyse(html, url, log, {inner})`)

1. **Parse:** read the page with `DOMParser`. For home pages, also fetch up to 8 linked style sheets (4 s limit each) to find colours.
2. **Name and description:** from `og:site_name` or the `<title>`, and `meta description`. The footer motto comes from a `[class*="motto"], [class*="tagline"]` element.
3. **Image library:**
   - **Sources:** every `<img>` (checking `data-src`, `data-lazy-src`, `data-srcset`, `<picture>` sources, then `src` and `srcset`), inline and lazy backgrounds (`style="url()"`, `data-bg` and similar), `url()`s in the CSS, `og:image`, the JSON-LD logo, icons, and SVG logos in the header (turned into data URLs).
   - **Filtering:** placeholders, tracking pixels, ads and play-button overlays are skipped.
   - **Logo flag:** an image counts as a likely logo if "logo" or "wordmark" is in its name, alt text or class, or it sits in a logo or brand container.
4. **Colours:** count hex values; background = the most common light colour, text = the darkest of the common dark colours, accent = the first saturated colour that differs from the text, soft = a light tinted colour.
5. **Menu:** read header `<nav>` elements (skipping mobile copies). Groups come from `<details>` or nested `<ul>` lists, up to 14 items. **Internal pages** = same-site menu links (up to 24).
6. **Sections:**
   - **Card groups:** repeated siblings (same tag and first class, ≥3, ≥60 % of siblings), each with a link. Header, nav, footer, menus, share and tag lists are ignored. Wrappers like carousel slides are merged into their inner groups of the same kind. Groups that repeat (carousel clones) are dropped.
   - **Group title:** from a real tab label, a heading inside the group, `aria-label`, or the nearest heading before it.
   - **Each card** gives `title`, `text`, `link`, `image`, `eyebrow` (date, category or byline), `duration`, and whether it's a video (video-style link, video class, embedded player, play overlay, or a duration).
   - **Group type:** ≥50 % videos → `videos`; short rows with bold labels → `list`; otherwise `tiles`.
   - **Embeds:** YouTube/Vimeo/`<video>` → `videos`; audio players (libsyn, Spotify, Apple Podcasts…) → `podcast`.
   - **Other blocks:** `section`/`article` blocks that aren't card groups → `feature` (heading + subheading + paragraph) or `text`. Runs of 3+ `<article>`s are combined into one `tiles` "Stories" grid.
   - Sections are kept in page order, up to 14. Inner pages also start with a `pagehead`.

## 7. Events and rendering in `app.js`

- **One listener per event type on `document`** (`click`, `input`, `change`, `keydown`), dispatching on element ids and `data-*` attributes (`data-step`, `data-vp`, `data-star`, `data-use`, `data-pick`, `data-pimp`, `data-tp`, and so on).
- **Full redraw:** `renderAll()` → shows the active step, runs that step's draw function (`r1`–`r5`), refreshes previews, draws the Back/Next bar, then `save()`. Most clicks end in `renderAll()`.
- **Typing doesn't rebuild the form,** so focus is kept: it updates `S`, then `softPreview()` refreshes the preview (and the step 3 list) after 120 ms.
- **Previews:** `frame(stageId, vp, opt)` → `Shot.take` → swaps in the image. Each stage has a token, so slow results that arrive late are ignored.
- **Test hook:** `window.BAKE = { state(), useImport(result) }`.

## 8. Known limits and what Supabase will add

| Now | Planned with Supabase |
|---|---|
| Work is saved only in one browser (`localStorage`) | Logins; projects saved per user |
| Requests are saved only locally | A `requests` table, so requests reach Delta Owl Eyes |
| Most sites block importing; users paste code | A server function that fetches pages (works for sites like APTN) |
| "AI images" makes sample SVGs | A server function calling OpenAI images, with the key kept on the server (`S.ai.endpoint`) |
| Template code ships to the browser, so a determined user could reuse it | Rendering and screenshots moved to the server, so only images reach the browser |
| Screenshots drop images whose servers block cross-site reading | The image proxy is handled by the same server function |
| Each card grid shows up to 12 items; each video row shows 12, and the "row" layout 8 | (design choice, adjustable in `render.js`) |
