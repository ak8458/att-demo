# JSON2HTML Implementation for AT&T Support Center

## Overview

This document outlines the implementation plan for using Adobe's JSON2HTML worker to transform AT&T's support center JSON API responses into Edge Delivery Services-friendly HTML pages.

## Source Information

- **Target Page**: https://www.business.att.com/support/supportcenter.html?content!000096620#topic_popularsupport
- **JSON API Endpoint**: https://services.att.com/kmservices/v2/contents/000096620?app-id=gmarket
- **Content ID Pattern**: `000096620` (appears to be dynamic)

## Understanding JSON2HTML

Based on the [JSON2HTML documentation](https://www.aem.live/developer/json2html), the service:

1. Fetches JSON data from a configured endpoint
2. Transforms it using a Mustache template
3. Returns Edge Delivery Services-friendly HTML
4. Works as an overlay service that intercepts requests and transforms them

### Key Configuration Parameters

- `path`: URL path pattern to match (e.g., `/support/supportcenter/`)
- `endpoint`: API endpoint URL (can use `{{id}}` placeholder)
- `regex`: Pattern to extract ID from URL (e.g., `/[^/]+$/`)
- `template`: Path to Mustache template file
- `headers`: Custom headers for API requests
- `forwardHeaders`: Headers to forward from incoming request
- `arrayKey` & `pathKey`: For filtering arrays of data

## Implementation Questions

Before implementing, I need clarification on the following:

### 1. JSON Structure
**Question**: Can you provide a sample JSON response from `https://services.att.com/kmservices/v2/contents/000096620?app-id=gmarket`?

**Why**: I need to understand:
- The root structure of the JSON
- What fields contain the content (title, description, body, etc.)
- If there are nested objects or arrays
- What metadata fields exist

### 2. URL Path Mapping
**Question**: What URL paths should trigger this JSON2HTML transformation?

**Options**:
- `/support/supportcenter/` - matches all support center pages
- `/support/supportcenter/*` - matches specific content IDs
- `/support/*` - broader matching

**Example**: If a user visits `/support/supportcenter/000096620`, should it fetch JSON for content ID `000096620`?

### 3. Content ID Extraction
**Question**: How should the content ID be extracted from the URL?

**Current observation**: The URL pattern appears to be:
- Query param: `?content!000096620`
- Or path-based: `/support/supportcenter/000096620`

**Options**:
- Extract from query parameter `content!`
- Extract from URL path (last segment)
- Extract from hash `#topic_popularsupport`

### 4. Repository Configuration
**Question**: What are your AEM Edge Delivery Services configuration details?

**Required**:
- **Organization**: `?` (e.g., `ak8458` based on GitHub username)
- **Site**: `?` (e.g., `att-demo` based on repo name)
- **Branch**: `?` (likely `main`)
- **Admin Token**: Do you have an AEM Admin API token for configuration?

### 5. API Authentication
**Question**: Does the AT&T API require any authentication headers?

**Current**: The endpoint uses `app-id=gmarket` as a query parameter. Are there any other requirements?
- API keys in headers?
- Authentication tokens?
- CORS restrictions?

### 6. HTML Structure Requirements
**Question**: What specific HTML structure should the Mustache template generate?

**From the documentation**, Edge Delivery Services expects:
- Section divs: `<div>...</div>` (one per section)
- Blocks: `<div class="block-name">` with nested divs
- Semantic HTML structure

**What should be included**:
- Page title/heading?
- Description/summary?
- Main content body?
- Related links?
- Navigation elements?
- Metadata (meta tags)?

### 7. Template Location
**Question**: Where should the Mustache template be stored?

**Standard location**: `/templates/support-center.html` or `/templates/support/supportcenter.html`

**Should I create**: A `templates/` directory in the repository root?

### 8. Multiple Content IDs
**Question**: Will this handle multiple different content IDs, or just one specific page?

**If multiple**: We'll need a dynamic regex pattern to extract any content ID.
**If single**: We can hardcode the content ID in the endpoint.

## Proposed Solution Structure

### 1. Mustache Template

**Location**: `/templates/support-center.html`

**Structure** (pending JSON structure confirmation):
```html
<div>
  <!-- Main content section -->
  <h1>{{title}}</h1>
  {{#description}}
  <p>{{description}}</p>
  {{/description}}
  
  {{#body}}
  <div>
    {{{body}}}
  </div>
  {{/body}}
  
  {{#relatedLinks}}
  <div class="related-links">
    <h2>Related Links</h2>
    <ul>
      {{#links}}
      <li><a href="{{url}}">{{title}}</a></li>
      {{/links}}
    </ul>
  </div>
  {{/relatedLinks}}
</div>

<div>
  <!-- Metadata section -->
  <div class="metadata">
    <div>
      <div>title</div>
      <div>{{title}}</div>
    </div>
    {{#description}}
    <div>
      <div>description</div>
      <div>{{description}}</div>
    </div>
    {{/description}}
  </div>
</div>
```

### 2. JSON2HTML Configuration

**Configuration Object** (pending answers to questions above):
```json
[
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
]
```

### 3. cURL Command for Configuration

**Ready-to-use command** (replace `<your-admin-token>` with your actual AEM Admin API token):

```bash
curl -X POST \
  https://json2html.adobeaem.workers.dev/config/ak8458/att-demo/main \
  -H "Authorization: token <your-admin-token>" \
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

**Configuration Explanation**:
- **path**: `/support/supportcenter/` - Matches any URL starting with this path
- **endpoint**: Uses `{{id}}` placeholder which will be replaced with the content ID extracted by regex
- **regex**: `/[^/]+$/` - Extracts the last segment of the URL path (e.g., `000096620` from `/support/supportcenter/000096620`)
- **template**: Points to the Mustache template we created
- **headers**: Standard JSON request headers

**Alternative Configuration** (if content ID comes from query parameter):

If your URLs use query parameters like `?content!000096620`, you would need a different approach. However, JSON2HTML regex works on the path, so you may need to:
1. Use a path-based URL structure: `/support/supportcenter/000096620`
2. Or handle query parameter extraction differently (may require custom worker logic)

**For query parameter extraction**, you might need:
```json
{
  "path": "/support/supportcenter.html",
  "endpoint": "https://services.att.com/kmservices/v2/contents/{{query.content}}?app-id=gmarket",
  "template": "/templates/support-center.html"
}
```

**Note**: The JSON2HTML worker primarily works with path-based extraction. If you need query parameter support, you may need to adjust your URL structure or use a different extraction method.

### 4. Content Source Overlay Configuration

**In your content source configuration** (typically in your AEM Admin API or fstab.yaml), add:

```json
{
  "overlay": {
    "url": "https://json2html.adobeaem.workers.dev/ak8458/att-demo/main",
    "type": "markup"
  }
}
```

**Where to configure**:
- This is typically done through the AEM Admin API
- Or in your repository's content source configuration
- The overlay intercepts requests matching the configured `path` pattern and transforms them using the JSON2HTML worker

**How it works**:
1. User visits: `https://main--att-demo--ak8458.aem.page/support/supportcenter/000096620`
2. Edge Delivery Services checks if path matches `/support/supportcenter/`
3. If match, request is forwarded to JSON2HTML worker
4. Worker extracts `000096620` using regex
5. Worker fetches: `https://services.att.com/kmservices/v2/contents/000096620?app-id=gmarket`
6. Worker applies Mustache template to JSON response
7. Returns HTML to Edge Delivery Services
8. Edge Delivery Services processes HTML like any other page

## Implementation Status

✅ **Completed**:
1. ✅ **Created templates directory**: `templates/` directory exists
2. ✅ **Created Mustache template**: `templates/support-center.html` - Flexible template handling common JSON structures
3. ✅ **Documented the solution**: This file with complete implementation details
4. ✅ **Provided cURL command**: Ready-to-use command with org/site/branch values

⏳ **Pending** (requires your input):
1. ⏳ **AEM Admin Token**: Replace `<your-admin-token>` in cURL command
2. ⏳ **JSON Structure Verification**: Test with actual API response and adjust template if needed
3. ⏳ **Content Source Overlay**: Add overlay configuration to your content source
4. ⏳ **Testing**: Verify the transformation works with actual content IDs

## Template Features

The created Mustache template (`templates/support-center.html`) includes:

- **Flexible field mapping**: Handles `title`, `description`, `summary`, `content`, `body`, `htmlContent`
- **Conditional rendering**: Uses Mustache conditionals (`{{#field}}...{{/field}}`) to only render when data exists
- **HTML content support**: Uses triple mustache `{{{field}}}` for HTML content that shouldn't be escaped
- **Array handling**: Supports `sections`, `topics`, `relatedLinks`, `faqs`, `popularSupport` arrays
- **Metadata block**: Includes Edge Delivery Services metadata section for SEO
- **Nested structures**: Handles nested objects and arrays within the JSON

## Testing the Implementation

### Step 1: Configure JSON2HTML Worker

Run the cURL command (with your admin token):
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

### Step 2: Add Overlay to Content Source

Configure the overlay in your AEM Admin API or content source configuration.

### Step 3: Test the Transformation

Visit a URL like:
- `https://main--att-demo--ak8458.aem.page/support/supportcenter/000096620`

The page should:
1. Extract content ID `000096620` from the URL
2. Fetch JSON from AT&T API
3. Transform using the Mustache template
4. Display as HTML

### Step 4: Adjust Template if Needed

If the JSON structure differs from assumptions:
1. Fetch a sample JSON response: `curl "https://services.att.com/kmservices/v2/contents/000096620?app-id=gmarket"`
2. Compare with template field mappings
3. Update `templates/support-center.html` to match actual structure
4. Re-test the transformation

## Troubleshooting

### Issue: Template not rendering content

**Possible causes**:
- JSON field names don't match template variables
- JSON structure is nested differently than expected

**Solution**:
1. Check the actual JSON response structure
2. Update Mustache template variables to match JSON field names
3. Use dot notation for nested fields: `{{parent.child}}`

### Issue: Content ID not extracted correctly

**Possible causes**:
- Regex pattern doesn't match your URL structure
- Content ID format differs from expected

**Solution**:
1. Verify URL structure: `/support/supportcenter/000096620`
2. Test regex pattern: `/[^/]+$/` should match `000096620`
3. Adjust regex if needed (e.g., `/\d+$/` for numeric only)

### Issue: API request fails

**Possible causes**:
- Missing or incorrect headers
- CORS restrictions
- API authentication required

**Solution**:
1. Check if API requires additional headers
2. Add headers to configuration:
   ```json
   "headers": {
     "Accept": "application/json",
     "X-API-Key": "your-api-key"
   }
   ```
3. Use `forwardHeaders` to pass through authentication from request

### Issue: HTML not displaying correctly

**Possible causes**:
- HTML in JSON needs escaping
- Edge Delivery Services blocks not being recognized

**Solution**:
1. Use triple mustache `{{{field}}}` for HTML content (not escaped)
2. Use double mustache `{{field}}` for text content (escaped)
3. Ensure HTML follows Edge Delivery Services structure (section divs, blocks)

## Summary

This implementation provides:

✅ **Complete Mustache Template**: `templates/support-center.html`
- Flexible structure handling common JSON patterns
- Support for nested objects and arrays
- Edge Delivery Services metadata block
- Conditional rendering for optional fields

✅ **Configuration cURL Command**: Ready to use with your org/site/branch
- Organization: `ak8458`
- Site: `att-demo`
- Branch: `main`
- Path: `/support/supportcenter/`
- Endpoint: `https://services.att.com/kmservices/v2/contents/{{id}}?app-id=gmarket`

✅ **Documentation**: Complete implementation guide with:
- Understanding of JSON2HTML service
- Configuration parameters explained
- Testing steps
- Troubleshooting guide

## Next Actions Required

1. **Get AEM Admin Token**: Required for configuration API call
2. **Test JSON Structure**: Verify template matches actual API response
3. **Configure Overlay**: Add overlay to content source
4. **Test Transformation**: Visit a test URL and verify HTML output
5. **Adjust if Needed**: Fine-tune template based on actual JSON structure

## Files Created

- `templates/support-center.html` - Mustache template for JSON transformation
- `JSON2HTML_IMPLEMENTATION.md` - This documentation file

## References

- [JSON2HTML Documentation](https://www.aem.live/developer/json2html)
- [Mustache.js Documentation](https://github.com/janl/mustache.js)
- [Edge Delivery Services Documentation](https://www.aem.live/docs/)

## Assumptions and Default Implementation

Based on the repository structure and common patterns, I'll proceed with these assumptions:

### Assumed Configuration:
- **Organization**: `ak8458` (from GitHub username)
- **Site**: `att-demo` (from repository name)
- **Branch**: `main` (standard default)
- **Path Pattern**: `/support/supportcenter/` (matches support center pages)
- **Content ID Extraction**: From URL path using regex `/[^/]+$/` (last segment)

### Assumed JSON Structure (Common Support Center Pattern):

Based on typical knowledge management APIs, the JSON likely contains:
```json
{
  "id": "000096620",
  "title": "Page Title",
  "description": "Page description",
  "content": "HTML or text content",
  "body": "Main content body",
  "sections": [...],
  "relatedLinks": [...],
  "topics": [...],
  "metadata": {...}
}
```

**Note**: The actual structure may differ. The template below is flexible and can be adjusted.

## Implementation Plan

### Step 1: Create Template Directory and File

I will create:
- `templates/` directory in repository root
- `templates/support-center.html` - Mustache template

### Step 2: Create Flexible Mustache Template

The template will handle common JSON structures with conditional rendering.

### Step 3: Provide Configuration cURL Command

Ready-to-use command with placeholders for your admin token.

### Step 4: Document Overlay Configuration

Instructions for adding the overlay to your content source.

## Next Steps

**Before I implement**, please confirm or provide:

1. **JSON Structure**: 
   - Can you share a sample JSON response? OR
   - Confirm if you want me to create a flexible template that handles common patterns?

2. **AEM Admin Token**: 
   - Do you have your AEM Admin API token ready?
   - If not, I'll provide the command with `<your-admin-token>` placeholder

3. **URL Pattern Confirmation**:
   - Should paths like `/support/supportcenter/000096620` work?
   - Or do you prefer query parameter extraction?

4. **Content ID Format**:
   - Are content IDs always numeric (like `000096620`)?
   - Or can they be alphanumeric?

**If you want me to proceed with assumptions**, I can:
- ✅ Create a comprehensive, flexible Mustache template
- ✅ Provide the cURL command with your org/site/branch
- ✅ Document the complete solution
- ✅ You can then adjust the template based on actual JSON structure

Would you like me to proceed with the implementation based on assumptions, or wait for the JSON sample?
