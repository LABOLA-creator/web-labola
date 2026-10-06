# LABOLA Styles Guide

Guia de estilos ligera para `web-labola` (Next.js + Tailwind v4), basada en:
- Estado real del repo (`app/globals.css`, `app/page.tsx`, `components/sections/*`).
- Estetica objetivo de la landing compartida (dark + acentos amarillo/morado).

## 1) Brand / Identidad

### Look & feel
- Base visual oscura de alto contraste.
- Acento principal amarillo electrico para CTAs, titulares destacados y metricas.
- Acento secundario morado para bordes finos, estados y gradientes.
- Superficies limpias, mucho aire entre bloques, jerarquia tipografica fuerte.

### Principios de diseno
- Jerarquia clara: titular fuerte, subtitulo corto, CTA visible.
- Espaciado amplio por secciones (evitar bloques "apretados").
- Motion sutil y funcional (no decorativo excesivo).
- Accesibilidad primero: foco visible, contraste y objetivos tactiles correctos.

## 2) Tokens

## 2.1 Colores

### Tokens reales actuales (fuente: `app/globals.css`)
- `--background: #ffffff`
- `--foreground: #171717`
- Dark mode:
  - `--background: #0a0a0a`
  - `--foreground: #ededed`
- Tailwind tokens inline:
  - `--color-background: var(--background)`
  - `--color-foreground: var(--foreground)`

### Tokens de marca (PROPOSED)
No existen todavia en codigo. Propuesta para alinear con la landing:

```css
/* PROPOSED */
:root {
  --color-surface-base: #0a0a0a;
  --color-surface-elevated: #111111;
  --color-text-primary: #f5f5f5;
  --color-text-secondary: #b6b6b6;
  --color-accent-yellow: #DDD000;
  --color-accent-purple: #b96dff;
  --color-border-subtle: #2a2a2a;
  --color-border-accent: #b96dff;
}
```

Uso recomendado:
- `surface-base`: fondo global.
- `surface-elevated`: cards/secciones destacadas.
- `text-primary`: texto principal.
- `text-secondary`: parrafos secundarios.
- `accent-yellow`: CTA principal, numeros KPI, highlight de titulares.
- `accent-purple`: borde/acento secundario, tabs, separadores.

## 2.2 Tipografia

### Estado actual
- En `app/layout.tsx` se cargan `Geist` y `Geist_Mono`.
- En `app/globals.css` el `body` esta en `Arial, Helvetica, sans-serif`.

### Convencion tipografica objetivo
- Titulos (`H1`, `H2`, `H3`, `H4`, titulares de seccion): `EXO`
- Parrafos (cuerpo, descripciones, texto largo): `Montserrat`
- Subtitulos (eyebrow, labels secundarios) y enlaces de footer: `Inter`
- Botones (CTA primary, secondary, nav button): `PT Sans Caption`

### Mapa de uso rapido
- `EXO`: hero headline, titulos de bloques, manifiesto, titulares de cards.
- `Montserrat`: introText, subheadline, textos de acordeon, copy de contacto.
- `Inter`: eyebrow (`SOMOS LABOLA`), labels de formulario, links del footer/legal.
- `PT Sans Caption`: texto de botones (`VER COMO TRABAJAMOS`, `EMPEZAR CONVERSACION`).

### Implementacion recomendada (PROPOSED)
- Definir variables CSS de fuente y mapearlas a utilidades semanticas.
- Evitar usar `font-sans` generico para todo el sitio.

```css
/* PROPOSED */
:root {
  --font-heading: 'EXO', sans-serif;
  --font-body: 'Montserrat', sans-serif;
  --font-subtitle: 'Inter', sans-serif;
  --font-button: 'PT Sans Caption', sans-serif;
}
```

```css
/* PROPOSED */
.font-heading { font-family: var(--font-heading); }
.font-body { font-family: var(--font-body); }
.font-subtitle { font-family: var(--font-subtitle); }
.font-button { font-family: var(--font-button); }
```

Escala recomendada (Tailwind):
- `text-xs`: microcopy, legal.
- `text-sm`: labels, helper text.
- `text-base`: cuerpo principal.
- `text-lg` / `text-xl`: subtitulares.
- `text-3xl` / `text-4xl` / `text-5xl`: hero y titulares de seccion.

Pesos y tracking:
- Titulares: `font-semibold` o `font-bold`.
- Cuerpo: `font-normal`.
- Labels/CTA: `uppercase tracking-wide`.

## 2.3 Spacing scale

Base Tailwind (actual):
- Se usa `px-4 md:px-8` en `app/page.tsx`.
- Se usa `max-w-6xl`.

