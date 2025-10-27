import { loadCityLodgingMarkdown, LodgingMarkdownDoc } from '@/lib/loadCityContext';

export type LodgingZone = {
  id: string;
  name: string;
  descriptor?: string;
  recommendationTag?: string;
  summary?: string;
  geographicArea?: string;
  targetProfiles?: string[];
  advantages?: string[];
  disadvantages?: string[];
  ratings?: Record<string, string>;
  priceRange?: string;
  rawText?: string;
};

export type LodgingZoneReport = {
  city: string;
  summary: string[];
  painPoints: string[];
  comparisonTables: string[];
  zones: LodgingZone[];
  docs: LodgingMarkdownDoc[];
};

export async function loadZoneReports(city: string, language: 'en' | 'fr' | 'es' = 'en'): Promise<LodgingZoneReport> {
  const docs = loadCityLodgingMarkdown(city, language);

  if (docs.length === 0) {
    return {
      city,
      summary: [],
      painPoints: [],
      comparisonTables: [],
      zones: [],
      docs: [],
    };
  }

  const summaryParagraphs = new Set<string>();
  const painPoints = new Set<string>();
  const comparisonTables: string[] = [];
  const zoneMap = new Map<string, LodgingZone>();

  for (const doc of docs) {
    extractExecutiveSummary(doc.content).forEach((p) => summaryParagraphs.add(p));
    extractPainPoints(doc.content).forEach((p) => painPoints.add(p));
    extractTables(doc.content).forEach((table) => {
      if (!comparisonTables.includes(table)) {
        comparisonTables.push(table);
      }
    });

    parseZones(doc.content).forEach((zone) => {
      const key = zone.name.toLowerCase();
      const existing = zoneMap.get(key);
      if (existing) {
        zoneMap.set(key, mergeZones(existing, zone));
      } else {
        zoneMap.set(key, zone);
      }
    });
  }

  return {
    city,
    summary: Array.from(summaryParagraphs),
    painPoints: Array.from(painPoints),
    comparisonTables,
    zones: Array.from(zoneMap.values()),
    docs,
  };
}

function parseZones(markdown: string): LodgingZone[] {
  const lines = markdown.split(/\r?\n/);
  const zones: LodgingZone[] = [];
  let currentHeading: string | null = null;
  let buffer: string[] = [];

  const flush = () => {
    if (!currentHeading) return;
    const zone = buildZone(currentHeading, buffer);
    if (zone) zones.push(zone);
    currentHeading = null;
    buffer = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('### ')) {
      const heading = trimmed.replace(/^###\s*/, '');
      if (/^zone\s+\d+/i.test(heading)) {
        flush();
        currentHeading = heading;
        continue;
      }
    }

    if (currentHeading) {
      buffer.push(line);
    }
  }

  flush();
  return zones;
}

function buildZone(heading: string, rawLines: string[]): LodgingZone | null {
  const cleanedHeading = heading.trim();
  if (!cleanedHeading) return null;

  let afterColon = cleanedHeading.replace(/^Zone\s+\d+:\s*/i, '').trim();
  if (!afterColon) return null;

  let recommendationTag: string | undefined;
  if (afterColon.includes(' - ')) {
    const parts = afterColon.split(' - ');
    afterColon = parts.shift()!.trim();
    recommendationTag = parts.join(' - ').trim();
  }

  let descriptor: string | undefined;
  let name = afterColon;
  const descriptorMatch = afterColon.match(/^(.*?)\s*\((.*?)\)$/);
  if (descriptorMatch) {
    name = descriptorMatch[1].trim();
    descriptor = descriptorMatch[2].trim();
  }

  const id = slugify(name);
  const lines = rawLines.map((line) => line.trim());
  const summary = collectSummary(lines);
  const geographicArea = extractInlineValue(lines, 'Geographic Area');
  const targetProfiles = collectList(lines, 'Target Visitor Profile');
  const advantages = collectList(lines, 'Advantages');
  const disadvantages = collectList(lines, 'Disadvantages');
  const ratings = collectRatings(lines);
  const priceRange = extractInlineValue(lines, 'Price Range') || ratings?.['Price Range'];

  return {
    id,
    name,
    descriptor,
    recommendationTag,
    summary,
    geographicArea,
    targetProfiles,
    advantages,
    disadvantages,
    ratings,
    priceRange,
    rawText: rawLines.join('\n').trim(),
  };
}

function collectSummary(lines: string[]): string | undefined {
  const summaryLines: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (summaryLines.length > 0) break;
      continue;
    }
    if (trimmed.startsWith('**')) break;
    summaryLines.push(trimmed);
  }

  return summaryLines.length ? summaryLines.join(' ').trim() : undefined;
}

function extractInlineValue(lines: string[], label: string): string | undefined {
  const target = `**${label.toLowerCase()}**`;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.toLowerCase().startsWith(target)) continue;
    return trimmed.replace(/^\*\*[^*]+\*\*\s*:\s*/i, '').trim();
  }
  return undefined;
}

