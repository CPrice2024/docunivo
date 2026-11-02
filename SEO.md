# Docunivo search setup

## Search intent and page targets

These phrases describe the current tools; they are not search-volume or ranking
estimates. Keep content useful and accurate rather than repeating keywords.

| Page | Main phrase | Related phrases |
| --- | --- | --- |
| `/` | free online OCR tools | browser document tools, image converters |
| `/image-to-text/` | image to text converter | JPG to text, PNG to text, copy text from image, Hindi OCR |
| `/image-to-excel/` | image to Excel converter | JPG to Excel, PNG table to Excel, image table to CSV |
| `/receipt-to-csv/` | receipt to CSV | receipt OCR, receipt data extraction, receipt to Excel |
| `/pdf-ocr/` | PDF OCR online | extract text from scanned PDF, scanned PDF to text |
| `/background-remover/` | free background remover | remove image background, transparent PNG cutout |

## Google Search Console: account setup required

1. Sign in to [Google Search Console](https://search.google.com/search-console/).
2. Add a **Domain** property for `docunivo.online`.
3. Copy Google's verification TXT value. In Cloudflare DNS, add a TXT record
   with Name `@` and the exact provided value, then verify in Search Console.
   Keep the TXT record after verification. Never invent the verification value.
4. Submit `https://docunivo.online/sitemap.xml` in **Sitemaps**.
5. Inspect the homepage and each tool URL using **URL inspection**. Check the live
   URL, rendered content, canonical URL, and indexing eligibility. Request indexing
   for the homepage and tool pages after deployment.
6. Monitor **Page indexing**, **Performance**, and **Core Web Vitals**. Review
   impressions, clicks, search queries, and pages before choosing new content.

These steps request discovery and indexing, not a particular position or a
guaranteed listing. DNS verification requires the user's Google account and
Cloudflare access; it is not performed by the build.

## What the repository implements

- Unique English titles and descriptions shared by the browser and HTML build.
- Readable HTML content, navigation and guides before JavaScript runs, generated
  from the same React components and content used by the interactive site.
- One canonical URL per page, an XML sitemap and a public robots.txt.
- Organization, WebSite, WebPage and breadcrumb structured data. No invented
  reviews, ratings, addresses, social profiles or rich-result promises.
- PNG/SVG favicons, touch and app icons, and a 1200x630 social preview.
- Open Graph and X card metadata. Social profile icons remain unlinked.
- System typography; the personal-use-only demo font is no longer loaded.

Language selection is a browser preference on the same URLs. There are no
separate translated landing pages yet, so no hreflang URLs are declared.
Do not add keyword meta tags: Google does not use them for ranking.
Do not add a SearchAction until there is a working site search.

## Follow-up work based on actual search data

Publish useful original examples of OCR input and reviewed output, explain common
conversion mistakes, and improve tool speed and accuracy. Earn relevant links
through useful tools and documentation rather than buying links or mass-posting.
Review mobile usability and loading performance on the deployed site. Configure
a public support email when available; the project does not invent one.

Google Business Profile is separate from web search indexing; do not invent a
local office or business address for an online-only toolkit.

## Validation

`npm test` checks tool behavior. `npm run build` type-checks, builds the browser
app and static renderer, then validates every generated page's metadata,
canonical link, heading, structured data, sitemap and required brand assets.
The Windows-only `scripts/generate-brand-assets.ps1` optionally regenerates the
committed PNGs; it is not needed by Render's Linux build.

References: [Google SEO starter guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide),
[supported meta tags](https://developers.google.com/search/docs/crawling-indexing/special-tags),
[site names](https://developers.google.com/search/docs/appearance/site-names),
[favicons](https://developers.google.com/search/docs/appearance/favicon-in-search),
[ownership verification](https://support.google.com/webmasters/answer/9008080).
