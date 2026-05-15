import { getCollection, type CollectionEntry } from 'astro:content';

export type GardenType = 'note' | 'tweet' | 'link' | 'product' | 'image';
type AnyEntry =
  | CollectionEntry<'notes'>
  | CollectionEntry<'tweets'>
  | CollectionEntry<'links'>
  | CollectionEntry<'products'>
  | CollectionEntry<'images'>;

export interface GardenItem {
  type: GardenType;
  slug: string;
  title: string;
  body: string;
  excerpt: string;
  url: string;
  tags: string[];
  created: Date;
  updated: Date;
  featured: boolean;
  pinned: boolean;
  tint?: string;
  status?: 'seedling' | 'budding' | 'evergreen';
  externalUrl?: string;
  domain?: string;
  image?: string;
  alt?: string;
  caption?: string;
  brand?: string;
  author?: string;
  handle?: string;
  truncated?: boolean;
  aspect?: 'square' | 'wide' | 'tall' | 'portrait-tall';
  entry: AnyEntry;
}

const fallbackDate = new Date('2026-05-03T00:00:00Z');

const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');

const routes: Record<GardenType, string> = {
  note: `${base}notes`,
  tweet: `${base}tweets`,
  link: `${base}links`,
  product: `${base}products`,
  image: `${base}images`
};

export function assetPath(value?: string) {
  if (!value) return undefined;
  if (value.startsWith('http')) return value;
  if (value.startsWith('/attachments/')) return `${base}${value.slice(1)}`;
  if (value.startsWith('/')) return value;
  return `${base}attachments/${value}`;
}

export function domainFromUrl(value?: string) {
  if (!value) return undefined;
  try {
    return new URL(value).hostname.replace(/^www\./, '');
  } catch {
    return undefined;
  }
}

