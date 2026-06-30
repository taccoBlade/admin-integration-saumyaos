import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/_next/static/media/', // Prevent scrapers from easily crawling original high-res assets
        ],
      },
      {
        // Block aggressive AI crawler scrapers that steal content/designs
        userAgent: ['GPTBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-Web', 'CCBot', 'Google-Extended', 'Omgilibot', 'Diffbot'],
        disallow: '/',
      }
    ],
    sitemap: 'https://saumya.space/sitemap.xml', // Update to your domain if different
  };
}
