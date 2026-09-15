// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Production lives at the root of devsmarketingmind.com. The GitHub Pages preview lives under
// /dmm-website, so the deploy workflow sets PAGES_SITE and PAGES_BASE.
const site = process.env.PAGES_SITE ?? 'https://devsmarketingmind.com';
const base = process.env.PAGES_BASE ?? '/';

// Links are written root-relative by hand (`href="/work/"`). Astro prefixes its own asset URLs
// with `base`, but not these, so under a sub-path the built HTML gets the prefix added here.
function prefixLinks() {
  return {
    name: 'dmm:prefix-links',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        if (base === '/') return;
        const prefix = base.replace(/\/$/, '');
        const name = prefix.slice(1).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp(`(href|action)="/(?!/)(?!${name}(?:/|"))`, 'g');
        const walk = async (d) => {
          for (const e of await fs.readdir(d, { withFileTypes: true })) {
            const p = path.join(d, e.name);
            if (e.isDirectory()) await walk(p);
            else if (e.name.endsWith('.html')) {
              const html = await fs.readFile(p, 'utf8');
              await fs.writeFile(p, html.replace(re, `$1="${prefix}/`));
            }
          }
        };
        await walk(fileURLToPath(dir));
      },
    },
  };
}

// https://astro.build/config
export default defineConfig({
  site,
  base,
  integrations: [sitemap(), prefixLinks()],
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  devToolbar: { enabled: false },
});
