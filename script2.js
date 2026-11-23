/* ============================================================
   KAHOME Decoración — interacciones de la landing (versión 2: soluciones + cotizador por pasos)
   ============================================================ */

/* ---- CONFIGURACIÓN — edita aquí los datos reales ---- */
// frase según de dónde llegó el visitante (origen.js); si no cargó, «Vi su página»
const FRASE_ORIGEN = (window.KAHOME_ORIGEN && window.KAHOME_ORIGEN.frase) || "Vi su página";

const CONFIG = {
  whatsapp: "5219993929306",
  mensajeDefault: `¡Hola Kahome! ${FRASE_ORIGEN} y me gustaría recibir más información sobre sus productos.`,
};

const waUrl = (texto) =>
  `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(texto)}`;

/* ---- Links directos a WhatsApp (botón flotante, canal de contacto) ---- */
// en el navegador de Facebook/Instagram se abre en la misma pestaña (ver abrirWhatsApp)
const enAppDeMeta = /FBAN|FBAV|FB_IAB|Instagram/i.test(navigator.userAgent);
document.querySelectorAll("[data-wa-link]").forEach((el) => {
  el.href = waUrl(CONFIG.mensajeDefault);
  if (enAppDeMeta) return;
  el.target = "_blank";
  el.rel = "noopener";
});

/* ---- Header: transparente sobre el hero, sólido al hacer scroll ---- */
const header = document.getElementById("header");
const onScroll = () => header.classList.toggle("is-solid", window.scrollY > 24);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

/* ---- Menú móvil ---- */
const navToggle = document.getElementById("navToggle");
const nav = document.getElementById("nav");

const closeNav = () => {
  nav.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
};

navToggle.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(open));
});
nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeNav));

/* ---- Productos ----
   Móvil: acordeón dentro de cada tarjeta.
   Pantalla grande: las tarjetas no cambian de tamaño; los subproductos
   se muestran en un panel compartido debajo del grid. */
const cards = document.querySelectorAll(".product-card");
const productDetail = document.getElementById("productDetail");
const productDetailInner = productDetail.querySelector(".product-detail-inner");
const desktopMq = window.matchMedia("(min-width: 640px)");
const wideMq = window.matchMedia("(min-width: 960px)");
const productGrid = document.getElementById("productGrid");

// coloca el panel justo debajo de la fila de la tarjeta elegida y apunta la pestaña hacia ella
const placeDetail = (card) => {
  const row = [...cards].filter((c) => c.offsetTop === card.offsetTop);
  row[row.length - 1].after(productDetail);
  const gridBox = productGrid.getBoundingClientRect();
  const cardBox = card.getBoundingClientRect();
  productDetail.style.setProperty("--notch-x", `${cardBox.left - gridBox.left + cardBox.width / 2}px`);
};

const closeProducts = () => {
  cards.forEach((c) => {
    c.classList.remove("is-open", "is-active");
    c.querySelector(".product-head").setAttribute("aria-expanded", "false");
  });
  productDetail.classList.remove("is-open");
  if (productDetail.parentElement === productGrid) productGrid.after(productDetail); // regresa a su lugar original
};

cards.forEach((card) => {
  const head = card.querySelector(".product-head");
  head.addEventListener("click", () => {
    const wasOpen = card.classList.contains(desktopMq.matches ? "is-active" : "is-open");
    closeProducts();
    if (wasOpen) return;
    head.setAttribute("aria-expanded", "true");
    if (desktopMq.matches) {
      card.classList.add("is-active");
      const body = card.querySelector(".panel-body").cloneNode(true);
      // botón para cerrar el panel; regresa el foco a la tarjeta que lo abrió
      const closeBtn = document.createElement("button");
      closeBtn.type = "button";
      closeBtn.className = "product-detail-close";
      closeBtn.setAttribute("aria-label", `Cerrar opciones de ${card.dataset.product}`);
      closeBtn.innerHTML = "&times;";
      closeBtn.addEventListener("click", () => {
        closeProducts();
        head.focus({ preventScroll: true });
      });
      body.prepend(closeBtn);
      productDetailInner.replaceChildren(body);
      placeDetail(card);
      requestAnimationFrame(() => productDetail.classList.add("is-open"));
      // al terminar de abrir, si quedó cortado abajo, baja lo justo para verlo
      setTimeout(() => productDetail.scrollIntoView({ behavior: "smooth", block: "nearest" }), 380);
    } else {
      card.classList.add("is-open");
      requestAnimationFrame(() =>
        card.scrollIntoView({ behavior: "smooth", block: "nearest" })
      );
    }
  });
});

