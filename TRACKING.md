# Meta Pixel

`tracking.js` loads Meta on page entry with an informative notice (Mexican
notice-and-opt-out model); it stays off only if the visitor opts out. Configure the verified
Kahome web pixel ID in `PIXEL_ID`; an empty ID deliberately sends nothing.
An app ID is not a web pixel ID.

## Events

- `PageView`: once per page load, unless the visitor opted out.
- `WhatsAppClick`: custom event on outbound WhatsApp links and validated quote
  form submission. `source` is limited to `floating_button`, `website_link`, or
  `quote_form`. No name, phone, free-text message, or WhatsApp destination URL is
  included in event parameters.
- A click is not a confirmed message, qualified lead, purchase, or sale. The
  form opens WhatsApp; only the visitor can send the message there.
- Ads that open WhatsApp directly do not visit this website and will not fire
  this pixel. Measure those conversations in Ads Manager.

## Consent and privacy

The banner informs on entry ("Entendido" / "No usar publicidad") and links to
`aviso-de-privacidad.html`. With no saved choice the pixel loads immediately.
Choices expire after 180 days (the banner then shows again) and can be changed
from the footer. Opting out stops future events and expires first-party `_fbp`
and `_fbc` cookies; it does not erase past events or third-party cookies.
Automatic configuration is disabled before initialization and no advanced
matching data is supplied. Keep automatic matching and automatic events off
in Events Manager as well. Meta still receives technical browser/network data
and page URLs unless the visitor opts out. Never put personal information into page URLs.

The full privacy notice (LFPDPPP) is `aviso-de-privacidad.html`; keep its
section 6 in sync with this behavior.

## Verification

Run `node --test tests/tracking.test.cjs`.
In Meta Events Manager, select the confirmed web pixel, open Test Events,
visit the website and check PageView and WhatsAppClick.
Opting out must leave the site and quote flow usable without Meta events.
Use separate browser sessions for accept/reject tests, and test mobile too.

## Reference

Meta's official template documents the consent, autoConfig and per-pixel event
commands used here:
https://github.com/facebook/GoogleTagManager-WebTemplate-For-FacebookPixel/blob/main/template.tpl

## Origen del visitante → mensaje de WhatsApp (`origen.js`)

`origen.js` reads `utm_source`/`utm_medium`, else `gclid`/`gbraid`/`wbraid` (Google Ads) or
`fbclid` (Meta), else the referrer, and sets `window.KAHOME_ORIGEN`. The first source of the
visit is kept in `sessionStorage` (`kahome.origen.v1`, wrapped in try/catch). `script2.js`
starts both WhatsApp messages (floating button and quote form) with a natural phrase:
«Vi su anuncio en Google», «Los encontré en Google», «Los encontré en Google Maps»,
«Vi su anuncio en Facebook/Instagram», «Los vi en Instagram», «Los vi en redes»,
«Vi su folleto», «Recibí su correo», or «Vi su página» (direct). Nothing is sent to
Meta or Google; it only changes the text the visitor can edit before sending.
UTM naming convention: `kahome-oficina/marketing/2026-11-23-utm-y-seguimiento.md`.
Run `node --test tests/origen.test.cjs`.
