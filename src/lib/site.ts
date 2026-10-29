import { getCollection, type CollectionEntry } from "astro:content";
import settings from "../data/settings.json";
import pdfMeta from "../generated/pdf-meta.json";

export { settings };

// Top-level routes that a CMS page must not take over.
const RESERVED = new Set(["guidelines", "news", "events", "gallery", "downloads", "media", "404"]);

export async function getPages() {
  const pages = await getCollection("pages");
  return pages.filter((p) => !RESERVED.has(p.id));
}

export async function getMenu() {
  const pages = (await getPages()).filter((p) => p.data.showInMenu)
    .sort((a, b) => a.data.menuOrder - b.data.menuOrder);
  return [
    { href: "/", label: "Home" },
    { href: "/guidelines/", label: "Guidelines" },
    { href: "/news/", label: "News" },
    { href: "/events/", label: "Events" },
    { href: "/gallery/", label: "Gallery" },
    ...pages.map((p) => ({ href: `/${p.id}/`, label: p.data.title })),
  ];
}

export async function getGuidelines() {
  const list = await getCollection("guidelines");
  return list
    .sort((a, b) => b.data.published.valueOf() - a.data.published.valueOf())
    .map((g) => {
      const m = (pdfMeta as Record<string, { sizeBytes?: number; pages?: number; cover?: string }>)[g.data.file] ?? {};
      return { ...g, meta: { sizeBytes: m.sizeBytes, pages: m.pages, cover: g.data.cover ?? m.cover } };
    });
}
export type Guideline = Awaited<ReturnType<typeof getGuidelines>>[number];

export async function getPosts() {
  return (await getCollection("posts", (p) => !p.data.draft))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export async function getEvents() {
  const all = await getCollection("events");
  const now = Date.now();
  // An event is "upcoming" until the end of its last day.
  const ends = (e: CollectionEntry<"events">) => (e.data.end ?? e.data.start).valueOf() + 24 * 3600 * 1000;
  const upcoming = all.filter((e) => ends(e) >= now).sort((a, b) => a.data.start.valueOf() - b.data.start.valueOf());
  const past = all.filter((e) => ends(e) < now).sort((a, b) => b.data.start.valueOf() - a.data.start.valueOf());
  return { upcoming, past };
}

export async function getAlbums() {
  return (await getCollection("albums")).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

const fmt = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", ...opts });
export const formatDate = (d: Date) => fmt({ day: "numeric", month: "long", year: "numeric" }).format(d);
const hasTime = (d: Date) => d.getUTCHours() !== 0 || d.getUTCMinutes() !== 0;
export const formatTime = (d: Date) => fmt({ hour: "2-digit", minute: "2-digit" }).format(d);
export function formatDateTime(d: Date) {
  return hasTime(d) ? `${formatDate(d)}, ${formatTime(d)}` : formatDate(d);
}
export const formatSize = (bytes?: number) => (bytes ? (bytes / (1024 * 1024)).toFixed(1) + " MB" : undefined);
