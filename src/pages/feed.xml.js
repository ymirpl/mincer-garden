import rss from '@astrojs/rss';
import { getGardenItems } from '../lib/content';

export async function GET(context) {
  const items = await getGardenItems();

  return rss({
    title: 'garden.mincer',
    description: 'a public digital garden tended in markdown',
    site: context.site,
    items: items.map((item) => ({
      title: item.title,
      pubDate: itemDateSafe(item.updated),
      description: item.excerpt,
      link: item.url
    }))
  });
}

function itemDateSafe(value) {
  return value instanceof Date ? value : new Date(value);
}
