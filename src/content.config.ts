import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Notes on database internals. Each .md file in src/content/db-internals/
// becomes a page at /writing/db-internals/<filename>/. `part` sets the
// reading order; `draft: true` shows the note in `astro dev` but leaves it
// out of the production build.
const dbInternals = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/db-internals' }),
  schema: z.object({
    title: z.string(),
    part: z.number().int().positive(),
    date: z.coerce.date(),
    source: z.string().nullish(),
    description: z.string(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { 'db-internals': dbInternals };
