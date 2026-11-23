/* ============================================================
   KAHOME — de dónde llegó el visitante (para el mensaje de WhatsApp)
   Lee utm_source / utm_medium, o los identificadores que agregan
   Google (gclid) y Meta (fbclid), o el sitio de donde vino.
   Lo guarda durante la visita para no perderlo al navegar.
   Guía: kahome-oficina/marketing/2026-11-23-utm-y-seguimiento.md
   ============================================================ */
(function () {
  const KEY = "kahome.origen.v1";

  // frase natural con la que empieza el mensaje (después de «¡Hola Kahome!»)
  const FRASES = {
    google_anuncio: "Vi su anuncio en Google",
    google: "Los encontré en Google",
    maps: "Los encontré en Google Maps",
    fb_anuncio: "Vi su anuncio en Facebook",
    ig_anuncio: "Vi su anuncio en Instagram",
    meta_anuncio: "Vi su anuncio",
    instagram: "Los vi en Instagram",
    redes: "Los vi en redes",
    folleto: "Vi su folleto",
    correo: "Recibí su correo",
    pagina: "Vi su página",
  };

  function detectar(search, referrer) {
    let p;
    try { p = new URLSearchParams(search || ""); } catch (e) { p = new URLSearchParams(""); }
    const s = (p.get("utm_source") || "").toLowerCase();
    const m = (p.get("utm_medium") || "").toLowerCase();
    const deGoogle = p.has("gclid") || p.has("gbraid") || p.has("wbraid");
    const pagado = m === "paid" || m === "cpc" || m === "ppc";

    if (s) {
      if (s === "google") return pagado || deGoogle ? "google_anuncio" : "google";
      if (s === "gbp") return "maps";
      if (s === "folleto") return "folleto";
      if (s === "correo") return "correo";
      if (s === "fb" || s === "facebook") return pagado ? "fb_anuncio" : "redes";
      if (s === "ig" || s === "instagram") return pagado ? "ig_anuncio" : m === "bio" ? "instagram" : "redes";
      if (s === "msg" || s === "an" || s === "meta") return pagado ? "meta_anuncio" : "redes";
      return "pagina";
    }
    if (deGoogle) return "google_anuncio";
    if (p.has("fbclid")) return "redes";

    const r = (referrer || "").toLowerCase();
    if (/\/\/([a-z0-9-]+\.)*google\./.test(r)) return "google";
    if (/\/\/([a-z0-9-]+\.)*(facebook|instagram)\.com/.test(r)) return "redes";
    return "pagina";
  }

  // la primera fuente de la visita manda; si no hay guardada, se detecta ahora
  function origen() {
    let guardado = null;
    try { guardado = sessionStorage.getItem(KEY); } catch (e) { /* almacenamiento bloqueado */ }
    if (guardado && FRASES[guardado]) return guardado;
    const o = detectar(location.search, document.referrer);
    try { sessionStorage.setItem(KEY, o); } catch (e) { /* sin almacenamiento: se detecta en cada página */ }
    return o;
  }

  const clave = origen();
  window.KAHOME_ORIGEN = { clave, frase: FRASES[clave], detectar, FRASES };
})();
