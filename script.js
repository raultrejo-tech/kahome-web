/* ============================================================
   KAHOME Decoración — interacciones de la landing
   ============================================================ */

/* ---- CONFIGURACIÓN — edita aquí los datos reales ---- */
const CONFIG = {
  whatsapp: "5219993929306",
  mensajeDefault: "¡Hola Kahome! 👋 Me gustaría recibir más información sobre sus productos.",
};

const waUrl = (texto) =>
  `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(texto)}`;

/* ---- Links directos a WhatsApp (botón flotante, canal de contacto) ---- */
document.querySelectorAll("[data-wa-link]").forEach((el) => {
  el.href = waUrl(CONFIG.mensajeDefault);
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
      productDetailInner.replaceChildren(
        card.querySelector(".panel-body").cloneNode(true)
      );
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
desktopMq.addEventListener("change", closeProducts);
wideMq.addEventListener("change", closeProducts); // de 2 a 3 columnas cambian las filas

/* ---- "Cotizar este producto": pre-marca el checkbox en el formulario ----
   Delegado en document porque los botones del panel compartido son clones. */
const productChecks = document.getElementById("productChecks");

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-quote");
  if (!btn) return;
  if (productModal.open) productModal.close();
  const check = productChecks.querySelector(`input[value="${btn.dataset.quote}"]`);
  if (check) check.checked = true;
  productChecks.classList.remove("is-invalid");
  // directo al formulario (no al inicio de la sección) para que se vea el producto elegido
  document.getElementById("contactForm").scrollIntoView({ behavior: "smooth", block: "start" });
  setTimeout(() => document.getElementById("fNombre").focus({ preventScroll: true }), 600);
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

/* ---- Formulario → mensaje de WhatsApp ---- */
const form = document.getElementById("contactForm");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const nombre = form.nombre.value.trim();
  const telefono = form.telefono.value.trim();
  const productos = [...productChecks.querySelectorAll("input:checked")].map((c) => c.value);
  const mensaje = form.mensaje.value.trim();

  let valido = true;
  form.nombre.classList.toggle("is-invalid", !nombre);
  productChecks.classList.toggle("is-invalid", !productos.length);
  if (!nombre) { form.nombre.focus(); valido = false; }
  else if (!productos.length) { productChecks.querySelector("input").focus(); valido = false; }
  if (!valido) return;

  const lineas = [
    `¡Hola Kahome! 👋 Soy ${nombre}.`,
    `Me interesa: ${productos.join(", ")}.`,
    mensaje && `Detalles: ${mensaje}`,
    telefono && `Mi teléfono: ${telefono}`,
    "¿Me pueden dar más información y una cotización?",
  ].filter(Boolean);

  document.dispatchEvent(new Event("kahome:whatsapp-form"));
  window.open(waUrl(lineas.join("\n")), "_blank", "noopener");
});

form.querySelectorAll("input:not([type=checkbox])").forEach((el) =>
  el.addEventListener("input", () => el.classList.remove("is-invalid"))
);
productChecks.addEventListener("change", () => productChecks.classList.remove("is-invalid"));

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