Reglas recomendadas:
- Padding lateral global: `px-4 md:px-8 lg:px-12`.
- Gap vertical entre secciones: `py-16 md:py-24`.
- Gaps internos:
  - bloques de texto: `space-y-4` / `space-y-6`
  - grids/cards: `gap-6 md:gap-8`

## 2.4 Radius, borders, shadows

Estado actual:
- Nav button usa `rounded-full border`.
- Header/footer usan `border-b` y `border-t`.

Recomendado:
- Botones pill: `rounded-full`.
- Inputs/cards: `rounded-xl` o `rounded-2xl`.
- Border base: `border border-[var(--color-border-subtle)]` (PROPOSED).
- Card destacada ("Why"): `border` con acento suave.
- Sombras: minimas (`shadow-sm`) o nulas para mantener look editorial oscuro.

## 2.5 Z-index layers

No hay escala explicita hoy. Propuesta:
- `z-10`: header normal
- `z-20`: header sticky/fixed
- `z-30`: overlays de seccion (hero overlay)
- `z-40`: dropdowns/tooltips
- `z-50`: modales

## 3) Layout

## 3.1 Breakpoints

No hay override de breakpoints, aplicar defaults de Tailwind:
- `sm: 640px`
- `md: 768px`
- `lg: 1024px`
- `xl: 1280px`
- `2xl: 1536px`

## 3.2 Containers

Patron actual real:
- `mx-auto w-full max-w-6xl px-4 md:px-8`

Recomendacion:
- Mantener `max-w-6xl` para landing.
- Para bloques densos (hero copy/form), usar subcontainers `max-w-4xl` y `max-w-3xl`.

## 3.3 Grid system

Recomendado por bloque:
- Hero: 1 columna mobile, 2 columnas en `lg` (copy + visual).
- Metricas: `grid grid-cols-1 md:grid-cols-3`.
- Form contacto: `grid grid-cols-1 md:grid-cols-2` (info + form).
- Footer links: patron ya presente `md:grid-cols-3`.

## 3.4 Secciones (landing)

Hero:
- Alto recomendado: `min-h-[70vh] md:min-h-[80vh]`.
- Alinear contenido verticalmente al centro.
- CTA principal amarillo, subcopy en color secundario.
- Overlay oscuro cuando haya imagen de fondo.

Ribbon / tags:
- Franja horizontal compacta (`py-2`) con texto uppercase.
- Usar gradiente morado->amarillo (PROPOSED).

Metricas:
- Tres columnas desktop, stack mobile.
- Valor en acento amarillo + label en `text-sm`.

Accordion:
- Filas con borde inferior fino.
- Titulo grande + icono `+` / `-`.
- Estado abierto con alto contraste de fondo o borde acento.

"Why card":
- Card ancha con borde redondeado (`rounded-2xl`), padding amplio.
- Titular en amarillo, eyebrow pequeno arriba.

Logos strip:
- Grid/row centrada.
- Logos en escala visual uniforme (alto consistente).

## 4) Componentes UI

No existe libreria UI base aun (`Button.tsx`, `Input.tsx`, etc.). Actualmente hay componentes de seccion y funciones locales de links en `app/page.tsx`.

## 4.1 Button

### Variantes
- `primary` (amarillo): CTA principal ("VER COMO TRABAJAMOS", "EMPEZAR CONVERSACION")
- `secondary` (outline): accion secundaria
- `nav` (pill): boton en navegacion

### Tamano
- `sm`: `h-9 px-4 text-sm`
- `md`: `h-11 px-5 text-sm`
- `lg`: `h-12 px-6 text-base`

### Estados
- `hover`: bajar brillo o subir contraste del borde.
- `active`: ligera reduccion de escala (`scale-[0.99]`).
- `disabled`: opacidad + cursor no permitido.
- `focus-visible`: anillo claro y visible.

Ejemplo (PROPOSED tokens):

```tsx
<button
  className="
    inline-flex h-11 items-center justify-center rounded-full px-5
    font-semibold uppercase tracking-wide
    bg-[var(--color-accent-yellow)] text-black
    transition-colors duration-200 ease-out
    hover:brightness-95 active:brightness-90
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-yellow)] focus-visible:ring-offset-2 focus-visible:ring-offset-black
    disabled:cursor-not-allowed disabled:opacity-50
  "
>
  VER COMO TRABAJAMOS
</button>
```

## 4.2 Links

Estado actual:
- Nav link: `inline-flex underline underline-offset-4`
- Nav button: `inline-flex rounded-full border px-4 py-2`

