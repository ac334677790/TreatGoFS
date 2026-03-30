import { createWriteStream } from 'fs';
import { SitemapStream } from 'sitemap';

const sitemap = new SitemapStream({ hostname: 'https://tubosu.com' });

const pages = [
  '/',
  '/overview',
  '/login',
  '/contact',
  '/about',
  '/privacy',
  '/terms',
];

const writeStream = createWriteStream('./dist/sitemap.xml');
sitemap.pipe(writeStream);

pages.forEach((url) => {
  sitemap.write({ url, changefreq: 'weekly', priority: 0.8 });
});

sitemap.end();
