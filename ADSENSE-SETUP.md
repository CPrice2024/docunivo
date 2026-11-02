# AdSense integration

The integration is prepared but disabled. No Google advertising script or ad request
is made with the default configuration. This does not guarantee AdSense approval.

## Configuration

### Connect your account and request review

1. Sign in at https://adsense.google.com/ and add `docunivo.online` as a site.
2. Complete the account details Google requests in the AdSense dashboard.
3. Select the **Meta tag** site-verification method. Copy your account's
   `ca-pub-` identifier (16 digits) into `ads.publisherId` in `src/site-config.json`.
4. Build and deploy. The build adds `google-adsense-account` to every public
   page's head and writes your matching seller record at `/ads.txt`. This step
   does not load an ad script. Check that the seller record matches Google's.
5. In AdSense, verify the connection and click **Request review**.
6. Choose and configure the consent management option in Google's dashboard.
7. After approval, create responsive display units and configure their IDs below.

Keep `ads.enabled: false` during verification and review. Keep `ads.preview: false`
on the public site so visitors do not see empty demonstration placements.
No publisher ID, slot ID, consent script or approval status should be invented.

Edit `src/site-config.json`:

- Set `domain` to your HTTPS website origin, without a path.
- Set `contactEmail` to your public support address before publishing.
- Use `ads.preview: true` temporarily to inspect the two labeled placements.
  Preview mode does not load Google. Set it back to false before publishing.
- After AdSense approval, enter your `ca-pub-` publisher ID and the two display
  ad unit IDs in `slots.content` and `slots.footer`.
- Set `ads.enabled: true` only when the consent integration is ready.

Each tool page places advertisements after its usage guide and after the FAQ,
away from uploads, editing tools, navigation and downloads. Slots reserve vertical
space, load near the viewport, and use responsive display units. Keep Auto ads
disabled initially so Google does not add placements inside the workspace.
The same two slot IDs are intentionally shared across pages.

## Consent integration

Use Google's Privacy & messaging feature or another Google-certified CMP where
required. Install the CMP's actual script and follow its documented API. This
repository does not include a CMP or claim that a generic cookie banner suffices.

The CMP adapter must set `window.doculensAdsAllowed = true` and dispatch
`window.dispatchEvent(new Event('doculens:ads-consent'))` only after its regional
rules permit Google ad requests. Until then, no ad script is loaded. For withdrawal,
set the flag to false, dispatch the event, and follow your CMP's instructions for
reloading the page and handling already-loaded vendors. Hiding a slot alone does
not unload Google's script or revoke stored consent. Provide the CMP's privacy
choices entry point so visitors can reopen its controls.

Do not set the flag unconditionally or implement an improvised substitute for CMP
consent signals. Validate the CMP and ad requests on your real domain before launch.

## Build and launch

Run `npm run build`. The build generates the nine dedicated pages plus the home
page. With a configured domain, it adds canonical links and a sitemap; robots.txt
is always generated. With a valid publisher ID, it generates ads.txt. Verify that
your account's supplied ads.txt line matches this file. Publish the complete dist
directory at your domain root, then verify direct links, mobile layouts, consent,
ads.txt and AdSense site verification.

Review Privacy and Terms text against your actual hosting, operator details and
CMP behavior. Add the public contact address. The live brand now uses system
fonts; the personal-use-only demo font is no longer loaded by the site.

Google references:
- https://support.google.com/adsense/answer/1346295
- https://support.google.com/adsense/answer/13554116
- https://support.google.com/adsense/answer/7532444
