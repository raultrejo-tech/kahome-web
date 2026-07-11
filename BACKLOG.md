# Backlog — Landing Kahome

Mejoras acordadas tras el análisis de competencia (2026-07-11). No implementar hasta tener los insumos.

## Aprobado, en espera de insumos

- [ ] **Franja de cifras de confianza** bajo el hero (años en el mercado, proyectos instalados, marcas que se usan).
      ⏳ Raúl va a averiguar las cifras reales — no inventar números.
- [x] **Diferenciador clima de Yucatán**: reencuadrar el copy de cada producto por beneficio térmico/UV
      (blackout térmico, screen con protección UV, lambrín exterior resistente a sol/humedad, pasto que no se quema).
      ✅ Aplicado 2026-07-11 en los 6 productos + subtítulo de la sección.
- [ ] **Reseñas reales de Google con nombre** embebidas en la sección de casos de éxito.
      🔶 Parcial 2026-07-11: tarjetas estilo Google (avatar, nombre, estrellas, logo G) ya implementadas;
      la versión anterior quedó comentada en `index.html` para rollback. ⏳ Falta que Raúl pase el texto y
      nombre de las reseñas reales (no se pudieron extraer automáticamente de Google Maps) — buscar los
      marcadores `REEMPLAZAR` sobre `.testimonial-grid`.
- [ ] **Fotos reales de instalaciones**: Raúl reemplazará los placeholders (comentarios `REEMPLAZAR` en
      `index.html`) y avisa cuando estén. Ampliado 2026-07-11: pedir también pares **antes/después**
      de los mismos proyectos para la galería de casos de éxito.

## Después (requiere definir negocio primero)

- [ ] **Sección/badge de garantías** — primero definir la política de garantía real (qué cubre, cuánto tiempo).
- [ ] **Páginas individuales por producto para SEO** (`/cortinas-merida`, `/persianas-merida`, `/muro-pvc`,
      `/lambrin`, `/piso-pvc`, `/pasto-artificial`) — acordado 2026-07-11. Hacerlas **después** de tener
      fotos y reseñas reales: una página de producto sin foto real posiciona pero no convierte.

## Hecho (análisis de conversión 2026-07-11)

- [x] **Hero específico**: H1 orientado a producto + ciudad ("Cortinas, persianas y acabados a la medida
      en Mérida"); el eslogan pasó al subtítulo.
- [x] **Tabla comparativa** screen vs blackout vs sheer elegance al final de la sección de productos.
- [x] **Formulario multi-producto**: checkboxes tipo pill en vez de select único; "Cotizar X" pre-marca
      el checkbox. Nota de que se pueden adjuntar fotos ya dentro del chat de WhatsApp.
- [x] **Llamar ahora**: botón flotante `tel:` en móvil (arriba del de WhatsApp) + chip "Llamar" en contacto.

## Ideas exploradas, sin compromiso

- **Precios "Desde..." por producto** — propuesto en el análisis de conversión (2026-07-11); Raúl decidió
  no hacerlo por ahora. Retomar solo si define precios de arranque reales.
- Vender por **ambiente/paquete** ("Recámara total", "Terraza lista") en vez de producto suelto.
- **Experiencia de servicio como producto** (folio de trabajo, visita agendada, avance de fabricación —
  apoyado en FlowHub) como diferenciador difícil de copiar.
