# Dev Marketing Mind (DMM) website

Portfolio-first agency site for DMM, Ludhiana. It shows client work and the results each campaign produced, then turns visitors into WhatsApp, call or email inquiries.

- **Stack:** Astro 7 (static output), GSAP 3.15 with ScrollTrigger, Lenis smooth scrolling, a small WebGL2 fluid simulation for the hero, Archivo variable font (self-hosted through Fontsource). Photos are converted to AVIF/WebP at build time; nothing loads from third-party CDNs.
- **No server needed.** The build is plain HTML, CSS and JS in `dist/`.

## Run it

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # production files in dist/
npm run preview    # serve the production build locally
```

Deploy `dist/` to any static host: Netlify, Vercel, Cloudflare Pages, or the `public_html` folder of Hostinger/cPanel.

## Where to edit

| What | File |
|---|---|
| Brand name, contact details, services, process, values, industries, numbers, testimonials, client list, FAQs | `src/data/site.ts` |
| Case studies (one object per client; each becomes `/work/<slug>/` automatically) | `src/data/work.ts` |
| Every photo on the site | `src/data/images.ts` |
| Colours, type scale, spacing and all styles | `src/styles/global.css` |
| Animation and interaction (loading screen, page wipe, smooth scroll, cursor, hero entrance, skewed section overlaps, card stack, reveals, counters, slider, menu, form) | `src/scripts/motion.ts` |
| Loading screen markup | `src/components/Loader.astro` |
| Hero liquid-glass effect (WebGL2 fluid simulation, desktop pointers only) | `src/scripts/fluid.ts` |
| Pages | `src/pages/` |

### Add a case study

1. Copy an entry in `src/data/work.ts`, give it a new `slug`, and fill in the client, challenge, approach and results.
2. Drop its photos (JPG, 2000px wide is plenty) into `src/assets/photos/` and register them in `src/data/images.ts`.
3. The case study page and its card on /work appear on the next build. The first four entries are the stacked cards on the home page.

## Before launch

1. **Replace the placeholder photos.** The 18 case-study photos (and the Totebae image on the home page) are Unsplash stand-ins, not DMM's work. While `npm run dev` is running they show a yellow dashed outline. Swap in the real hoardings, grids, films and websites for each client.
2. **Confirm the numbers.** Figures come from the previous devsmarketingmind.com. Entries marked `verify: true` in `work.ts` had no unit on the old site and are shown as percentages. The averages in `numbers` (`site.ts`) are the old site's claims too.
3. **Confirm the testimonials and client list** can be reused as written.
4. **Brand name.** The site uses "Dev Marketing Mind" (one setting: `site.name`). The domain, email, Instagram handle and Facebook page still read "devs"/"Dev's"; update those profiles if you want the name to match everywhere.
5. **Logo.** The DMM mark is typeset in Archivo. Replace the `brand-mark` in `Header.astro` and `favicon.svg` if you want the official logo file.
6. **Legal pages.** Privacy, terms and refund pages from the old site are not included. Add them under `src/pages/` if you need them.
7. **Domain.** `site` in `astro.config.mjs` is `https://devsmarketingmind.com`; it drives canonical URLs and the sitemap.

## How the contact form works

There is no server. "Send on WhatsApp" opens WhatsApp with the visitor's details pre-written to +91 89689 30003; "Send by email" opens their mail app addressed to reach@devsmarketingmind.com. To collect submissions in an inbox instead, point the form at a form service such as Formspree or Web3Forms.

## Design notes

