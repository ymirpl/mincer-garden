import rss from '@astrojs/rss';
import { getItemsByType } from '../lib/content';

export async function GET(context) {
  const notes = await getItemsByType('note');

  return rss({
    title: 'garden.mincer notes',
    description: 'notes from garden.mincer',
    site: context.site,
    items: notes.map((item) => ({
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