Recomendacion:
- Link textual: subrayado solo en hover/focus.
- Link nav: hit area minimo `h-10`.

## 4.3 Input / Textarea

Estado actual:
- Inputs renderizados sin clases en `LandingFormSection`.

Recomendacion (PROPOSED):
- Fondo oscuro elevado.
- Borde sutil permanente + focus ring de acento.
- Label siempre visible.

```tsx
<input
  className="
    h-11 w-full rounded-xl border border-[var(--color-border-subtle)]
    bg-[var(--color-surface-elevated)] px-4 text-[var(--color-text-primary)]
    placeholder:text-[var(--color-text-secondary)]
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-yellow)] focus-visible:ring-offset-2 focus-visible:ring-offset-black
  "
/>
```

## 4.4 Accordion row

Recomendacion:
- `closed`: borde inferior + icono `+`.
- `open`: icono rotado/estado `-`, padding inferior visible.
- Transicion corta en icono y altura.

## 4.5 Card

Variantes:
- `default`: superficie elevada + borde sutil.
- `bordered`: borde claro, sin sombra.
- `highlighted`: borde/acento morado + titular amarillo.

## 4.6 Badge / Tag (ribbon)

Recomendacion:
- Uppercase, tracking amplio, peso medio.
- Espaciado horizontal regular entre items.

## 5) Motion

Estado actual:
- No hay Framer Motion/GSAP en dependencias.
- Base recomendada: transiciones CSS.

Convencion:
- Duracion hover/focus: `150ms-200ms`.
- Duracion panel/accordion: `200ms-300ms`.
- Easing: `ease-out` para entrada, `ease-in-out` para estados.
- Animar solo:
  - hover/focus en botones y links
  - apertura/cierre de acordeon
  - reveals discretos al cargar secciones

## 6) Accesibilidad

Checklist minimo:
- Contraste minimo AA (texto vs fondo).
- `focus-visible` obligatorio en botones, links, inputs.
- Objetivos tactiles minimos: `44x44` px.
- Texto sobre imagen/gradiente: agregar overlay para mantener legibilidad.
- No usar color como unico indicador de estado (combinar con borde/icono/texto).
- Labels de formulario visibles (no solo placeholder).

## 7) Convenciones de implementacion (Tailwind)

Reglas:
- No hardcodear colores hex inline si existen tokens CSS.
- Preferir utilidades de Tailwind consistentes por bloque (`px`, `py`, `gap`, `max-w`).
- Centralizar variantes de componentes (Button/Input/Tag) en componentes reutilizables.
- No usar `any` en tipos de UI/data.

Patron de composicion:
- Actualmente no hay `clsx`/`cva` en dependencias.
- Si se estandarizan variantes, introducir una sola estrategia (`clsx` o `cva`) y mantenerla.

Nomenclatura recomendada:
- `components/ui/Button.tsx`
- `components/ui/Input.tsx`
- `components/ui/Section.tsx`
- `components/sections/*` para bloques de page builder (ya aplicado).

Snippets utiles:

Primary button (realista para LABOLA):

```tsx
<button className="inline-flex h-11 items-center justify-center rounded-full border px-5 py-2 font-semibold uppercase tracking-wide">
  EMPEZAR CONVERSACION
</button>
```

Section container (patron actual del repo):

```tsx
<section className="mx-auto w-full max-w-6xl px-4 py-16 md:px-8 md:py-24">
  {/* contenido */}
</section>
```

Input con foco accesible (PROPOSED):

```tsx
<input className="h-11 w-full rounded-xl border px-4 focus-visible:outline-none focus-visible:ring-2" />
```

## 8) Deuda tecnica detectada

1. Falta de design tokens de marca
- Solo existen `--background` y `--foreground`.
- Accion: crear tokens de marca (amarillo/morado/surfaces) en `globals.css`.

2. Inconsistencia tipografica
- Se cargan fuentes Geist, pero la guia objetivo define `EXO / Montserrat / Inter / PT Sans Caption`.
- Accion: cargar y mapear fuentes objetivo en `layout.tsx` + `globals.css`, y eliminar fallback actual basado en Arial.

3. Falta de componentes UI base
- No hay `Button`, `Input`, `Textarea`, `Card` reutilizables.
- Accion: crear capa `components/ui` para evitar clases duplicadas.

4. Estilos de formulario incompletos
- Inputs/textarea actuales no tienen sistema visual definido.
- Accion: aplicar clases base + estados de foco accesibles.

5. Tokens y clases de estado dispersas
- Variantes (nav link/nav button/cta) se definen inline.
- Accion: estandarizar variantes y estados en componentes.
