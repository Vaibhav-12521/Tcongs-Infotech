# Tcongs Infotech - Home Page Redesign

A ground-up redesign of the [tcongsinfotech.com](https://tcongsinfotech.com/) home page,
built as a single self-contained static page. Same business, same content, same brand -
rebuilt around a clearer information hierarchy and a modern, responsive UI.

**Scope:** home page only, as specified in the brief.

---

## Stack

Deliberately dependency-free - **semantic HTML5, modern CSS, vanilla JS**.

| | |
|---|---|
| Build step | none |
| JS libraries | none (the original loaded jQuery, toastr and intl-tel-input) |
| Total page weight | ~2.8 MB, almost entirely the six process photographs |
| Fonts | Geologica + Inter (the site's own typefaces) via Google Fonts |

No framework was used on purpose: the page is one route with no shared state, so React or
Next.js would have added a build pipeline and runtime cost without buying anything. The
result loads and renders faster, and a reviewer can open `index.html` and read the whole thing.

```
redesign/
├── index.html              # the entire page
├── assets/
│   ├── css/style.css       # design tokens + components, ~1,500 lines
│   ├── js/main.js          # nav, reveals, scroll-spy, accordion, form validation
│   └── img/                # brand logo, icons, process photography
├── vercel.json             # cache headers for /assets
└── netlify.toml            # equivalent config for Netlify
```

---

## What changed, and why

**A real visual hierarchy.** The original leads with six equally-weighted service tiles, so
nothing reads as primary. The redesign opens on one clear proposition, then steps down through
services → proof → process → objections → contact. Every section answers the question the
previous one raises.

**Services became scannable.** 49 individual services were buried in a hover-only dropdown.
They now live in a 6-card bento grid where each card names its sub-services as chips, so the
breadth is visible without interaction - and the full list is still one click away in the
mega menu.

**The broken portfolio was rebuilt.** All four showcase images 404 on the live site (as do the
process video and the logo on dark backgrounds - see below). Rather than ship placeholders,
each of the four products - Gig Desk, Ship Track, Villa Vault, Bloom Money - is rendered as a
**pure CSS/HTML product mockup**: a dashboard with live stat tiles, a shipment map with a
dashed route, a villa booking card, a savings-circle progress ring. Nothing can 404, they're
a few KB total, and they stay sharp at any resolution.

**A dark-mode logo.** The brand logo is a base64 PNG wrapped in an SVG `<use>` reference, and
its wordmark is navy `#05548A` - effectively invisible against the site's near-black header.
I extracted the PNG and recoloured only the navy pixels to white, preserving the anti-aliasing
and leaving the coloured mark and orange "INFOTECH" untouched. `assets/img/logo-dark.png`.

**The process section drives itself.** Six steps with a sticky photo panel that cross-fades as
you scroll, a progress rail, and dimmed inactive steps. On mobile it collapses to a plain
stacked list with inline thumbnails - no sticky behaviour to fight the small viewport.

**Honest numbers.** Every figure on the page is traceable to the original site's own copy -
8+ years, 49 services, 6 verticals, 8 marketplaces, 7-15 day websites, 3-8 week platforms,
one business day to reply. Nothing was invented to fill a stat block.

---

## Design system

Brand colours are carried over exactly from the live site's CSS variables:

| Token | Value | Use |
|---|---|---|
| `--brand` | `#E51A4B` | primary crimson (also appears in the logo mark) |
| `--lime` | `#E2EC07` | accent, primary CTA fill |
| `--bg` | `#08080A` | page base |
| `--surface` | `#101014` | cards |

Type scales fluidly with `clamp()` (hero runs 2.6rem → 5.5rem) so there are no fixed
breakpoint jumps. Spacing, radii, easing and shadows are all tokenised at the top of
`style.css`.

---

## Responsiveness

Built mobile-first and verified against the layout breakpoints at 360 / 480 / 768 / 1024 /
1280 / 1920 px.

- **Navigation** - mega menu on ≥1024px; below that, a full-height drawer with its own
  accordion for the 49 services.
- **Bento grid** - 1 column → 2 → an asymmetric 6-column grid.
- **Process** - sticky two-column split on desktop, stacked with inline thumbnails on mobile.
- **Mockups** - driven by `aspect-ratio` and percentages, so they scale rather than reflow.

No horizontal overflow at any width; wide content is constrained rather than allowed to
push the body.

---

## Accessibility

- Semantic landmarks, one `h1`, ordered heading levels, and a skip link.
- Full keyboard support: the mega menu and drawer close on `Escape` and restore focus, the
  mega menu closes on `focusout`, and every control has a visible `:focus-visible` ring.
- `aria-expanded` / `aria-controls` on all disclosure widgets; `aria-invalid` on failed fields.
- Decorative images and mockups are `aria-hidden` or have empty `alt`; the process photos
  carry descriptive alt text.
- `prefers-reduced-motion: reduce` disables the marquee, count-ups, reveals and parallax, and
  forces all content visible.

## Performance

- Zero third-party JS. One stylesheet, one script (`defer`).
- A single rAF-throttled `scroll` listener drives the header, process scroll-spy and nav
  scroll-spy; reveals and count-ups use `IntersectionObserver` and unobserve once fired.
- Below-the-fold images are `loading="lazy"`; `width`/`height` are set to prevent layout shift.
- Immutable cache headers on `/assets/*`.

---

## Run locally

```bash
cd redesign
python -m http.server 8123
# http://localhost:8123
```

## Deploy

Already configured for both hosts, no build command, publish directory `.`:

```bash
vercel deploy --prod        # uses vercel.json
```

Or drag this folder onto <https://app.netlify.com/drop>.

---

## Known limitations

- **The inquiry form is front-end only.** Static hosting has no backend, so submission runs
  full client-side validation and shows the success state without transmitting anything. The
  form says so in the UI. Wiring it to Formspree, a Vercel Function or the existing endpoint
  is a small change.
- **Nav links are in-page anchors.** This is a home-page-only brief, so `Work`, `Process` and
  the service links scroll to sections rather than routing to other pages.
- **Google Fonts needs a network connection** to render Geologica/Inter; a system font stack
  is declared as fallback.
