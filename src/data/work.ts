// Case studies. Clients, challenges, strategies and figures come from DMM’s previous
// website. Figures marked `verify` had no unit in the original and are shown as percentages.
// Images are placeholders until DMM’s own campaign photography is added (see src/data/images.ts).

export type Metric = { value: number; prefix?: string; suffix?: string; label: string; verify?: boolean };

export type CaseStudy = {
  slug: string;
  client: string;
  project?: string;
  sector: 'Real estate' | 'Fashion & e-commerce' | 'Weddings & events';
  industry: string;
  location: string;
  services: string[];
  headline: Metric;
  summary: string;
  context: string;
  challenge: string[];
  approach: string[];
  results: Metric[];
  quote?: string;
  cover: string;
  gallery: string[];
};

export const work: CaseStudy[] = [
  {
    slug: 'casa-homes',
    client: 'Casa Homes',
    project: 'Atam Vatika',
    sector: 'Real estate',
    industry: 'Real estate',
    location: 'Ludhiana',
    services: ['Branding', 'Outdoor & print', 'Video', 'PR'],
    headline: { value: 600, suffix: '+', label: 'inquiries in the first month' },
    summary: "Positioning one home per floor as Ludhiana’s most exclusive address, and filling the pipeline in a month.",
    context:
      "Casa Homes’ debut project in Ludhiana, Atam Vatika, is built on a rare idea: one flat on every floor, for privacy and luxury. The idea had to cut through one of the city’s most crowded markets.",
    challenge: [
      "Build brand awareness in Ludhiana’s competitive real estate market.",
      'Stand apart by owning luxury and privacy.',
      "Explain Atam Vatika’s unique features to the right buyers.",
    ],
    approach: [
      'One sharp promise, luxury living with one home per floor, carried through every touchpoint.',
      'Full-page ads and premium advertorials in leading newspapers.',
      'Billboards and transit ads at strategic locations across the city.',
      'Concept films on the architecture and the amenities.',
      'Press releases to regional and national media.',
    ],
    results: [
      { value: 55, suffix: '%', label: 'Increase in lead inquiries' },
      { value: 58, suffix: '%', label: 'Increase in visibility' },
      { value: 75, suffix: '%', label: 'Increase in engagement' },
      { value: 38, suffix: '%', label: 'Growth in footfall' },
    ],
    quote: 'Anand Goyal',
    cover: 'caseCasa',
    gallery: ['caseCasa2', 'caseCasa3'],
  },
  {
    slug: 'totebae',
    client: 'Totebae',
    sector: 'Fashion & e-commerce',
    industry: 'Fashion e-commerce',
    location: 'Ludhiana',
    services: ['SEO', 'Technical SEO', 'Content', 'Link building'],
    headline: { value: 222, label: 'keywords on Google page one in 3 months' },
    summary: 'Taking a Ludhiana apparel brand from local-only to ranking against national marketplaces.',
    context:
      'Totebae is a contemporary fashion brand from Ludhiana with apparel for men, women and kids. The collection was strong, but its online reach stopped at the city limits.',
    challenge: [
      'The website was not ranking on search engines.',
      'Reach was limited to the local region.',
      'Slow pages and a weak mobile experience caused high bounce rates and low conversions.',
      'There was no structured content marketing plan.',
    ],
    approach: [
      'Keyword research to capture both local and national demand.',
      'Local SEO for visibility close to home.',
      'A content strategy built on buyer intent.',
      'Mobile and technical SEO for faster load times.',
      'Link building to grow authority and visibility.',
    ],
    results: [
      { value: 222, label: 'Keywords on page one within 3 months' },
      { value: 300, suffix: '%', label: 'Increase in organic traffic in 3 months', verify: true },
      { value: 100, suffix: '%', label: 'Increase in sales' },
      { value: 400, suffix: '%', label: 'Improvement in domain rating' },
    ],
    quote: 'Manav',
    cover: 'caseTotebae',
    gallery: ['caseTotebae2', 'caseTotebae3'],
  },
  {
    slug: 'magique-realtech',
    client: 'Magique Realtech',
    project: 'Hilton-partnered tower launch',
    sector: 'Real estate',
    industry: 'Real estate & hospitality',
    location: 'Ludhiana',
    services: ['Outdoor & DOOH', 'Social media', 'Influencers', 'Video'],
    headline: { value: 75, suffix: '%', label: 'growth in footfall' },
    summary: "Launching a 36-floor residential tower and a Hilton-partnered five-star hotel to Ludhiana’s investors.",
    context:
      "Magique Realtech is an established Ludhiana developer with a strong track record. Its latest venture, in partnership with Hilton, pairs a five-star hotel with a 36-floor residential tower.",
    challenge: [
      'Position the residences as a lucrative investment.',
      'Reach affluent investors and corporate professionals with an exclusive strategy.',
      'Carry the prestige and quality of the Hilton partnership into every message.',
    ],
    approach: [
      'Hoardings, billboards and digital screens designed for the launch.',
      "Placement in the city’s highest-traffic areas for a strong local presence.",
      'Campaigns built for social platforms.',
      'Collaborations with local influencers and key personalities.',
      'Launch films screened in malls and other high-footfall venues.',
    ],
    results: [
      { value: 55, suffix: '%', label: 'Increase in lead inquiries' },
      { value: 40, suffix: '%', label: 'Increase in visibility' },
      { value: 25, suffix: '%', label: 'Increase in engagement' },
      { value: 75, suffix: '%', label: 'Growth in footfall' },
    ],
    cover: 'caseMagique',
    gallery: ['caseMagique2', 'caseMagique3'],
  },
  {
    slug: 'stallone-manor',
    client: 'Stallone Manor',
    sector: 'Weddings & events',
    industry: 'Weddings & events',
    location: 'Ludhiana',
    services: ['Social media', 'Concept film', 'Paid social'],
    headline: { value: 49, suffix: '%', label: 'increase in inquiries', verify: true },
    summary: "Establishing a new venue as Ludhiana’s premier address for weddings and events.",
    context:
      'Stallone Manor is a luxury venue for weddings, corporate events and social gatherings, with premium hospitality and striking architecture.',
    challenge: [
      'Compete with many established wedding venues.',
      'Be seen as a luxury brand in a crowded market.',
      'A thin digital presence limited trust and engagement.',
    ],
    approach: [
      'Positioned the venue as a destination for grand celebrations.',
      "A concept film on the venue’s scale and hospitality.",
      'A cohesive, premium Instagram grid.',
      'Targeted Facebook and Instagram campaigns for couples and event planners.',
    ],
    results: [
      { value: 20, suffix: '%', label: 'Growth in organic engagement', verify: true },
      { value: 40, suffix: '%', label: 'Increase in reach', verify: true },
      { value: 49, suffix: '%', label: 'Increase in inquiries', verify: true },
      { value: 72, suffix: '%', label: 'Increase in visibility', verify: true },
    ],
    quote: 'Stallone Manor',
    cover: 'caseStallone',
    gallery: ['caseStallone2', 'caseStallone3'],
  },
  {
    slug: 'omaxe-bridal-plaza',
    client: 'Omaxe Ludhiana',
    project: 'Bridal Shopping Plaza',
    sector: 'Real estate',
    industry: 'Real estate & retail',
    location: 'Ludhiana',
    services: ['Video', 'Social media', 'Influencers', 'Events', 'Print'],
    headline: { value: 82, suffix: '%', label: 'increase in engagement', verify: true },
    summary: 'Giving a new bridal shopping plaza its own identity in a city that takes weddings seriously.',
    context:
      "Omaxe, one of India’s best-known real estate developers, created a Ludhiana plaza dedicated to bridal shopping, built for the city’s demand for luxury and convenience.",
    challenge: ['Differentiate the plaza with a unique identity.', 'Build awareness for a brand-new shopping concept.'],
    approach: [
      'Video marketing on luxury and convenience.',
      'Facebook and Instagram campaigns.',
      'Influencer partnerships and print media outreach.',
      'Event marketing with bridal designers.',
    ],
    results: [
      { value: 75, suffix: '%', label: 'Increase in lead inquiries', verify: true },
      { value: 41, suffix: '%', label: 'Increase in visibility', verify: true },
      { value: 82, suffix: '%', label: 'Increase in engagement', verify: true },
      { value: 64, suffix: '%', label: 'Growth in footfall', verify: true },
    ],
    cover: 'caseOmaxe',
    gallery: ['caseOmaxe2', 'caseOmaxe3'],
  },
  {
    slug: '7-creations',
    client: '7 Creations',
    sector: 'Weddings & events',
    industry: 'Weddings & events',
    location: 'Destination weddings',
    services: ['Social media', 'Concept video', 'Influencers', 'Paid social'],
    headline: { value: 72, suffix: '%', label: 'increase in reach' },
    summary: "Bringing a destination-wedding decor studio’s work to the couples searching for it.",
    context: '7 Creations is an event decoration and wedding planning brand that curates destination weddings.',
    challenge: [
      'The brand struggled to gain recognition online.',
      'Social channels lacked interaction and failed to captivate potential clients.',
      'Connecting with the right couples was difficult.',
    ],
    approach: [
      'Concept videos and shareable content for the target audience.',
      'Collaborations with top influencers to build trust and credibility.',
      'Revamped social profiles with striking grids.',
      'Strategic ad campaigns to reach prospective clients.',
    ],
    results: [
      { value: 40, suffix: '%', label: 'Growth in organic engagement' },
      { value: 72, suffix: '%', label: 'Increase in reach' },
      { value: 65, suffix: '%', label: 'Increase in inquiries', verify: true },
      { value: 38, suffix: '%', label: 'Increase in visibility' },
    ],
    cover: 'caseSeven',
    gallery: ['caseSeven2', 'caseSeven3'],
  },
];

export const featuredWork = work.slice(0, 4);
