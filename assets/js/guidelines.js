// Renders guideline cards from data/guidelines.json into any element with
// [data-guidelines]. Paths in the JSON are relative to the site root; the
// element's data-root attribute gives the path from the current page to it.
(function () {
  const targets = document.querySelectorAll("[data-guidelines]");
  if (!targets.length) return;

  const downloadIcon =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 3v12m0 0-5-5m5 5 5-5M4 21h16"/></svg>';

  function formatSize(bytes) {
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function card(g, root) {
    const meta = [g.edition && "Edition " + g.edition, g.pages && g.pages + " pages", "PDF, " + formatSize(g.sizeBytes)]
      .filter(Boolean)
      .join(" · ");
    return `
      <li class="guideline-card" id="${escapeHtml(g.id)}">
        ${g.cover ? `<img src="${root}${escapeHtml(g.cover)}" alt="Cover of ${escapeHtml(g.title)}" loading="lazy">` : ""}
        <div class="body">
          ${g.category ? `<span class="tag">${escapeHtml(g.category)}</span>` : ""}
          <h3>${escapeHtml(g.title)} ${escapeHtml(g.edition || "")}</h3>
          <p class="meta">${escapeHtml(g.publisher || "")}</p>
          <p class="summary">${escapeHtml(g.summary || "")}</p>
          <p class="meta">${meta}</p>
          <a class="btn" href="${root}${escapeHtml(g.file)}" download>${downloadIcon}Download PDF</a>
        </div>
      </li>`;
  }

  targets.forEach(async (el) => {
    const root = el.dataset.root || "";
    const limit = Number(el.dataset.limit) || Infinity;
    try {
      const res = await fetch(root + "data/guidelines.json");
      const list = await res.json();
      el.innerHTML = list.slice(0, limit).map((g) => card(g, root)).join("");
    } catch (err) {
      el.innerHTML = "<li>Could not load guidelines. Please refresh the page.</li>";
    }
  });
})();
