import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://saumyaparekh.vercel.app'; // Update to your domain if different

  const staticPages = [
    '',
    '/personal',
    '/archive',
    '/contact',
    '/lithos'
  ].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  const projects = [
    'automated-soil-strain-and-settlement-analysis-system-with-iot-integration',
    'automation-intelligent-machine-guided-construction',
    'promix-concrete-mix-design-compliance-dashboard',
    'soil-analysis-project-with-iot-integration',
    'terminal-vault'
  ].map(id => ({
    url: `${baseUrl}/projects/${id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const logbook = [
    'challenges-in-intelligent-compaction-for-indian-highways',
    'why-is-10262-calculators-often-produce-unrealistic-results'
  ].map(id => ({
    url: `${baseUrl}/logbook/${id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...projects, ...logbook];
}
