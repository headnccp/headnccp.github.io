# National Cancer Control Programme website

Static site hosted on GitHub Pages. No build step: edit the files and push.

## Structure

```
index.html                  Home page
guidelines/index.html       All guidelines (download page)
data/guidelines.json        List of guidelines shown on the site
downloads/guidelines/       Guideline PDFs
assets/css/main.css         Site styles
assets/js/guidelines.js     Renders guideline cards from data/guidelines.json
assets/img/covers/          Cover thumbnails (first page of each PDF)
```

New sections (news, resources, about, ...) go in their own folder with an
`index.html`, e.g. `about/index.html`, and a link in the `<nav>` of every page.

## Adding a guideline

1. Put the PDF in `downloads/guidelines/` with a lowercase, hyphenated name,
   e.g. `national-palliative-care-guidelines-2027.pdf`.
2. Optional: add a cover image to `assets/img/covers/` (same name, `.jpg`).
   With poppler installed:
   `pdftoppm -f 1 -l 1 -singlefile -jpeg -scale-to-x 600 -scale-to-y -1 <pdf> assets/img/covers/<name>`
3. Add an entry to `data/guidelines.json` (newest first). `sizeBytes` is the
   file size in bytes; `pages` is the page count.
4. Commit and push. The site updates within a minute or two.

PDFs must be under 100 MB (GitHub's per-file limit).
