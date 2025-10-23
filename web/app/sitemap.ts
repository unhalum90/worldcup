import { MetadataRoute } from 'next';
import { teams } from '@/lib/teamsData';
import { cityGuides } from '@/lib/cityGuidesData';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://worldcup26fanzone.com';
  
  // Host cities for forums
  const cities = [
    'atlanta', 'boston', 'dallas', 'houston', 'kansas-city', 'los-angeles',
    'miami', 'new-york', 'philadelphia', 'san-francisco', 'seattle',
    'toronto', 'vancouver', 'guadalajara', 'mexico-city', 'monterrey'
  ];

  // City pages (forums and legacy cityguides)
  const cityPages = cities.flatMap(city => [
    {
      url: `${baseUrl}/cities/${city}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/forums/${city}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }
  ]);

  // Team pages
  const teamPages = teams.map(team => ({
    url: `${baseUrl}/teams/${team.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // City guide pages
  const guidePages = cityGuides.map(city => ({
    url: `${baseUrl}/guides/${city.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: city.isAvailable ? 0.9 : 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/teams`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/guides`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/forums`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/planner`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/planner/trip-builder`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/cityguides`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    ...teamPages,
    ...guidePages,
    ...cityPages,
  ];
}
