# National Cancer Control Programme website

Live site: https://headnccp.github.io/

Built with [Astro](https://astro.build) and hosted on GitHub Pages. Content is
edited through [Pages CMS](https://app.pagescms.org): no programming needed.

## Editing content (no code)

1. Go to https://app.pagescms.org and sign in with GitHub.
2. Open the **headnccp/headnccp.github.io** repository (branch `main`).
3. Pick a section on the left, fill in the form, and press **Save**.
4. The site rebuilds automatically and the change is live in 1-2 minutes
   (progress: the repository's **Actions** tab).

| Section         | What it is                                                         |
| --------------- | ------------------------------------------------------------------ |
| Guidelines      | Upload a PDF; page count, size and cover are added automatically.  |
| News            | Articles with a cover photo. Tick *Draft* to hide one.             |
| Events          | Date/time, venue, registration link; add photos after the event.  |
| Gallery albums  | Photo albums.                                                      |
| Pages           | Any other page (About, Contact, ...). Choose if it shows in the menu. |
| Site settings   | Site name, home page text, contact details, footer.                |

To give someone editing access: repository **Settings → Collaborators → Add
people** (they need a free GitHub account).

Keep photos under about 5 MB each (phone photos are fine). Large photos are
resized automatically for the website, but the originals are stored in the
repository, which works best under about 1 GB in total.

**Links that must not change** (printed QR codes point to them):
`/guidelines/` and `/downloads/guidelines/national-cancer-treatment-guidelines-2026.pdf`.
Don't rename or delete that PDF.

## For developers

```
npm install
npm run dev        # http://localhost:4321
npm run build      # outputs dist/
```

Requires Node 24. Install poppler (`pdfinfo`, `pdftoppm`) locally to get PDF
page counts and covers; without it the build still works and skips them.

```
src/content/          Content edited in the CMS (Markdown files)
  guidelines/ posts/ events/ albums/ pages/
src/data/settings.json Site settings
src/content.config.ts  Content schemas (must match .pages.yml)
src/pages/             Routes
src/layouts/ src/components/ src/styles/
public/downloads/guidelines/  Guideline PDFs
public/media/images/          Uploaded photos
public/media/qr/              QR codes
scripts/prepare-content.mjs   Pre-build: PDF metadata, covers, photo resizing
tools/make_qr.py              QR code generator (python tools/make_qr.py <url> <out.png>)
.pages.yml                    CMS forms
.github/workflows/deploy.yml  Build and deploy on every push to main
```

When adding a field, update both `.pages.yml` and `src/content.config.ts`.