// al cruzar el breakpoint, resetear estados para no mezclar ambos modos
// Esc también cierra el panel (si no hay una ventana de foto abierta)
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape" || !productDetail.classList.contains("is-open")) return;
  if (document.querySelector("dialog[open]")) return;
  const active = document.querySelector(".product-card.is-active .product-head");
  closeProducts();
  active?.focus({ preventScroll: true });
});

desktopMq.addEventListener("change", closeProducts);
wideMq.addEventListener("change", closeProducts); // de 2 a 3 columnas cambian las filas

/* ---- "Cotizar": desde las soluciones o desde un producto ----
   Delegado en document porque los botones del panel compartido son clones. */
const PROBLEMAS = {
  sol: { nombre: "Sol y calor de la tarde", medida: "ventanas" },
  oscuro: { nombre: "Dormir en oscuridad total", medida: "ventanas" },
  privacidad: { nombre: "Privacidad sin perder luz", medida: "ventanas" },
  piso: { nombre: "Piso nuevo o con humedad", medida: "piso" },
  muro: { nombre: "Renovar un muro", medida: "muro" },
  otro: { nombre: "Otro acabado", medida: "otro" },
};
// cortinas y persianas pueden resolver varios problemas: ahí el cliente elige en el paso 1
const PRODUCTO_A_PROBLEMA = {
  "Papel tapiz": "muro",
};
let productoInteres = "";

document.addEventListener("click", (e) => {
  const sol = e.target.closest(".sol-quote");
  const prod = e.target.closest(".btn-quote");
  if (!sol && !prod) return;
  if (prod && productModal.open) productModal.close();
  productoInteres = prod ? prod.dataset.quote : "";
  const problema = sol ? sol.dataset.problem : PRODUCTO_A_PROBLEMA[productoInteres];
  const check = problema && form.querySelector(`input[name="problema"][value="${problema}"]`);
  if (check) check.checked = true;
  // desde «Cotizar cortinas/persianas» ya sabemos qué prefiere para sus ventanas
  const prefiere = { "Cortinas tradicionales": "Cortina", "Persianas enrollables": "Persiana" }[productoInteres];
  if (prefiere) form.querySelector(`input[name="prefiere"][value="${prefiere}"]`).checked = true;
  // con el problema ya elegido se salta al paso 2; el cliente puede regresar
  showStep(check ? 1 : 0, false);
  form.scrollIntoView({ behavior: "smooth", block: "start" });
});

/* ---- Ventana de detalle: clic en la foto de un producto ----
   Muestra la foto grande con la descripción, las opciones y el botón de cotizar.
   El clic en el resto de la tarjeta sigue abriendo las opciones como antes. */
const productModal = document.createElement("dialog");
productModal.className = "product-modal";
productModal.setAttribute("aria-labelledby", "productModalTitle");
productModal.innerHTML = `
  <button type="button" class="product-modal-close" aria-label="Cerrar">&times;</button>
  <div class="product-modal-media"></div>
  <div class="product-modal-body">
    <h3 id="productModalTitle"></h3>
    <p class="product-modal-desc"></p>
    <div class="product-modal-detail"></div>
  </div>`;
document.body.appendChild(productModal);

const openProductModal = (card) => {
  const img = card.querySelector(".product-visual img");
  if (!img) return;
  const big = img.cloneNode();
  big.loading = "eager";
  productModal.querySelector(".product-modal-media").replaceChildren(big);
  productModal.querySelector("h3").textContent = card.querySelector(".product-title h3").textContent;
  productModal.querySelector(".product-modal-desc").textContent = card.querySelector(".product-title p").textContent;
  const detail = card.querySelector(".panel-body").cloneNode(true);
  detail.querySelectorAll(".btn-photo").forEach((b) => b.remove());
  productModal.querySelector(".product-modal-detail").replaceChildren(detail);
  document.documentElement.classList.add("has-modal");
  productModal.showModal();
};

productModal.addEventListener("close", () => document.documentElement.classList.remove("has-modal"));
productModal.querySelector(".product-modal-close").addEventListener("click", () => productModal.close());
// clic fuera de la ventana (en el fondo oscuro) la cierra
productModal.addEventListener("click", (e) => {
  if (e.target === productModal) productModal.close();
});

cards.forEach((card) => {
  const img = card.querySelector(".product-visual img");
  if (!img) return;
  card.classList.add("has-photo");
  img.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    openProductModal(card);
  });
  // para teclado y lectores de pantalla: botón "Ver foto" dentro de las opciones
  const photoBtn = document.createElement("button");
  photoBtn.type = "button";
  photoBtn.className = "btn btn-ghost btn-photo";
  photoBtn.dataset.photo = card.dataset.product;
  photoBtn.textContent = "Ver foto";
  const quote = card.querySelector(".panel-body .btn-quote");
  quote.before(photoBtn);
});

// delegado: los botones del panel compartido (pantalla grande) son clones
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-photo");
  if (!btn) return;
  const card = document.querySelector(`.product-card[data-product="${btn.dataset.photo}"]`);
  if (card) openProductModal(card);
});

