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

const closeProducts = () => {
  cards.forEach((c) => {
    c.classList.remove("is-open", "is-active");
    c.querySelector(".product-head").setAttribute("aria-expanded", "false");
  });
  productDetail.classList.remove("is-open");
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
      productDetail.classList.add("is-open");
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

/* ---- "Cotizar este producto": pre-selecciona en el formulario ----
   Delegado en document porque los botones del panel compartido son clones. */
const selectProducto = document.getElementById("fProducto");

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-quote");
  if (!btn) return;
  selectProducto.value = btn.dataset.quote;
  selectProducto.classList.remove("is-invalid");
  document.getElementById("contacto").scrollIntoView({ behavior: "smooth" });
  setTimeout(() => document.getElementById("fNombre").focus({ preventScroll: true }), 600);
});

/* ---- Formulario → mensaje de WhatsApp ---- */
const form = document.getElementById("contactForm");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const nombre = form.nombre.value.trim();
  const telefono = form.telefono.value.trim();
  const producto = form.producto.value;
  const mensaje = form.mensaje.value.trim();

  let valido = true;
  form.nombre.classList.toggle("is-invalid", !nombre);
  form.producto.classList.toggle("is-invalid", !producto);
  if (!nombre) { form.nombre.focus(); valido = false; }
  else if (!producto) { form.producto.focus(); valido = false; }
  if (!valido) return;

  const lineas = [
    `¡Hola Kahome! 👋 Soy ${nombre}.`,
    `Me interesa: ${producto}.`,
    mensaje && `Detalles: ${mensaje}`,
    telefono && `Mi teléfono: ${telefono}`,
    "¿Me pueden dar más información y una cotización?",
  ].filter(Boolean);

  window.open(waUrl(lineas.join("\n")), "_blank", "noopener");
});

form.querySelectorAll("input, select").forEach((el) =>
  el.addEventListener("input", () => el.classList.remove("is-invalid"))
);

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

/* ---- Año del footer ---- */
document.getElementById("year").textContent = new Date().getFullYear();
