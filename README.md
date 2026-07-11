# Kahome Decoración — Landing page

Landing page estática (HTML + CSS + JS, sin build) de [Kahome Decoración](https://www.facebook.com/KaHomeMX/), Mérida, Yucatán.

## Ver localmente

Abre `index.html` con doble clic, o sirve la carpeta:

```bash
npx serve .
```

## Antes de publicar — datos a reemplazar

| Qué | Dónde |
|---|---|
| **Número de WhatsApp** | `script.js` → `CONFIG.whatsapp` (formato `521` + 10 dígitos, ej. `5219991234567`) |
| **Dominio real** | Buscar y reemplazar `https://www.kahome.mx/` en `index.html` (canonical, OG, JSON-LD), `robots.txt` y `sitemap.xml` |
| **Dirección y horario** | `index.html` → sección `#ubicacion` (comentario `REEMPLAZAR`) |
| **Fotos reales** | Buscar los comentarios `<!-- REEMPLAZAR: ... -->` en `index.html` — hero, 6 productos y 3 proyectos usan placeholders SVG/CSS. Sustituir por `<img>` con `alt` descriptivo y `loading="lazy"` |
| **Testimonios** | `index.html` → sección `#proyectos` — reemplazar por reseñas reales de Google/Facebook |
| **Subproductos** | Propuesta inicial en las tarjetas de `#productos`; ajustar nombres/descripciones según el catálogo real |

## Publicar

Cualquiera de estas opciones sirve tal cual (carpeta estática):

- **Vercel**: `npx vercel` en esta carpeta (o importar el repo en vercel.com).
- **Netlify**: arrastrar la carpeta a [app.netlify.com/drop](https://app.netlify.com/drop).
- **GitHub Pages**: subir el repo y activar Pages en Settings.

Después conectar el dominio propio (ej. `kahome.mx`) desde el panel del hosting.

## Para que Google indexe la página

1. Publicar con el dominio final y actualizar las URLs (ver tabla de arriba).
2. Dar de alta el sitio en [Google Search Console](https://search.google.com/search-console) (verificación por DNS o archivo HTML).
3. Enviar `sitemap.xml` desde Search Console.
4. En la ficha de [Google Business Profile](https://business.google.com/) de Kahome, agregar la URL del sitio — refuerza el SEO local.

El HTML ya incluye: title y meta description optimizados para búsqueda local, meta keywords, Open Graph/Twitter Card, canonical, JSON-LD `HomeAndConstructionBusiness` (rich results con productos y redes) y contenido textual indexable.