function collectList(lines: string[], label: string): string[] | undefined {
  const target = `**${label.toLowerCase()}**`;
  const items: string[] = [];
  let collecting = false;
  for (const raw of lines) {
    const trimmed = raw.trim();
    if (!collecting && trimmed.toLowerCase().startsWith(target)) {
      collecting = true;
      continue;
    }
    if (!collecting) continue;
    if (!trimmed) {
      if (items.length) break;
      continue;
    }
    if (trimmed.startsWith('**')) break;
    if (!/^[-*]/.test(trimmed)) break;
    items.push(trimmed.replace(/^[-*]\s*/, '').trim());
  }
  return items.length ? items : undefined;
}

function collectRatings(lines: string[]): Record<string, string> | undefined {
  const items: Record<string, string> = {};
  const target = '**ratings**';
  let collecting = false;
  for (const raw of lines) {
    const trimmed = raw.trim();
    if (!collecting && trimmed.toLowerCase().startsWith(target)) {
      collecting = true;
      continue;
    }
    if (!collecting) continue;
    if (!trimmed) {
      if (Object.keys(items).length) break;
      continue;
    }
    if (!/^[-*]/.test(trimmed)) break;
    const match = trimmed.match(/^[-*]\s*\*\*(.+?)\*\*:\s*(.+)$/);
    if (match) {
      items[match[1].trim()] = match[2].trim();
    }
  }
  return Object.keys(items).length ? items : undefined;
}

function extractExecutiveSummary(markdown: string): string[] {
  return collectSectionParagraphs(markdown, 'Executive Summary');
}

function collectSectionParagraphs(markdown: string, heading: string): string[] {
  const lines = markdown.split(/\r?\n/);
  const paragraphs: string[] = [];
  const target = heading.toLowerCase();
  let capturing = false;
  let buffer: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('## ')) {
      const title = trimmed.replace(/^##\s*/, '').trim().toLowerCase();
      if (capturing) {
        if (buffer.length) {
          paragraphs.push(buffer.join(' ').trim());
          buffer = [];
        }
        if (title !== target) break;
      }
      capturing = title === target;
      continue;
    }
    if (!capturing) continue;
    if (!trimmed) {
      if (buffer.length) {
        paragraphs.push(buffer.join(' ').trim());
        buffer = [];
      }
      continue;
    }
    if (trimmed.startsWith('#')) break;
    buffer.push(trimmed);
  }

  if (buffer.length) {
    paragraphs.push(buffer.join(' ').trim());
  }

  return paragraphs.filter(Boolean);
}

function extractPainPoints(markdown: string): string[] {
  const lines = markdown.split(/\r?\n/);
  const keywords = ['gap', 'challenge', 'warning', 'alert', 'pain'];
  const points = new Set<string>();
  let capturing = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('## ')) {
      const title = trimmed.replace(/^##\s*/, '').trim().toLowerCase();
      capturing = keywords.some((kw) => title.includes(kw));
      continue;
    }
    if (!capturing) continue;
    if (!trimmed) continue;
    if (trimmed.startsWith('#')) {
      capturing = false;
      continue;
    }
    if (/^[-*]/.test(trimmed)) {
      points.add(trimmed.replace(/^[-*]\s*/, '').trim());
    } else if (!trimmed.startsWith('**')) {
      points.add(trimmed);
    }
  }
  return Array.from(points);
}

function extractTables(markdown: string): string[] {
  const lines = markdown.split(/\r?\n/);
  const tables: string[] = [];
  let buffer: string[] = [];
  for (const line of lines) {
    if (line.trim().startsWith('|')) {
      buffer.push(line);
    } else if (buffer.length) {
      if (buffer.length >= 2) {
        tables.push(buffer.join('\n'));
      }
      buffer = [];
    }
  }
  if (buffer.length >= 2) {
    tables.push(buffer.join('\n'));
  }
  return tables;
}

function mergeZones(base: LodgingZone, incoming: LodgingZone): LodgingZone {
  return {
    id: base.id,
    name: base.name,
    descriptor: base.descriptor || incoming.descriptor,
    recommendationTag: base.recommendationTag || incoming.recommendationTag,
    summary: base.summary || incoming.summary,
    geographicArea: base.geographicArea || incoming.geographicArea,
    targetProfiles: mergeArrays(base.targetProfiles, incoming.targetProfiles),
    advantages: mergeArrays(base.advantages, incoming.advantages),
    disadvantages: mergeArrays(base.disadvantages, incoming.disadvantages),
    ratings: { ...(incoming.ratings || {}), ...(base.ratings || {}) },
    priceRange: base.priceRange || incoming.priceRange,
    rawText: base.rawText || incoming.rawText,
  };
}

function mergeArrays<T>(a?: T[], b?: T[]): T[] | undefined {
  const combined = [...(a || []), ...(b || [])];
  if (!combined.length) return undefined;
  return Array.from(new Set(combined));
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}
