# Meta Pixel

`tracking.js` loads Meta only after marketing consent. Configure the verified
Kahome web pixel ID in `PIXEL_ID`; an empty ID deliberately sends nothing.
An app ID is not a web pixel ID.

## Events

- `PageView`: once per page load, after consent.
- `WhatsAppClick`: custom event on outbound WhatsApp links and validated quote
  form submission. `source` is limited to `floating_button`, `website_link`, or
  `quote_form`. No name, phone, free-text message, or WhatsApp destination URL is
  included in event parameters.
- A click is not a confirmed message, qualified lead, purchase, or sale. The
  form opens WhatsApp; only the visitor can send the message there.
- Ads that open WhatsApp directly do not visit this website and will not fire
  this pixel. Measure those conversations in Ads Manager.

## Consent and privacy

Accept/reject choices expire after 180 days and can be changed from the footer.
No Meta script or no-JavaScript tracking image loads before acceptance.
Revocation stops future events and expires first-party `_fbp` and `_fbc`
cookies; it does not erase past events or third-party cookies.
Automatic configuration is disabled before initialization and no advanced
matching data is supplied. Keep automatic matching and automatic events off
in Events Manager as well. Meta still receives technical browser/network data
and page URLs after consent. Never put personal information into page URLs.

The on-page measurement disclosure is not a complete business privacy policy.
The business should review its broader privacy notice separately.

## Verification

Run `node --test tests/tracking.test.cjs`.
In Meta Events Manager, select the confirmed web pixel, open Test Events,
visit the website, accept advertising, and check PageView and WhatsAppClick.
Rejecting must leave the site and quote flow usable without Meta events.
Use separate browser sessions for accept/reject tests, and test mobile too.

## Reference

Meta's official template documents the consent, autoConfig and per-pixel event
commands used here:
https://github.com/facebook/GoogleTagManager-WebTemplate-For-FacebookPixel/blob/main/template.tpl
