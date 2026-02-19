# BYOM POC: Dynamic Pages via Overlay (AEM Author OSGI Servlet)

## Goal

- Use **BYOM as an overlay** on top of the existing AEM content source.
- Serve **dynamic article pages** at **variable paths** (e.g. `/support/internet/3487785`, `/support/article/wireless/KM1009376`) by generating semantic HTML in an **AEM Author OSGI service/servlet** that calls your origin API and returns EDS-ready markup.
- **No persistence of HTML in your BYOM service** — EDS pulls from your overlay and persists to the EDS content bus on preview/publish.

**Site:** `main--nimbleraccoon07958--aemsitestrial.aem.live`  
**Org:** `aemsitestrial`, **Site:** `nimbleraccoon07958`, **Ref:** `main`

---

## Persistence: Do You Need to Store HTML?

**Short answer: No.** You do **not** persist HTML in the overlay. EDS **pulls** from your overlay and **EDS** persists to the content bus.

| Where | Who persists | What happens |
|-------|----------------|---------------|
| **Your BYOM service (AEM servlet)** | No storage required | On each request from EDS: generate HTML (e.g. call origin API → build semantic HTML) and return it. Stateless. |
| **EDS content bus** | EDS | When you trigger **preview** or **publish**, EDS **GETs** your overlay URL for that path, receives the HTML, and **stores** it in the EDS preview (or live) partition. |

Flow:

1. Author (or automation) calls **POST** `https://admin.hlx.page/preview/aemsitestrial/nimbleraccoon07958/main/{path}` (or visits the preview URL).
2. EDS resolves the path; for paths covered by the overlay, EDS **GETs** `https://your-byom-url/{path}.html` (or your configured URL + path + suffix).
3. Your AEM servlet receives the GET, calls the origin API (e.g. for `3487785` or `KM1009376`), builds semantic HTML, returns 200 + HTML.
4. EDS stores that response in the **preview** content bus.
5. When you **publish** that path, EDS copies from preview to **live** (content bus + CDN).

So: you **do not** “submit” HTML to the overlay. The overlay is a **live endpoint** that **returns** HTML when EDS asks. EDS then persists that response. Your servlet can be stateless and generate on demand every time (or cache internally if you want; EDS doesn’t care).

---

## How BYOM Overlay Fits In

- **Primary content source:** Existing AEM content (unchanged).
- **Overlay:** Your BYOM URL. EDS checks the overlay **first** for a path. If the overlay returns **200** with HTML, EDS uses it and stores it in the content bus. If the overlay returns **404** (or error), EDS falls back to the primary source.
- **URL EDS calls:** `{overlay.url}{contentPath}{suffix}`  
  Example: overlay `url` = `https://aem-author.example.com/bin/eds/byom`, `suffix` = `.html` → for path `/support/internet/3487785` EDS requests:  
  `https://aem-author.example.com/bin/eds/byom/support/internet/3487785.html`  
  Your servlet parses the path, extracts IDs/categories, calls the origin API, returns HTML.

---

## Step-by-Step POC

### Step 1: AEM Author OSGI servlet (BYOM endpoint)

Implement a servlet (or Sling servlet) that:

- **Path:** e.g. `/bin/eds/byom` (or under a path you reserve for BYOM). The **full BYOM base URL** you give to EDS will be this (e.g. `https://aem-author.example.com/bin/eds/byom`).
- **Method:** GET.
- **Request:** EDS appends the content path + suffix. Example: `/bin/eds/byom/support/internet/3487785.html` → content path = `/support/internet/3487785`.
- **Logic:**
  - Parse the request path to get the “content path” (strip your servlet path and optional `.html` suffix).
  - Map path to origin API: e.g. `/support/internet/3487785` → call origin with id `3487785` and category “internet”; `/support/article/wireless/KM1009376` → id `KM1009376`, category “article/wireless”.
  - Call the origin API (HTTP client from AEM).
  - Build **full semantic HTML** (see below) from the API response.
  - Set `Content-Type: text/html`, return 200 and the HTML. On error or “not found”, return 404 so EDS falls back to primary source.

