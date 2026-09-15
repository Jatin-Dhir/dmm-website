// Image registry. Files live in src/assets/photos and are converted to AVIF/WebP at build
// time (see Pic.astro), so nothing loads from a third-party CDN at runtime.
//
// Sources (all free for commercial use):
//   - Pexels, under the Pexels License (https://www.pexels.com/license/): every photo not listed below.
//   - Wikimedia Commons, credit required (see README "Photo credits"):
//       aboutHero   "Sukhmani Square Commercial Complex Night View Ludhiana" by Akhi.explore, CC BY 4.0
//       aboutFigure "Canal Road" (Ludhiana) by Akhi.explore, CC BY 4.0
//       ledger      "Clock Tower Ludhiana" by Mnv179, CC BY-SA 4.0
// Entries marked `placeholder` stand in for real client work and show a yellow outline while
// `npm run dev` runs; swap them for DMM's own campaign photography before launch.
//
// To swap one: drop a JPG into src/assets/photos/ and point `file` at its name (no extension).
import type { ImageMetadata } from 'astro';

export type Img = { file: string; alt: string; focus?: string; placeholder?: boolean };

const p = (file: string, alt: string, focus?: string): Img => ({ file, alt, focus });
const stand = (file: string, alt: string, focus?: string): Img => ({ ...p(file, alt, focus), placeholder: true });

export const images: Record<string, Img> = {
  // Page heroes and atmosphere: the city after dark, where DMM's work actually runs
  hero: p('hero', 'An Indian city at night from above, its roads drawn in orange light', '55% 50%'),
  ctaBg: p('ctaBg', 'Light trails and lit billboards at a city junction at night'),
  ctaInset: p('ctaInset', 'A violet neon sign reflected in a puddle', '50% 50%'),
  servicesMark: p('servicesMark', 'Neon shop signs stacked on a night street', '50% 40%'),
  workHero: p('workHero', 'An Indian city seen from above at night, streets drawn in light'),
  aboutHero: p('aboutHero', 'Sukhmani Square in Ludhiana at blue hour, shopfronts lit'),
  aboutFigure: p('aboutFigure', 'A lit hoarding beside Canal Road, Ludhiana, at night', '50% 30%'),
  servicesHero: p('servicesHero', 'A row of glowing shop signs on a wet Indian street at night', '50% 45%'),
  ledger: p('ledger', 'The red-brick Clock Tower of Ludhiana against the sky', '50% 25%'),

  // Services
  svcSeo: p('svcSeo', 'A laptop showing an analytics dashboard'),
  svcSocial: p('svcSocial', 'A creator filming herself on a phone in front of a ring light', '50% 35%'),
  svcAds: p('svcAds', 'A desktop screen with a rising bar chart'),
  svcBrand: p('svcBrand', 'A fan of violet Pantone swatches'),
  svcOutdoor: p('svcOutdoor', 'A large hoarding above a busy Indian street at night', '50% 22%'),
  svcWeb: p('svcWeb', 'A landing-page wireframe sketched on a tablet'),
  svcContent: p('svcContent', 'A photographer shooting a portrait in a studio'),

  // Case studies (stand-ins until DMM's own campaign photos replace them)
  caseCasa: stand('caseCasa', 'A modern villa lit up at dusk'),
  caseCasa2: stand('caseCasa2', 'A luxury villa with a columned facade'),
  caseCasa3: stand('caseCasa3', 'A modern house with a pool at dusk'),
  caseTotebae: stand('caseTotebae', 'Colourful garments on a boutique rail'),
  caseTotebae2: stand('caseTotebae2', 'A woman in a fur coat with a handbag on marble steps', '50% 35%'),
  caseTotebae3: stand('caseTotebae3', 'Beige suits displayed in a fashion store'),
  caseMagique: stand('caseMagique', 'A high-rise residential tower lit window by window at night'),
  caseMagique2: stand('caseMagique2', 'Three towers against a dusk sky'),
  caseMagique3: stand('caseMagique3', 'Tall buildings reflected in still water at dusk'),
  caseStallone: stand('caseStallone', 'A banquet hall lit in violet for a reception'),
  caseStallone2: stand('caseStallone2', 'A grand hall with chandeliers set for a wedding'),
  caseStallone3: stand('caseStallone3', 'A venue ceiling filled with flowers and lights'),
  caseOmaxe: stand('caseOmaxe', 'A bride in maroon with heavy gold jewellery', '50% 30%'),
  caseOmaxe2: stand('caseOmaxe2', 'A bride in red with traditional jewellery', '50% 25%'),
  caseOmaxe3: stand('caseOmaxe3', 'A gold jhumka earring, close up'),
  caseSeven: stand('caseSeven', 'A couple in silhouette against lit archways'),
  caseSeven2: stand('caseSeven2', 'A floral mandap at night'),
  caseSeven3: stand('caseSeven3', 'A groom celebrating under beams of light'),
};

const files = import.meta.glob<{ default: ImageMetadata }>('/src/assets/photos/*.jpg', { eager: true });

export function asset(id: string): ImageMetadata {
  const img = images[id];
  if (!img) throw new Error(`Unknown image id "${id}". Add it to src/data/images.ts.`);
  const mod = files[`/src/assets/photos/${img.file}.jpg`];
  if (!mod) throw new Error(`Missing photo src/assets/photos/${img.file}.jpg for image "${id}".`);
  return mod.default;
}
