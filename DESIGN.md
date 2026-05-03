# Design

## Theme

Warm paper, quiet marginalia, and heterogeneous fragments. The primary scene is someone browsing a hand-tended cabinet of notes in a calm room, not scanning an app dashboard. Light mode is the default; dark mode is warm-black and paper-like, not inverted.

## Palette

Use OKLCH custom properties in CSS. Neutrals are warm, never pure black or pure white.

- Background: warm cream.
- Reading background: slightly deeper cream.
- Surface: tinted paper white.
- Ink: warm near-black.
- Muted ink: warm gray-brown.
- Hairline: low-alpha warm ink.
- Terracotta: links, status marks, focus rings, small accents.
- Sage: evergreen marks and organic details.
- Highlight: paper marker yellow.
- List-link blue: early-web blue, deliberately used only in list views.

## Typography

Use a text serif for body, notes, quotes, and tile titles; a neutral sans for UI chrome; system mono for metadata. Preferred families are Source Serif 4, Geist or Inter, and JetBrains Mono or `ui-monospace`, with local/system fallbacks and no font CDN dependency.

Note body text is large and generous. Mosaic tiles use serif titles and restrained metadata. List views are austere, lowercase, blue-link indexes.

## Layout

The home route is a CSS multi-column mosaic. It should feel like a wall, not a feed. Tiles use natural height, `break-inside: avoid`, visible metadata, and no runtime masonry script.

The list route is a separate static page: single column, no cards, no grain, no images, grouped by year.

Long notes use a 64ch reading column with optional marginal metadata. Short notes render as fragments with less ceremony.

## Components

Core components are site header, mosaic filters, garden tile, list index, status mark, prose article, backlinks/related links, and colophon.

Tile variants: note, featured note, tweet, link, product, image, and quote pull. Product and image tiles are image-forward. Link tiles show domain context. Note tiles surface status and tags.

## Motion

No runtime JS is needed for v1. Use CSS-only hover and focus transitions, disabled under `prefers-reduced-motion`. Avoid reveal animations, scroll effects, parallax, and client-side view toggles.

## Content Syntax

Authoring happens in root-level folders:

- `notes/`
- `tweets/`
- `links/`
- `products/`
- `images/`

Each file is markdown with frontmatter. `type` is inferred from the folder. Required fields stay minimal; build helpers derive slugs, domains, excerpts, layouts, and dates where possible.
