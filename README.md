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

- **Reference:** the structure, pacing and interaction language follow elanstudio.us as briefed: pinned hero that the next section slides over, skewed section overlaps, blurred-backdrop portfolio cards that stack and shrink, numbered service rows, the marquee CTA block with a parallax photo, logo ticker, 2x2 stats, and the dark footer with the wordmark. All copy, photography, identity and code are DMM's own.
- **Hero effect:** a pointer-driven fluid simulation refracts the hero photo like liquid glass (`src/scripts/fluid.ts`). Fast pointer moves are subdivided into sub-splats along the path so a stroke is one continuous ribbon; the pointer injects velocity and an ink ("dye") field; the solver runs divergence, 16 Jacobi pressure passes, gradient subtraction and self-advection each frame, then displays the photo shifted along the flow wherever ink is present, so a stroke keeps swirling and settles over roughly two seconds instead of snapping back. It runs only for mouse users (`hover: hover` and `pointer: fine`), pauses when the hero is offscreen or the tab is hidden, caps device pixel ratio at 1.5, and is loaded on demand. Phones, reduced-motion users and browsers without WebGL2 float targets simply see the photo. The display pass bends the red and blue channels slightly further apart than the green (`dispersion`) and adds a faint highlight where the flow faces the light (`shine`), so the glass reads as glass. Append `?fluiddebug` to the URL to see the ink and velocity fields. Strength is set where it is mounted in `src/scripts/motion.ts` (`cursorSize`, `cursorPower`, `distortion`, `resolution`, `tint`, `dispersion`, `shine`).
- **Art direction:** Ludhiana after dark. DMM's work runs on hoardings, screens and shopfronts, so every photo is the city at night (neon signage, lit streets, real Ludhiana landmarks) under one colour grade: a violet-to-neon-pink `soft-light` wash on every photo frame that lifts on hover. Surfaces are warm poster paper (`--paper #f4f1ea`) and violet-black ink (`--ink #0e0d12`), with `#892deb` as the single UI accent. Type runs one step larger than the reference at every level (labels 13, body 17, statements up to 84, section titles up to 116 px) and the Work, Testimonial and Stats sections carry a large two-line title with the second line dimmed.
- **Loading screen and page wipe:** on a full page load the ink cover counts the real asset load (fonts, the hero photo, `load`) from 0 to 100 while the hero photo pours into the full-width wordmark from left to right and the six disciplines flip through; it never shows for less than about 1.8 s or more than about 3.5 s. It then leaves along the section wedges' diagonal with a violet blade behind it, the wordmark glides (a FLIP measured at runtime) into exactly the spot the hero wordmark occupies, and the hero entrance starts as the edge passes. Clicking an internal link closes the same cover before the next page loads, which opens it again (`sessionStorage` key `dmm:wipe`, read by the inline script in `Base.astro`). Reduced-motion users and visitors without JavaScript never see the cover.
- **Two voices of type:** Archivo speaks; JetBrains Mono (self-hosted, `--mono`) records. Every number, label, coordinate, timestamp and form label is mono — the `.meta` utility (12 px, uppercase, tracked) is the house style for small labels. Section rails read `◆ 01 · About · 01 / 05`.
- **Cards:** the photo fills the card and the campaign's headline number is printed on it in mono; the caption below carries client and channels. The CTA block runs a tape of every case's headline result instead of adjectives.
- **States:** underlines draw in violet, corner marks step out, buttons turn violet and press down, service numbers light up, the pill is magnetic, form labels turn violet on focus, checks fill violet, the scrollbar is violet. Nothing interactive is inert on hover or focus.
- **Copy:** one idea per block. The hero hook is two lines, each statement one sentence, each ledger line one breath, and testimonials are excerpted to the sentence that carries the result (the full quotes stay in `site.ts` history if you want them back). Stats are four equal columns, "up to" the top of the ranges the old site quoted.
- **Cursor and scroll:** mouse users get a dot that keeps up, a ring that lags, and a violet "View" / "Explore" disc over cards and service rows (touch devices keep the native cursor). Lenis smooths the scroll (`lerp` 0.09) and drives GSAP's ticker; it is the only scroll engine and is skipped under reduced motion. Photos open from their top edge as they enter, the stats count up, and the footer wordmark rises letter by letter.
- **DMM touches (deliberately small, all on the reference's grid):** the hero bottom line shows Ludhiana, its coordinates and a live IST clock (`clocks()` in `motion.ts`, coordinates hidden on phones); every portfolio card carries the headline result of that campaign in its caption; hovering a card sharpens the blurred backdrop as well as zooming the inset; the skewed section edges carry a one-pixel violet hairline; the stat corner marks and the service-row tags are violet; the liquid glass carries a faint violet tint.
- **Type:** Archivo variable; 125% width for the wordmark, 100% for everything else. Sizes mirror the reference (12 / 16 / 25 / 56 / 70 / 100 / 195 px).
- **Colour:** white, #111 and 50% greys, with DMM violet #892deb reserved for the touches above (rail diamonds, crosshair marks, hairlines, corner marks, service tags; #b48cff on dark).
- **Motion:** entrance timings match the reference (image scales 1.2 to 1 over 1s, header drops in at 0.3s, text lines at 0.4 to 0.7s). With reduced motion on, everything renders in its final state; without JavaScript the page is complete and readable.

## Photo credits

Every photo in `src/assets/photos/` is free for commercial use. The case-study photos are still stand-ins for DMM's real campaign work (they show a yellow outline in `npm run dev`); the rest can ship as they are.

- **Pexels** ([Pexels License](https://www.pexels.com/license/), no credit required): the hero and every other photo not listed below. Pexels photo ids: hero 28556110, ctaBg 14780175, ctaInset 1936741, servicesMark 27636178, servicesHero 2119903, workHero 37352236, svcSeo 577210, svcSocial 13929353, svcAds 6476563, svcBrand 37947526, svcOutdoor 29423536, svcWeb 11813187, svcContent 39190706, Casa 13752348 / 16573669 / 26859066, Totebae 38283677 / 34121563 / 18699670, Magique 19392859 / 39135603 / 30067774, Stallone 14646749 / 33852468 / 12024178, Omaxe 12634086 / 10773467 / 37601639, 7 Creations 33927784 / 34079355 / 38656749.
- **Wikimedia Commons** (real Ludhiana; credit the photographer on the site, e.g. in the footer or a credits page):
  - `aboutHero`: [Sukhmani Square Commercial Complex, night view](https://commons.wikimedia.org/wiki/File:Sukhmani_Square_Commercial_Complex_Night_View_Ludhiana.jpg), Akhi.explore, CC BY 4.0
  - `aboutFigure`: [Canal Road](https://commons.wikimedia.org/wiki/File:Canal_Road.jpg), Akhi.explore, CC BY 4.0
  - `ledger`: [Clock Tower Ludhiana](https://commons.wikimedia.org/wiki/File:Clock_Tower_Ludhiana.jpg), Mnv179, CC BY-SA 4.0
