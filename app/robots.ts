import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',        // Private CMS — never index
          '/auth/',         // Login routes — never index
          '/api/',          // API endpoints — never index
          '/_next/static/media/', // Prevent scraping high-res assets
        ],
      },
      {
        // Block aggressive AI crawler scrapers that steal content/designs
        userAgent: ['GPTBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-Web', 'CCBot', 'Google-Extended', 'Omgilibot', 'Diffbot'],
        disallow: '/',
      }
    ],
    sitemap: 'https://saumya.space/sitemap.xml',
  };
}