export function plainText(value = '') {
  return value
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, slug, label) => label || slug)
    .replace(/[#>*_`~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function excerpt(value = '', max = 180) {
  const text = plainText(value);
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}...`;
}

function cleanTweetText(value = '') {
  return plainText(value)
    .replace(/\shttps?:\/\/t\.co\/\S+$/i, '')
    .trim();
}

export function formatMonthDay(date: Date) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: '2-digit', timeZone: 'UTC' })
    .format(date)
    .toLowerCase();
}

export function formatLongDate(date: Date) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    timeZone: 'UTC'
  })
    .format(date)
    .toLowerCase();
}

export function itemDate(data: { created?: Date; updated?: Date }) {
  return data.updated ?? data.created ?? fallbackDate;
}

function normalizeEntry(entry: AnyEntry): GardenItem {
  const slug = entry.id.replace(/\/index$/, '');
  const body = 'body' in entry ? entry.body ?? '' : '';
  const data = entry.data as Record<string, any>;
  const created = data.created ?? data.updated ?? fallbackDate;
  const updated = data.updated ?? data.created ?? fallbackDate;
  const base = {
    slug,
    body,
    tags: data.tags ?? [],
    created,
    updated,
    featured: Boolean(data.featured),
    pinned: Boolean(data.pinned),
    tint: data.tint,
    entry
  };

  if (entry.collection === 'notes') {
    return {
      ...base,
      type: 'note',
      title: data.title,
      excerpt: excerpt(body),
      url: `${routes.note}/${slug}`,
      status: data.status
    };
  }

  if (entry.collection === 'tweets') {
    const text = cleanTweetText(body);
    return {
      ...base,
      type: 'tweet',
      title: text,
      excerpt: text,
      url: `${routes.tweet}/${slug}`,
      externalUrl: data.source,
      image: assetPath(data.image),
      author: data.author,
      handle: data.handle,
      truncated: Boolean(data.truncated)
    };
  }

  if (entry.collection === 'links') {
    const domain = data.domain ?? domainFromUrl(data.url);
    return {
      ...base,
      type: 'link',
      title: data.title,
      excerpt: excerpt(body),
      url: `${routes.link}/${slug}`,
      externalUrl: data.url,
      domain,
      image: assetPath(data.og_image)
    };
  }

  if (entry.collection === 'products') {
    return {
      ...base,
      type: 'product',
      title: data.name,
      excerpt: data.category ?? data.brand ?? '',
      url: `${routes.product}/${slug}`,
      externalUrl: data.url,
      image: assetPath(data.image),
      alt: `${data.name}${data.brand ? ` by ${data.brand}` : ''}`,
      brand: data.brand
    };
  }

  return {
    ...base,
    type: 'image',
    title: data.caption || data.alt,
    excerpt: data.caption || data.alt,
    url: `${routes.image}/${slug}`,
    externalUrl: data.source,
    image: assetPath(data.src),
    alt: data.alt,
    caption: data.caption,
    aspect: data.aspect
  };
}

export async function getGardenItems() {
  const [notes, tweets, links, products, images] = await Promise.all([
    getCollection('notes', ({ data }) => !data.archived),
    getCollection('tweets', ({ data }) => !data.archived),
    getCollection('links', ({ data }) => !data.archived),
    getCollection('products', ({ data }) => !data.archived),
    getCollection('images', ({ data }) => !data.archived)
  ]);

  return [...notes, ...tweets, ...links, ...products, ...images]
    .map(normalizeEntry)
    .sort(compareGardenItems);
}

export async function getItemsByType(type: GardenType) {
  const items = await getGardenItems();
  return items.filter((item) => item.type === type);
}

export async function getItemsByStatus(status: string) {
  const items = await getGardenItems();
  return items.filter((item) => item.status === status);
}

export function compareGardenItems(a: GardenItem, b: GardenItem) {
  const byPinned = Number(b.pinned) - Number(a.pinned);
  if (byPinned) return byPinned;
  const byDate = itemDate(b).getTime() - itemDate(a).getTime();
  if (byDate) return byDate;
  return `${a.type}/${a.slug}`.localeCompare(`${b.type}/${b.slug}`);
}

export function interleaveItems(items: GardenItem[]) {
  const pinned = items.filter((item) => item.pinned).sort(compareGardenItems);
  const rest = items.filter((item) => !item.pinned).sort(compareGardenItems);
  const buckets = new Map<GardenType, GardenItem[]>();

  for (const item of rest) {
    buckets.set(item.type, [...(buckets.get(item.type) ?? []), item]);
  }

  const result = [...pinned];
  let lastType = result.at(-1)?.type;

  while ([...buckets.values()].some((bucket) => bucket.length > 0)) {
    const candidates = [...buckets.entries()]
      .filter(([type, bucket]) => bucket.length > 0 && type !== lastType)
      .map(([type, bucket]) => ({ type, item: bucket[0] }));

    const pool =
      candidates.length > 0
        ? candidates
        : [...buckets.entries()]
            .filter(([, bucket]) => bucket.length > 0)
            .map(([type, bucket]) => ({ type, item: bucket[0] }));

    pool.sort((a, b) => compareGardenItems(a.item, b.item));
    const pick = pool[0];
    result.push(pick.item);
    buckets.get(pick.type)?.shift();
    lastType = pick.type;
  }

  return result;
}

export function groupByYear(items: GardenItem[]) {
  return items.reduce<Record<string, GardenItem[]>>((groups, item) => {
    const year = String(itemDate(item).getUTCFullYear());
    groups[year] = groups[year] ?? [];
    groups[year].push(item);
    return groups;
  }, {});
}

export function getTagCounts(items: GardenItem[]) {
  const counts = new Map<string, number>();
  for (const item of items) {
    for (const tag of item.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function noteLayout(item: GardenItem) {
  if (item.type !== 'note') return 'fragment';
  const explicit = (item.entry.data as any).layout;
  if (explicit) return explicit;
  return plainText(item.body).length >= 500 ? 'long' : 'fragment';
}