- **Reference:** the structure, pacing and interaction language follow elanstudio.us as briefed: pinned hero that the next section slides over, skewed section overlaps, case cards that stack, numbered service rows, the marquee CTA block with a parallax photo, client ticker, four stats and a footer with the wordmark. All copy, photography, identity and code are DMM's own.
- **Colour:** DMM orange `#cc6c32` (`--brand`, lighter `--brand-soft #e2905a` on dark), warm ink `#1b1512` for text and the hero scrim, and poster paper (`--paper #f6f2ec`, `--paper-2 #ede6dc`) for every section, the loader and the phone menu. The only dark surfaces are photographs (the hero, the Work, Services and case-study tops). The footer is the one solid block of brand orange, with ink for small text and paper for the headline and wordmark (both pass the large-text contrast bar; ink on orange passes for body text). Everywhere else orange is the single accent: rail diamonds, hairlines, corner marks, tags, underlines, focus, checks, the scrollbar, the wipe blade, and the soft-light grade on every photo frame that lifts on hover. The old crosshair and plus ornaments are hidden.
- **Layout:** content sits in a `--max 1680px` container with gutters that grow with the screen (`clamp(24px, 2.4vw, 56px)`); the header, hero text and light-box align to the same container, and the hero wordmark is capped so a 2560 px screen does not stretch the page edge to edge.
- **Hero effect:** a pointer-driven fluid simulation refracts the hero photo like liquid glass (`src/scripts/fluid.ts`). Fast pointer moves are subdivided into sub-splats along the path so a stroke is one continuous ribbon; the pointer injects velocity and an ink ("dye") field; the solver runs divergence, 12 Jacobi pressure passes, gradient subtraction and self-advection each frame, then displays the photo shifted along the flow wherever ink is present, so a stroke keeps swirling and settles over roughly two seconds. The canvas is drawn 20% larger than the hero (`max-width: none` is required, otherwise the base `canvas` rule clamps it and the refraction lands left of the pointer), simulated at a quarter of the display size, and capped at 1600 px wide and 1.5× device pixel ratio so it stays smooth on integrated GPUs and 4K screens. It runs only for mouse users (`hover: hover` and `pointer: fine`), pauses when the hero is offscreen or the tab is hidden, and is loaded on demand. Phones, reduced-motion users and browsers without WebGL2 float targets simply see the photo. The display pass bends the red and blue channels slightly apart (`dispersion`) and adds a faint highlight where the flow faces the light (`shine`), with a warm orange tint. Append `?fluiddebug` to the URL to see the ink and velocity fields; `document.querySelector('.fluid').__stats()` prints frame timing. Strength is set where it is mounted in `src/scripts/motion.ts`. Photos with point lights and strong contrast (night streets, bokeh, signage) show the refraction best; a flat or evenly lit image barely moves.
- **Loading screen and page wipe:** on a full page load a paper cover counts the real asset load (fonts, the hero photo, `load`) in mono at the top right while the wordmark letters rise; it never shows for less than about 1.8 s or more than about 2.6 s. It then leaves along the section wedges' diagonal with an orange blade behind it, and the wordmark glides (a FLIP measured at runtime) into exactly the spot the hero wordmark occupies, turning white as it lands on the photo. Clicking an internal link closes the same cover before the next page loads, which opens it again (`sessionStorage` key `dmm:wipe`, read by the inline script in `Base.astro`). Reduced-motion users and visitors without JavaScript never see the cover.
- **Founder portrait:** add `src/assets/photos/founder.jpg` (a 4:5 portrait, about 1200 px wide) and it appears in the About block on the home page and in the founder block on the About page; until then a labelled placeholder holds the slot. Name and role come from `site.founder` in `src/data/site.ts`.
- **Two voices of type:** Archivo speaks; JetBrains Mono (self-hosted, `--mono`) records. Every number, label, coordinate, timestamp and form label is mono. The `.meta` utility (12 px, uppercase, tracked) is the house style for small labels. Section rails read `◆ 01 · About · 01 / 05`. Statements and hooks reveal word by word from behind a mask (`data-lines`); split words are inline blocks, so they reset `text-indent` (the services statement indents its first line past the photo).
- **Cards:** the photo fills the card and the campaign's headline number is printed on it in mono; the caption below carries client and channels. On phones the cards are a plain column. The CTA block runs a tape of every case's headline result instead of adjectives.
- **States:** underlines draw in orange, corner marks step out, buttons turn orange and press down, service numbers light up, the pill is magnetic, form labels turn orange on focus, checks fill orange, the scrollbar is orange. Nothing interactive is inert on hover or focus. The header turns dark on pages that open on paper (About, Contact, 404).
- **Copy:** one idea per block. The hero hook is two lines, each statement one sentence, each ledger line one breath, and testimonials are excerpted to the sentence that carries the result. Stats are four equal columns, "up to" the top of the ranges the old site quoted.
- **Cursor and scroll:** mouse users get a dot that keeps up, a ring that lags, and an orange "View" / "Explore" disc over cards and service rows (touch devices keep the native cursor). Lenis smooths the scroll (`lerp` 0.09) and drives GSAP's ticker; it is the only scroll engine and is skipped under reduced motion. Photos open from their top edge as they enter, the stats count up, and the footer wordmark rises letter by letter.
- **DMM touches:** the hero bottom line shows Ludhiana, its coordinates and a live IST clock (`clocks()` in `motion.ts`, coordinates hidden on phones); every case card carries the headline result of that campaign; the skewed section edges carry a one-pixel orange hairline; the testimonial and ticker thumbnails are the case covers.
- **Type:** Archivo variable; 125% width for the wordmark, 100% for everything else. Sizes run one step larger than the reference at every level (labels 13, body 17, statements up to 84, section titles up to 116 px).
- **Motion:** entrance timings match the reference (image scales 1.2 to 1 over 1s, header drops in at 0.3s, text lines at 0.4 to 0.7s). With reduced motion on, everything renders in its final state; without JavaScript the page is complete and readable.

## Photo credits

Every photo in `src/assets/photos/` is free for commercial use. The case-study photos are still stand-ins for DMM's real campaign work (they show a yellow outline in `npm run dev`); the rest can ship as they are.

- **Pexels** ([Pexels License](https://www.pexels.com/license/), no credit required): the hero and every other photo not listed below. Pexels photo ids: hero 28556110, ctaBg 14780175, ctaInset 1936741, servicesMark 27636178, servicesHero 2119903, workHero 37352236, svcSeo 577210, svcSocial 13929353, svcAds 6476563, svcBrand 37947526, svcOutdoor 29423536, svcWeb 11813187, svcContent 39190706, Casa 2282036 / 16573669 / 26859066, Totebae 12969403 / 34121563 / 18699670, Magique 12849349 / 39135603 / 30067774, Stallone 6333757 / 33852468 / 12024178, Omaxe 12634086 / 10773467 / 37601639, 7 Creations 33927784 / 34079355 / 38656749.
- **Wikimedia Commons** (real Ludhiana; credit the photographer on the site, e.g. in the footer or a credits page):
  - `aboutHero`: [Sukhmani Square Commercial Complex, night view](https://commons.wikimedia.org/wiki/File:Sukhmani_Square_Commercial_Complex_Night_View_Ludhiana.jpg), Akhi.explore, CC BY 4.0
  - `aboutFigure`: [Canal Road](https://commons.wikimedia.org/wiki/File:Canal_Road.jpg), Akhi.explore, CC BY 4.0
  - `ledger`: [Clock Tower Ludhiana](https://commons.wikimedia.org/wiki/File:Clock_Tower_Ludhiana.jpg), Mnv179, CC BY-SA 4.0
