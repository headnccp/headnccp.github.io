import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// Dates from the CMS are wall-clock times in Kenya with no offset
// ("2026-11-04" or "2026-11-04T09:00"). Store them as UTC and always format
// them in UTC so the build machine's timezone never shifts them.
const date = z.union([z.date(), z.string()]).transform((v) => {
  if (v instanceof Date) return v;
  const iso = /[zZ]|[+-]\d\d:?\d\d$/.test(v) ? v : v + (v.length <= 10 ? "T00:00:00Z" : "Z");
  return new Date(iso);
});

// Optional text fields come back from the CMS as "" when left empty.
const optional = z.string().optional().transform((v) => v || undefined);
const photos = z.array(z.string()).nullish().transform((v) => (v ?? []).filter(Boolean));

const guidelines = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/guidelines" }),
  schema: z.object({
    title: z.string(),
    edition: z.coerce.string().optional(),
    category: optional,
    publisher: optional,
    published: date,
    summary: optional,
    file: z.string(),
    cover: optional,
  }),
});

const posts = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/posts" }),
  schema: z.object({
    title: z.string(),
    date,
    summary: optional,
    cover: optional,
    draft: z.boolean().default(false),
  }),
});

const events = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/events" }),
  schema: z.object({
    title: z.string(),
    start: date,
    end: date.optional(),
    location: optional,
    summary: optional,
    cover: optional,
    registration: optional,
    photos,
  }),
});

const albums = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/albums" }),
  schema: z.object({
    title: z.string(),
    date,
    description: optional,
    cover: optional,
    photos,
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    description: optional,
    showInMenu: z.boolean().default(false),
    menuOrder: z.number().default(100),
  }),
});

export const collections = { guidelines, posts, events, albums, pages };