const form = document.getElementById("contactForm");

/* ---- Cotizador por pasos → mensaje de WhatsApp ----
   Sin JS se ven los 4 pasos juntos; con JS se muestra uno a la vez. */
const steps = [...form.querySelectorAll(".q-step")];
const qBack = document.getElementById("qBack");
const qNext = document.getElementById("qNext");
const qSend = document.getElementById("qSend");
const qVentanas = document.getElementById("qVentanas");
const qSinMedidas = document.getElementById("qSinMedidas");
let step = 0;

form.classList.add("is-stepped");
document.getElementById("qAddWin").hidden = false;

const problemasElegidos = () =>
  [...form.querySelectorAll('input[name="problema"]:checked')].map((i) => i.value);
const tiposMedida = () => [...new Set(problemasElegidos().map((p) => PROBLEMAS[p].medida))];
const valorRadio = (name) => form.querySelector(`input[name="${name}"]:checked`)?.value || "";
const valores = (name) => [...form.querySelectorAll(`input[name="${name}"]:checked`)].map((i) => i.value);

// «180» se entiende como centímetros y «1.80» como metros; si ya escribió la unidad, se respeta
const conUnidad = (v) => {
  if (!v) return "?";
  if (/[a-z]/i.test(v)) return v;
  const n = parseFloat(v.replace(",", "."));
  if (Number.isNaN(n)) return v;
  return `${v} ${n > 10 ? "cm" : "m"}`;
};

function updateMedidas() {
  const sin = qSinMedidas.checked;
  const tipos = tiposMedida();
  form.querySelectorAll("[data-medida]").forEach((b) => {
    b.hidden = sin || !tipos.includes(b.dataset.medida);
  });
  document.getElementById("qMedidasVacio").hidden = sin || tipos.length > 0;
  // la pregunta cortina/persiana solo aplica si eligió algo de ventanas
  document.getElementById("qPrefiereWrap").hidden = !tipos.includes("ventanas");
}

function renumerarVentanas() {
  const filas = [...qVentanas.querySelectorAll(".q-win")];
  filas.forEach((fila, i) => {
    fila.querySelector(".q-win-n").textContent = i + 1;
    fila.querySelector(".q-ancho").setAttribute("aria-label", `Ancho de la ventana ${i + 1}`);
    fila.querySelector(".q-alto").setAttribute("aria-label", `Alto de la ventana ${i + 1}`);
    const del = fila.querySelector(".q-del");
    del.setAttribute("aria-label", `Quitar ventana ${i + 1}`);
    del.hidden = filas.length < 2;
  });
}

document.getElementById("qAddWin").addEventListener("click", () => {
  const nueva = qVentanas.querySelector(".q-win").cloneNode(true);
  nueva.querySelectorAll("input").forEach((i) => (i.value = ""));
  qVentanas.appendChild(nueva);
  renumerarVentanas();
  nueva.querySelector(".q-ancho").focus();
  updatePreview();
});
qVentanas.addEventListener("click", (e) => {
  const del = e.target.closest(".q-del");
  if (!del) return;
  del.closest(".q-win").remove();
  renumerarVentanas();
  updatePreview();
});

function buildMessage() {
  const L = [`¡Hola Kahome! ${FRASE_ORIGEN} y quiero una cotización:`, ""];
  if (productoInteres) L.push(`• Me interesa: ${productoInteres}`);
  L.push(`• Quiero resolver: ${problemasElegidos().map((p) => PROBLEMAS[p].nombre).join(", ") || "—"}`);
  const espacios = valores("espacio");
  if (espacios.length) L.push(`• Espacio: ${espacios.join(", ")}`);
  const prefiere = valorRadio("prefiere");
  if (prefiere && tiposMedida().includes("ventanas")) L.push(`• Prefiere: ${prefiere.toLowerCase()}`);

  if (qSinMedidas.checked) {
    L.push("• Medidas: no las tengo, quiero visita para medir");
  } else {
    const tipos = tiposMedida();
    if (tipos.includes("ventanas")) {
      const ventanas = [...qVentanas.querySelectorAll(".q-win")]
        .map((f) => [f.querySelector(".q-ancho").value.trim(), f.querySelector(".q-alto").value.trim()])
        .filter(([a, h]) => a || h);
      if (ventanas.length) {
        L.push(`• Ventanas (${ventanas.length}):`);
        ventanas.forEach(([a, h], i) => L.push(`   ${i + 1}) ${conUnidad(a)} × ${conUnidad(h)}`));
      }
    }
    const piso = document.getElementById("qPiso").value.trim();
    const muro = document.getElementById("qMuro").value.trim();
    const otro = document.getElementById("qOtro").value.trim();
    if (tipos.includes("piso") && piso) L.push(`• Piso: ${piso} m² aprox.`);
    if (tipos.includes("muro") && muro) L.push(`• Muro: ${muro}`);
    if (tipos.includes("otro") && otro) L.push(`• Detalles: ${otro}`);
  }

  const colonia = document.getElementById("qColonia").value.trim();
  const visita = valorRadio("visita");
  if (colonia) L.push(`• Colonia: ${colonia}`);
  if (visita) L.push(`• Visita: ${visita.toLowerCase()}`);
  if (document.getElementById("qFotos").checked) L.push("• Fotos: se las mando en este chat");
  L.push("", `Soy ${form.nombre.value.trim() || "…"}.`);
  return L.join("\n");
}