**Minimal semantic HTML** (from [BYOM](https://www.aem.live/developer/byom)):

- `<!DOCTYPE html>`, `<html>`, `<head>` (e.g. `<title>` from API), `<body>`.
- `<header></header>`, `<main>...</main>`, `<footer></footer>`.
- Inside `<main>`: one or more **sections** (top-level `<div>`s), **blocks** (`<div class="block-name">`), **default content** (`<h1>`, `<p>`, etc.).
- Optional: **metadata block** (`<div class="metadata">`) for title, description, etc.

Example for one article (structure only; you fill from API):

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Article Title from API</title>
  </head>
  <body>
    <header></header>
    <main>
      <div>
        <div class="hero">
          <div>
            <div>
              <h1>Article Title</h1>
              <p>Summary or first paragraph from API.</p>
            </div>
          </div>
        </div>
        <p>Body content from API...</p>
        <div class="metadata">
          <div>
            <div><p>Description</p></div>
            <div><p>SEO description from API</p></div>
          </div>
        </div>
      </div>
    </main>
    <footer></footer>
  </body>
</html>
```

- **Reachability:** EDS (Adobe’s side) must be able to **GET** this servlet. So AEM Author (or a reverse proxy in front of it) must be reachable at a **public URL** (e.g. `https://aem-author.example.com` or a gateway URL). If Author is only on VPN, you’ll need a proxy/tunnel that exposes the servlet to the internet.

---

### Step 2: Variable paths and mapping to origin API

Paths are **dynamic** and depend on the origin API (e.g. `/support/internet/3487785`, `/support/article/wireless/KM1009376`). The servlet should:

- Accept **any** path under your overlay (e.g. `/support/...`). EDS will call your base URL + that path + suffix.
- **Parse** the path to get:
  - **ID:** e.g. `3487785`, `KM1009376` (last segment or from a known segment).
  - **Category/type:** e.g. `internet`, `article/wireless` (from path segments) to choose the right origin API or template.
- Call the **origin API** with that id (and optionally category).
- Map **API response → semantic HTML** (titles, body, metadata, blocks) and return it.

You can define path patterns in the servlet (e.g. regex or path templates) and optionally different templates or API endpoints per pattern (e.g. `/support/internet/{id}` vs `/support/article/wireless/{id}`).

---

### Step 3: Configure overlay in site config (content config)

Site uses **configuration service**. Add the **overlay** to the **content** config (do **not** replace the existing AEM source).

**Read current config** (to preserve existing `source`):

```bash
curl -s -H 'x-auth-token: <your-auth-token>' \
  'https://admin.hlx.page/config/aemsitestrial/sites/nimbleraccoon07958/content.json' | jq .
```

**Update content config** to add `overlay` (replace `<BYOM_BASE_URL>` with the public URL of your servlet, e.g. `https://aem-author.example.com/bin/eds/byom`):

```bash
# If the API supports PATCH/POST for content sub-resource, you can post only content. Otherwise GET full site config, add overlay, PUT back.

curl -X POST 'https://admin.hlx.page/config/aemsitestrial/sites/nimbleraccoon07958/content.json' \
  -H 'content-type: application/json' \
  -H 'x-auth-token: <your-auth-token>' \
  --data '{
    "source": {
      "url": "<EXISTING_AEM_SOURCE_URL>"
    },
    "overlay": {
      "url": "<BYOM_BASE_URL>",
      "type": "markup",
      "suffix": ".html"
    }
  }'
```

**Important:** Keep the existing `source` (AEM) as-is; only add (or update) `overlay`. If the Admin API expects the full site config for POST, use “Update Site Config” or “Update Content Location” and send the full `content` object including both `source` and `overlay`. See [Config service](https://www.aem.live/docs/config-service-setup) and [Admin API](https://www.aem.live/docs/admin.html) (Site Config / content).

Overlay behavior: EDS will request your servlet for **every** path first (or only paths under a prefix if the product supports overlay path filtering). Your servlet returns **404** for paths you don’t handle (e.g. non-`/support/` paths) so EDS falls back to AEM source for those.

---

### Step 4: Preview and publish dynamic paths

- **Single path preview:**  
  `POST https://admin.hlx.page/preview/aemsitestrial/nimbleraccoon07958/main/support/internet/3487785`  
  EDS will GET your overlay for `/support/internet/3487785.html`, store the result in preview, and return status.

- **Single path publish:**  
  `POST https://admin.hlx.page/live/aemsitestrial/nimbleraccoon07958/main/support/internet/3487785`

- **Bulk preview/publish:** Use the bulk preview/publish jobs with `paths` (e.g. `["/support/internet/3487785", "/support/article/wireless/KM1009376"]`).

- **Browser:** Visiting `https://main--nimbleraccoon07958--aemsitestrial.aem.live/support/internet/3487785` (preview) will trigger EDS to fetch from your overlay and serve the stored (or freshly fetched) content depending on flow.

---

## Summary checklist

| Step | Action |
|------|--------|
| 1 | Implement AEM Author OSGI servlet: GET endpoint that receives EDS path, parses it, calls origin API, returns full semantic HTML (or 404). |
| 2 | Expose AEM Author (or proxy) at a public URL so EDS can GET the servlet. |
| 3 | Add **overlay** to site content config (org `aemsitestrial`, site `nimbleraccoon07958`) with `url` = servlet base URL, `type`: `markup`, `suffix`: `.html`. Keep existing AEM `source`. |
| 4 | Preview/publish paths (e.g. `/support/internet/3487785`). EDS pulls from overlay and persists to content bus; no need to persist HTML in your service. |

---

## References

- [Bring Your Own Markup (BYOM)](https://www.aem.live/developer/byom)
- [Markup, Sections, Blocks, and Auto Blocking](https://www.aem.live/developer/markup-sections-blocks)
- [Config service setup](https://www.aem.live/docs/config-service-setup)
- [AEM Admin API](https://www.aem.live/docs/admin.html) — preview, publish, Site Config / content
