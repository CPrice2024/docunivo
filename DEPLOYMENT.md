# Deploy Docunivo

The Git repository root should be this folder: the one containing `package.json`,
`render.yaml`, and `src/`. Do not commit `node_modules/`, `dist/`, local environment
files, caches, or server logs.

## GitHub

Create an empty repository named `docunivo` without adding a README or license.
After the local initial commit, connect and push it:

```bash
git remote add origin https://github.com/YOUR_USERNAME/docunivo.git
git push -u origin main
```

## Render

Connect the GitHub repository to Render. Either create a Blueprint using the
included `render.yaml`, or create a Static Site with these settings:

| Setting | Value |
| --- | --- |
| Root directory | Leave blank when this folder is the repository root |
| Build command | `npm ci && npm run build` |
| Publish directory | `dist` |
| Environment variable | `NODE_VERSION=24` |

The build creates static HTML pages for every tool and information page. No
catch-all rewrite is required. The generated sitemap and canonical links use
`https://docunivo.online`, configured in `src/site-config.json`.

After deployment, add `docunivo.online` in the service's Custom Domains settings
and follow Render's displayed DNS instructions at the domain's DNS provider.
Verify the domain in Render after the records propagate. Render provisions HTTPS.
The repository configuration alone does not connect DNS or deploy the site.

See [Render static sites](https://render.com/docs/static-sites) and
[custom domains](https://render.com/docs/custom-domains).

## Before deployment

```bash
npm test
npm run build
```

The support email is currently unset. Set `contactEmail` in `src/site-config.json`
when a public support address is available. Social icons currently have no links.
Advertising remains disabled; see `ADSENSE-SETUP.md` before enabling it.
