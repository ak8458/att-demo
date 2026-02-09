# JSON2HTML Quick Reference

## Quick Start

### 1. Configure JSON2HTML Worker

Replace `YOUR_ADMIN_TOKEN_HERE` with your actual AEM Admin API token:

```bash
curl -X POST \
  https://json2html.adobeaem.workers.dev/config/ak8458/att-demo/main \
  -H "Authorization: token YOUR_ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '[
    {
      "path": "/support/supportcenter/",
      "endpoint": "https://services.att.com/kmservices/v2/contents/{{id}}?app-id=gmarket",
      "regex": "/[^/]+$/",
      "template": "/templates/support-center.html",
      "headers": {
        "Accept": "application/json",
        "Content-Type": "application/json"
      }
    }
  ]'
```

### 2. Add Overlay to Content Source

Add this to your content source configuration:

```json
{
  "overlay": {
    "url": "https://json2html.adobeaem.workers.dev/ak8458/att-demo/main",
    "type": "markup"
  }
}
```

### 3. Test URL

Visit: `https://main--att-demo--ak8458.aem.page/support/supportcenter/000096620`

## Configuration Details

- **Organization**: `ak8458`
- **Site**: `att-demo`
- **Branch**: `main`
- **Path Pattern**: `/support/supportcenter/`
- **Template**: `/templates/support-center.html`
- **API Endpoint**: `https://services.att.com/kmservices/v2/contents/{{id}}?app-id=gmarket`

## Files

- Template: `templates/support-center.html`
- Full Documentation: `JSON2HTML_IMPLEMENTATION.md`
