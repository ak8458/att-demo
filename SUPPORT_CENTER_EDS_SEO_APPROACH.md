# Support Center SPA: SEO-Friendly Article Listing URLs

This document describes how to make the [AT&T Business Support Center](https://www.business.att.com/support/supportcenter.html) **SEO-friendly** by structuring the **URLs of the article listings** only. The application remains a **single page application (SPA)** with almost all existing capability retained. No separate article landing pages are created (e.g. no `/support/business-internet`, `/support/business-wireless`, `/support/dedicated-internet` as distinct pages). Missing metadata on content is acceptable.

---

## 1. Scope and Constraints

| Requirement | Meaning |
|-------------|---------|
| **Keep SPA** | One application, one shell. All support content is still served by the same SPA; no conversion to multi-page per article. |
| **Retain capability** | Existing behavior (navigation, filters, search, article display, etc.) is preserved as much as possible. |
| **No article landing pages** | Do **not** create dedicated pages per article (e.g. no `/support/business-internet`, `/support/business-wireless`, `/support/dedicated-internet` as separate HTML pages or routes that represent a single article). |
| **Only change: listing URLs** | The **only** SEO change is to structure the **URLs used for the article listing** (and, if applicable, category/section listing) so they are clean, readable, and SEO-friendly. |
| **Metadata optional** | Content may lack metadata; that is acceptable. No requirement to add per-article or per-listing metadata. |

---

## 2. Current Problem (Listing URLs Only)

Today the support center is an SPA, often with:

- A **main URL** like `/support/supportcenter.html` (or similar) that is not ideal for SEO (file name in path, `.html`).
- **Listing or category links** that may use hashes (`#section`) or opaque query params (`?id=xyz`), which are hard to read and not ideal for sharing or internal linking.

**Goal:** Replace these with **SEO-friendly URLs for the listing experience** only—no new article-level pages, no mandatory metadata.

---

## 3. SEO-Friendly URL Structure for the Listing

### 3.1 Main Support Center URL (Listing Entry Point)

Use a **single, clean URL** for the support center SPA instead of a file-based path.

| Instead of (example) | Prefer (example) |
|----------------------|------------------|
| `/support/supportcenter.html` | `/support` or `/support/` |

**Implementation (high level):**

- Configure the server (or EDS) so that the **canonical** URL for the support center is a path like `/support` (or `/support/`).
- Serve the **same SPA** (same HTML/JS) for that path. No separate “landing page” document is required—just routing/rewrite so `/support` returns the SPA.
- Optional: Redirect old URLs (e.g. `/support/supportcenter.html`) to `/support` with a 301 so equity and bookmarks move to the new URL.

Result: The **listing entry point** has an SEO-friendly URL; the app remains a single page.

### 3.2 Category or Section Listing URLs (Optional)

If the support center has **categories or sections** (e.g. “Business Internet”, “Business wireless”, “Collaboration solutions”), you can give each **listing view** (not each article) an SEO-friendly URL, still within the SPA.

| Use case | URL shape (example) | What it represents |
|----------|----------------------|---------------------|
| Main support center | `/support` | SPA entry; full listing or default view. |
| Category/section listing | `/support/business-internet`, `/support/business-wireless` | Same SPA; URL indicates “listing for this category/section.” **Not** a single-article page. |

**Implementation (high level):**

- Server (or EDS): For paths under `/support/...`, serve the **same SPA** (e.g. `/support` app shell). No separate HTML document per path.
- SPA: On load, read the path (e.g. `/support/business-internet`), parse the segment (e.g. `business-internet`), and show the **listing** for that category/section. Use History API (`pushState` / `replaceState`) when the user changes category so the URL stays in sync.
- **Do not** create paths that represent **one article** (e.g. no `/support/dedicated-internet` for a single “Dedicated Internet” article). Those stay in-app (e.g. hash, query, or modal) and are not given dedicated URLs.

So “SEO-friendly listing URLs” = clean main URL + optional category-level paths for listing views only. No article landing pages.

### 3.3 Links in the Listing (No Article Landing Pages)

Links that **open an article** inside the SPA do **not** need to be full path-based “landing” URLs, since we are not creating article landing pages.

- **Option A (simplest):** Keep article links as in-app only (e.g. `#article-id`, `?article=id`, or JS-driven panel/modal). The **listing** is what has the SEO-friendly URL; article access stays SPA-internal.
- **Option B:** If you want shareable URLs for articles without creating real landing pages, you could use a **single** path with query or hash (e.g. `/support?article=article-id` or `/support#article-id`). The server still serves only the SPA for `/support`; the SPA reads query/hash and shows the article. This improves shareability without adding any `/support/<article-slug>` pages.

Either way, **no** URLs of the form `/support/business-internet`, `/support/business-wireless`, `/support/dedicated-internet` as **article** pages.

---

## 4. What We Do Not Do

- **No article landing pages** — No dedicated URLs or HTML pages for individual articles (e.g. no `/support/business-internet`, `/support/business-wireless`, `/support/dedicated-internet` as article pages).
- **No migration to multi-page EDS** — No conversion of the support center into one EDS document per article; the app stays one SPA.
- **No mandatory metadata** — No requirement to add or fix metadata for content; missing metadata is acceptable.
- **No change to core capability** — No removal of existing features; only URL structure for the listing is targeted for SEO.

---

## 5. Implementation Outline

1. **Define the canonical listing URL**  
   Choose the main support URL (e.g. `/support` or `/support/`). Ensure the server (or EDS) serves the SPA at that path.

2. **Optional: category listing paths**  
   If you use category/section listings, define a convention (e.g. `/support/<category-slug>`). Configure the server to serve the same SPA for all `/support` and `/support/*` paths. In the SPA, parse the path and show the corresponding listing view; use History API when switching categories.

3. **Keep article access in-app**  
   Do not introduce `/support/<article-slug>` routes. Keep article display via hash, query, or client state only.

4. **Optional: redirect old URL**  
   If the current URL is something like `/support/supportcenter.html`, add a 301 redirect to `/support` so the listing URL is canonical and SEO-friendly.

5. **Internal links and sitemaps**  
   Use the new listing URL(s) in internal links and, if you have a sitemap, include only the listing URL(s) (e.g. `/support` and optionally `/support/category-slug`), not article URLs.

---

## 6. Success Criteria

- The **main support center** is available at a **single, SEO-friendly URL** (e.g. `/support`).
- **Listing-level** URLs (main and, if used, category listings) are **readable and stable** (path-based, no opaque ids in path).
- **No article landing pages** exist (no `/support/business-internet`, `/support/business-wireless`, `/support/dedicated-internet` as article pages).
- The application remains a **single page application** with **existing capability** largely unchanged.
- **Metadata** is not a requirement; missing metadata is acceptable.

---

## 7. References

- [AT&T Business Support Center](https://www.business.att.com/support/supportcenter.html) (current SPA).
- Project skills (for any future block or routing work): **building-blocks**, **content-driven-development**, **page-import**, **docs-search**.
