// Every piece of copy, contact detail and claim on the site lives in this folder.
// Figures marked `verify` were carried over from the previous devsmarketingmind.com
// and should be confirmed by DMM before launch.

export const site = {
  name: 'Dev Marketing Mind',
  short: 'DMM',
  legal: 'A venture of Education Culture Pvt. Ltd.',
  url: 'https://devsmarketingmind.com',
  title: 'DMM | Dev Marketing Mind, marketing agency in Ludhiana',
  description:
    "Dev Marketing Mind (DMM) is a 360° marketing agency in Ludhiana, Punjab. SEO, social media, branding, outdoor advertising, websites and performance ads, measured in inquiries, footfall and revenue.",
  email: 'reach@devsmarketingmind.com',
  phone: '+91 89689 30003',
  phoneHref: 'tel:+918968930003',
  whatsapp: '918968930003',
  founder: { name: 'Dev Garg', role: 'Managing Director' },
  address: {
    street: '397-E, Shaheed Bhagat Singh Nagar, Pakhowal Road',
    city: 'Ludhiana',
    region: 'Punjab',
    postcode: '141013',
    country: 'India',
  },
  mapUrl: 'https://www.google.com/maps/search/?api=1&query=397-E+Shaheed+Bhagat+Singh+Nagar+Pakhowal+Road+Ludhiana+141013',
  hours: 'Monday to Saturday, 10 am to 6 pm',
  coordinates: '30.90° N, 75.85° E',
  socials: [
    { label: 'Instagram', href: 'https://www.instagram.com/devsmarketingmind/' },
    { label: 'Facebook', href: 'https://www.facebook.com/people/Devs-Marketing-Mind/61556582498424/' },
    { label: 'LinkedIn', href: 'https://in.linkedin.com/in/dev-garg-079095188' },
  ],
};

export const whatsappLink = (text = "Hi DMM, I’d like to talk about growing my business.") =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;

export const nav = [
  { label: 'Work', href: '/work/' },
  { label: 'Services', href: '/services/' },
  { label: 'About', href: '/about/' },
  { label: 'Contact', href: '/contact/' },
];

export type Service = {
  slug: string;
  name: string;
  tag: string;
  line: string;
  body: string;
  deliverables: string[];
  image: string;
  proof?: { value: string; label: string; href: string };
};

export const services: Service[] = [
  {
    slug: 'seo',
    name: 'SEO & GEO',
    tag: 'Search Authority',
    line: 'Get found by the people already searching for what you sell.',
    body: 'Technical and on-page fixes, local SEO and Google Business Profile, content built around buyer intent, and links that build authority. Generative engine optimisation keeps your brand in AI answers too.',
    deliverables: ['Technical and on-page SEO', 'Local SEO and Google Business Profile', 'Content that ranks', 'Link building', 'Generative engine optimisation (GEO)', 'E-commerce product and collection pages'],
    image: 'svcSeo',
    proof: { value: '222', label: 'Totebae keywords on Google page one in 3 months', href: '/work/totebae/' },
  },
  {
    slug: 'social',
    name: 'Social media',
    tag: 'Digital Presence',
    line: 'Content people stop for, and campaigns that turn followers into inquiries.',
    body: 'Strategy and content calendars, concept reels and shoots, influencer collaborations and community management across Instagram, Facebook, LinkedIn and YouTube.',
    deliverables: ['Social strategy and calendars', 'Reels, concept films and shoots', 'Influencer partnerships', 'Grid design and community management'],
    image: 'svcSocial',
    proof: { value: '+49%', label: 'Stallone Manor inquiries', href: '/work/stallone-manor/' },
  },
  {
    slug: 'ads',
    name: 'Performance ads',
    tag: 'Paid Growth',
    line: 'Google and Meta campaigns judged on leads and cost per lead, not clicks.',
    body: 'Search, display and Performance Max campaigns, Facebook and Instagram ads, pixel and conversion tracking, and landing pages that match the promise of the ad.',
    deliverables: ['Google Ads', 'Facebook and Instagram ads', 'Conversion tracking and pixels', 'Landing pages and testing'],
    image: 'svcAds',
  },
  {
    slug: 'branding',
    name: 'Branding & design',
    tag: 'Creative Oversight',
    line: 'An identity that makes your business look like the obvious choice.',
    body: 'A brand assessment first, then positioning and messaging, logo and identity systems, brochures, stationery and every piece of marketing collateral.',
    deliverables: ['Positioning and messaging', 'Logo and identity systems', 'Brochures, flyers and stationery', 'Launch campaigns'],
    image: 'svcBrand',
    proof: { value: '600+', label: 'Casa Homes inquiries in the first month', href: '/work/casa-homes/' },
  },
  {
    slug: 'outdoor',
    name: 'Outdoor & print',
    tag: 'Street Presence',
    line: 'Hoardings, transit, malls and newspapers, placed where your buyers pass every day.',
    body: 'Planning, design and placement for billboards and hoardings, transit and mall media, digital screens, and full-page newspaper ads and advertorials.',
    deliverables: ['Billboards and hoardings', 'Transit and mall branding', 'Digital screens (DOOH)', 'Newspaper ads and press releases'],
    image: 'svcOutdoor',
    proof: { value: '+75%', label: 'Magique Realtech footfall', href: '/work/magique-realtech/' },
  },
  {
    slug: 'websites',
    name: 'Websites & e-commerce',
    tag: 'Online Identity',
    line: 'Fast, findable websites designed to turn visits into business.',
    body: 'Custom, WordPress and Shopify builds with responsive UI and UX, SEO-ready structure, speed optimisation and secure payment gateways.',
    deliverables: ['Custom websites', 'WordPress and Shopify', 'UI and UX design', 'Speed and Core Web Vitals'],
    image: 'svcWeb',
  },
  {
    slug: 'content',
    name: 'Content & video',
    tag: 'Words and Visuals',
    line: 'Words that rank and visuals that sell.',
    body: 'SEO blogs, website and landing-page copy, ad copy and email campaigns, plus short-form video, CGI, motion graphics, product photography and podcasts.',
    deliverables: ['SEO blogs and website copy', 'Ad copy and email campaigns', 'Short video, CGI and motion graphics', 'Product photography and podcasts'],
    image: 'svcContent',
  },
];

