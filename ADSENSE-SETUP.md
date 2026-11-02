# AdSense integration

The integration is prepared but disabled. No Google advertising script or ad request
is made with the default configuration. This does not guarantee AdSense approval.

## Configuration

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
CMP behavior. Add the public contact address. Obtain commercial rights for the
Pixel logo font before commercial launch; the supplied font is personal-use only.

Google references:
- https://support.google.com/adsense/answer/1346295
- https://support.google.com/adsense/answer/13554116
- https://support.google.com/adsense/answer/7532444
