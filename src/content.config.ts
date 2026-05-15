import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const tags = z.array(z.string().min(1)).default([]);
const gardenDate = z.coerce.date().optional();
const related = z.array(z.string()).default([]);

const baseFields = {
  tags,
  created: gardenDate,
  updated: gardenDate,
  related,
  featured: z.boolean().default(false),
  pinned: z.boolean().default(false),
  archived: z.boolean().default(false),
  tint: z.string().optional()
};

const notes = defineCollection({
  loader: glob({ base: './notes', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    ...baseFields,
    title: z.string().min(1),
    subtitle: z.string().optional(),
    status: z.enum(['seedling', 'budding', 'evergreen']).default('seedling'),
    dropcap: z.boolean().default(false),
    illustration: z.string().optional(),
    layout: z.enum(['long', 'fragment']).optional()
  })
});

const tweets = defineCollection({
  loader: glob({ base: './tweets', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    ...baseFields,
    source: z.string().url().optional(),
    author: z.string().optional(),
    handle: z.string().optional(),
    image: z.string().optional(),
    source_date: gardenDate,
    truncated: z.boolean().default(false)
  })
});

const links = defineCollection({
  loader: glob({ base: './links', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    ...baseFields,
    url: z.string().url(),
    title: z.string().min(1),
    domain: z.string().optional(),
    og_image: z.string().optional()
  })
});

const products = defineCollection({
  loader: glob({ base: './products', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    ...baseFields,
    name: z.string().min(1),
    brand: z.string().optional(),
    url: z.string().url().optional(),
    image: z.string().min(1),
    category: z.string().optional()
  })
});

const images = defineCollection({
  loader: glob({ base: './images', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    ...baseFields,
    src: z.string().min(1),
    alt: z.string().min(1),
    caption: z.string().optional(),
    source: z.string().url().optional(),
    aspect: z.enum(['square', 'wide', 'tall', 'portrait-tall']).default('square')
  })
});

export const collections = { notes, tweets, links, products, images };