export const heroDisciplines = [
  { label: 'SEO & GEO', href: '/services/#seo' },
  { label: 'Social media', href: '/services/#social' },
  { label: 'Branding', href: '/services/#branding' },
  { label: 'Outdoor & print', href: '/services/#outdoor' },
  { label: 'Websites', href: '/services/#websites' },
  { label: 'Performance ads', href: '/services/#ads' },
];

export const process = [
  { title: 'Understand', body: "Your goals, numbers and customers first: what you sell, to whom, and what ‘more’ means for your business.", includes: ['Goals and KPIs agreed up front', 'Current channels and spend reviewed', 'Free strategy session'] },
  { title: 'Research', body: 'Your market, competitors and current performance, with a SWOT that shows where the quickest wins are.', includes: ['Competitor and keyword research', 'Audience and buyer mapping', 'SWOT analysis'] },
  { title: 'Strategy', body: 'A channel plan and budget built around your targets, from search and social to outdoor and print.', includes: ['Channel mix and budget split', 'Creative direction', 'Measurement plan'] },
  { title: 'Execute & optimise', body: 'Our in-house team builds and runs every piece, then refines whatever underperforms, week after week.', includes: ['Campaigns, content and builds', 'Weekly optimisation', 'One team, no hand-offs'] },
  { title: 'Report', body: "Clear reports on inquiries, traffic, footfall and ROI, so you always know what’s working and what’s next.", includes: ['Live dashboards', 'Weekly performance reports', 'Monthly strategy review'] },
];

export const values = [
  { title: 'Strategy before spend', body: 'Every campaign starts from research and a written plan, so every ad, post and page has a job.' },
  { title: 'One KPI: revenue', body: 'Likes and impressions are means, not ends. We measure what reaches your bank account.' },
  { title: 'Everything in-house', body: 'Writers, SEO specialists, social strategists, video editors and developers under one roof.' },
  { title: 'Reports you can read', body: 'Real-time dashboards, weekly reports and clear communication. No vague decks.' },
  { title: 'Built for your industry', body: 'What works for a clinic will not work for a builder. No generic playbooks.' },
  { title: 'Always testing', body: 'New channels, AI-driven automation and fresh formats, tested before your competitors try them.' },
];

export const industries = [
  { name: 'Healthcare & wellness', body: 'Hospitals, nursing homes, clinic chains and doctor-owned practices building patient trust and footfall.' },
  { name: 'Real estate', body: 'Developers and realtors generating qualified leads and site visits for launches.' },
  { name: 'E-commerce & retail', body: 'Brands growing organic traffic, product rankings and online sales.' },
  { name: 'Weddings & hospitality', body: 'Venues, planners and decorators filling their calendars with the right couples.' },
  { name: 'Legal & financial', body: 'Firms positioned as trusted experts for high-intent searches.' },
  { name: 'Education', body: 'Schools, universities and e-learning platforms improving enrolments.' },
  { name: 'Startups, tech & SaaS', body: 'Young companies building credibility with customers and investors.' },
];

