import fs from 'fs';
import path from 'path';
import { MetadataRoute } from 'next';
import { teams } from '@/lib/teamsData';
import { cityGuides } from '@/lib/cityGuidesData';
import { groups } from '@/data/groups';

const baseUrl = 'https://worldcup26fanzone.com';
const now = new Date();

type ChangeFrequency = MetadataRoute.Sitemap[number]['changeFrequency'];

const staticRoutes: Array<{
  path: string;
  changeFrequency: ChangeFrequency;
  priority: number;
  lastModified?: Date;
}> = [
  { path: '/', changeFrequency: 'daily', priority: 1, lastModified: now },
  { path: '/planner', changeFrequency: 'weekly', priority: 0.9, lastModified: now },
  { path: '/planner/trip-builder', changeFrequency: 'weekly', priority: 0.85, lastModified: now },
  { path: '/flight-planner', changeFrequency: 'weekly', priority: 0.75, lastModified: now },
  { path: '/lodging-planner', changeFrequency: 'weekly', priority: 0.75, lastModified: now },
  { path: '/memberships', changeFrequency: 'monthly', priority: 0.7, lastModified: now },
  { path: '/trip_builder_demo', changeFrequency: 'monthly', priority: 0.5, lastModified: now },
  { path: '/cityguides', changeFrequency: 'weekly', priority: 0.8, lastModified: now },
  { path: '/guides', changeFrequency: 'weekly', priority: 0.9, lastModified: now },
  { path: '/groups', changeFrequency: 'weekly', priority: 0.9, lastModified: now },
  { path: '/teams', changeFrequency: 'weekly', priority: 0.9, lastModified: now },
  { path: '/forums', changeFrequency: 'daily', priority: 0.8, lastModified: now },
  { path: '/blog', changeFrequency: 'weekly', priority: 0.7, lastModified: now },
  // Blog posts (manually added static entries)
  { path: '/blog/transit-friendly-lodging-zones-2026', changeFrequency: 'weekly', priority: 0.75, lastModified: now },
  { path: '/contact', changeFrequency: 'monthly', priority: 0.5, lastModified: now },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.3, lastModified: now },
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.3, lastModified: now },
];

const hostCities = [
  'atlanta',
  'boston',
  'dallas',
  'houston',
  'kansas-city',
  'los-angeles',
  'miami',
  'new-york',
  'philadelphia',
  'san-francisco',
  'seattle',
  'toronto',
  'vancouver',
  'guadalajara',
  'mexico-city',
  'monterrey',
] as const;

const groupsBestDir = path.join(process.cwd(), 'app/groups_best');
const groupsBestSlugs = fs.existsSync(groupsBestDir)
  ? fs
      .readdirSync(groupsBestDir)
      .filter((file) => file.endsWith('_best.md'))
      .map((file) => file.replace('_best.md', '').replace(/_/g, '-'))
  : [];

const toDate = (value?: string) => {
  if (!value) {
    return now;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.valueOf()) ? now : parsed;
};

const formatUrl = (path: string) => (path === '/' ? baseUrl : `${baseUrl}${path}`);

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: formatUrl(route.path),
    lastModified: route.lastModified ?? now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const teamEntries: MetadataRoute.Sitemap = teams.map((team) => ({
    url: `${baseUrl}/teams/${team.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const guideEntries: MetadataRoute.Sitemap = cityGuides.map((city) => ({
    url: `${baseUrl}/guides/${city.slug}`,
    lastModified: toDate(city.releaseDate),
    changeFrequency: city.isAvailable ? 'weekly' : 'monthly',
    priority: city.isAvailable ? 0.9 : 0.7,
  }));

  const groupEntries: MetadataRoute.Sitemap = groups.map((group) => ({
    url: `${baseUrl}/groups/${group.id.toLowerCase()}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  const groupsBestEntries: MetadataRoute.Sitemap = groupsBestSlugs.map((slug) => ({
    url: `${baseUrl}/groups_best/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const cityEntries: MetadataRoute.Sitemap = hostCities.flatMap((city) => [
    {
      url: `${baseUrl}/cities/${city}`,
      lastModified: now,
      changeFrequency: 'weekly' as ChangeFrequency,
      priority: 0.65,
    },
    {
      url: `${baseUrl}/forums/${city}`,
      lastModified: now,
      changeFrequency: 'daily' as ChangeFrequency,
      priority: 0.65,
    },
  ]);

  return [
    ...staticEntries,
    ...teamEntries,
    ...guideEntries,
    ...groupEntries,
    ...groupsBestEntries,
    ...cityEntries,
  ];
}