const updatePreview = () => {
  document.getElementById("qPreview").textContent = buildMessage();
};

function validar(i) {
  if (i === 0) {
    const ok = problemasElegidos().length > 0;
    document.getElementById("qErrProblema").hidden = ok;
    return ok;
  }
  if (i === steps.length - 1) {
    const ok = form.nombre.value.trim() !== "";
    document.getElementById("qErrNombre").hidden = ok;
    form.nombre.classList.toggle("is-invalid", !ok);
    if (!ok) form.nombre.focus();
    return ok;
  }
  return true;
}

function showStep(i, focus = true) {
  step = i;
  steps.forEach((s, n) => (s.hidden = n !== i));
  document.getElementById("qStepLabel").textContent = `Paso ${i + 1} de ${steps.length}`;
  document.getElementById("qStepName").textContent = steps[i].dataset.name;
  document.getElementById("qBar").style.width = `${((i + 1) / steps.length) * 100}%`;
  qBack.hidden = i === 0;
  qNext.hidden = i === steps.length - 1;
  qSend.hidden = i !== steps.length - 1;
  updateMedidas();
  updatePreview();
  document.dispatchEvent(new CustomEvent("kahome:cotizador-paso", { detail: { paso: i + 1 } }));
  if (!focus) return;
  steps[i].querySelector(".q-title").focus({ preventScroll: true });
  if (form.getBoundingClientRect().top < 0) form.scrollIntoView({ behavior: "smooth", block: "start" });
}

qNext.addEventListener("click", () => {
  if (validar(step)) showStep(step + 1);
});
qBack.addEventListener("click", () => showStep(step - 1));

form.addEventListener("change", (e) => {
  if (e.target.name === "problema") document.getElementById("qErrProblema").hidden = true;
  updateMedidas();
  updatePreview();
});
form.addEventListener("input", (e) => {
  if (e.target === form.nombre) {
    form.nombre.classList.remove("is-invalid");
    document.getElementById("qErrNombre").hidden = true;
  }
  updatePreview();
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  // Enter dentro de un campo avanza de paso en vez de enviar
  if (step < steps.length - 1) {
    if (validar(step)) showStep(step + 1);
    return;
  }
  if (!validar(0)) { showStep(0); return; }
  if (!validar(step)) return;
  document.dispatchEvent(new Event("kahome:whatsapp-form"));
  abrirWhatsApp(waUrl(buildMessage()));
});

// En el navegador interno de Facebook e Instagram (de ahí llega el tráfico de los anuncios)
// las ventanas nuevas pueden no abrir: ahí se navega en la misma pestaña.
function abrirWhatsApp(url) {
  if (enAppDeMeta) {
    location.href = url;
    return;
  }
  const w = window.open(url, "_blank");
  if (w) w.opener = null;
  else location.href = url;
}

showStep(0, false);

/* ---- Reveal on scroll ---- */
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
);
document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

/* ---- Menú: marca la sección que se está viendo ---- */
const spyLinks = [...nav.querySelectorAll('a[href^="#"]:not(.nav-cta)')];
const spyItems = spyLinks
  .map((link) => ({ link, section: document.querySelector(link.getAttribute("href")) }))
  .filter((item) => item.section);

const markCurrent = () => {
  const line = header.offsetHeight + window.innerHeight * 0.3;
  const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
  let current = null;
  spyItems.forEach((item) => {
    if (item.section.getBoundingClientRect().top <= line) current = item;
  });
  if (atBottom && spyItems.length) current = spyItems[spyItems.length - 1];
  spyItems.forEach(({ link }) => {
    const on = current !== null && link === current.link;
    link.classList.toggle("is-current", on);
    if (on) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
};

let spyTicking = false;
window.addEventListener("scroll", () => {
  if (spyTicking) return;
  spyTicking = true;
  requestAnimationFrame(() => { markCurrent(); spyTicking = false; });
}, { passive: true });
window.addEventListener("resize", markCurrent);
markCurrent();

/* ---- Año del footer ---- */
document.getElementById("year").textContent = new Date().getFullYear();