// verify: aggregate claims carried over from the previous DMM website.
// The old site quoted ranges (2–3×, 200–300%, 15–25%); shown here as "up to" the top of each range.
export const numbers: { big: string; unit?: string; pre?: string; label: string }[] = [
  { big: '3', unit: '×', pre: 'Up to', label: 'Return on ad spend' },
  { big: '300', unit: '%', pre: 'Up to', label: 'Website traffic' },
  { big: '25', unit: '%', pre: 'Up to', label: 'Higher conversion' },
  { big: '600', unit: '+', pre: 'One month', label: 'Inquiries, Casa Homes' },
];

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  company: string;
  href?: string;
  metric?: { value: string; label: string; sub?: string };
  metric2?: { value: string; label: string; sub?: string };
  sector?: string;
  sectorLabel?: string;
};

export const testimonials: Testimonial[] = [
  {
    quote: "The ‘One Home Per Floor’ campaign was a hit, giving us 600+ inquiries within the first month.",
    name: 'Anand Goyal',
    role: 'Director',
    company: 'Casa Homes',
    sector: 'Real estate',
    sectorLabel: 'Launch campaign',
    href: '/work/casa-homes/',
    metric: { value: '600+', label: 'Inquiries', sub: 'First month of the campaign' },
    metric2: { value: '+55%', label: 'Lead inquiries', sub: 'Atam Vatika launch' },
  },
  {
    quote: 'In the first 3 months we were on the top page of search results, outranking Myntra, Amazon and Flipkart. Today we have 410 keywords on page one.',
    name: 'Manav',
    role: 'Director',
    company: 'Totebae',
    sector: 'E-commerce',
    sectorLabel: 'SEO programme',
    href: '/work/totebae/',
    metric: { value: '410', label: 'Keywords', sub: 'On Google page one' },
    metric2: { value: '+300%', label: 'Organic traffic', sub: 'In 3 months' },
  },
  {
    quote: 'DMM made my Instagram handle a tool for generating new leads. Within the first month of posting, I received numerous inquiries for hearing tests and speech therapy.',
    name: 'Dr. Navdeep Kanwer',
    role: 'Founder',
    company: 'Simran Speech & Hearing Clinic',
    sector: 'Healthcare',
    sectorLabel: 'Social media',
  },
  {
    quote: 'I had the knowledge; DMM conceptualised it and took it through the right channels to the right audience. Their logo design blends culture, tradition and modernity.',
    name: 'Dr. Manisa Mittal',
    role: 'Founder',
    company: 'Manisa Beaute Co.',
    sector: 'Beauty',
    sectorLabel: 'Branding and social',
  },
  {
    quote: 'DMM created concept-based reels tailored to our audience, and their idea of featuring testimonials helped us build trust and credibility.',
    name: 'Stallone Manor',
    role: 'Wedding venue',
    company: 'Ludhiana',
    sector: 'Weddings',
    sectorLabel: 'Social media',
    metric: { value: '+49%', label: 'Inquiries', sub: 'Reported by the client' },
    metric2: { value: '+72%', label: 'Visibility', sub: 'Instagram reach' },
    href: '/work/stallone-manor/',
  },
];

export const clients = [
  'Casa Homes',
  'Totebae',
  'Magique Realtech',
  'Omaxe Ludhiana',
  'Stallone Manor',
  '7 Creations',
  'Manisa Beaute Co.',
  'Simran Speech & Hearing Clinic',
  'Deep Hospital',
];

export const faqs = [
  {
    q: 'What services does DMM offer?',
    a: 'SEO and GEO, social media, performance ads on Google and Meta, branding and design, outdoor and print advertising, websites and e-commerce, content writing and video production. You can take one service or the whole 360° plan.',
  },
  {
    q: 'What size of business do you work with?',
    a: 'Everyone from individual coaches and single clinics to hospitals, real estate developers and national brands. We shape the plan and the budget to your scale and goals.',
  },
  {
    q: 'Which industries do you know best?',
    a: 'Healthcare, real estate, e-commerce and retail, weddings and hospitality, legal and financial services, education, and startups. Each has its own playbook.',
  },
  {
    q: 'What makes DMM different from other agencies?',
    a: 'We have one primary KPI: revenue. Campaigns are built on research and data, and our in-house team of writers, SEO specialists, social strategists, video editors and developers covers every channel under one roof.',
  },
  {
    q: 'How much do your services cost?',
    a: 'Pricing depends on the services and scope. We offer flexible packages that fit your budget while maximising impact. Start with a free strategy session and we will recommend a plan.',
  },
  {
    q: 'How do you make sure campaigns deliver?',
    a: 'We agree KPIs before we start, track performance in real time, and refine what underperforms every week. You get transparent reports at every stage, so you are always in control.',
  },
];
