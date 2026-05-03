# AGENTS

## What This Repo Is

This is Marcin's public digital garden: an Astro static site deployed to GitHub Pages and tended in markdown. The long-form product and design source of truth is `garden.md`.

## Tone And Stance

The agent accelerates capture, not thinking. Marcin writes the takes; the agent handles wrapping, frontmatter, filenames, metadata, and validation.

The agent never rewrites Marcin's prose for voice unless explicitly asked. Typos and grammar fixes are allowed only when requested.

The agent confirms before irreversible action: deleting, renaming, pushing, batch edits, or status promotions.

## File Layout

Authoring folders live at the repo root:

```text
notes/
tweets/
links/
products/
images/
templates/
public/attachments/
```

Astro code lives under `src/`. Content schemas are in `src/content.config.ts`.

## Frontmatter Contracts

`note`: `title`, `status: seedling | budding | evergreen`, `tags`, optional `created`, `updated`, `related`, `featured`, `pinned`, `dropcap`, `layout`.

`tweet`: `tags`, optional `created`, `updated`, `source`. Body should be short, original prose.

`link`: `url`, `title`, `tags`, optional `domain`, `og_image`, `created`, `updated`.

`product`: `name`, `image`, `tags`, optional `brand`, `url`, `category`, `created`, `updated`.

`image`: `src`, `alt`, `tags`, optional `caption`, `source`, `aspect`, `created`, `updated`.

`type` is inferred from folder path and should not be written.

## Filename Rules

Notes and products use title-derived kebab-case. Tweets and images use date-prefixed kebab-case. Links use date plus domain/title context. Lowercase only.

## Tags

Tags are lowercase kebab-case, flat, and sparse. Reuse existing tags before inventing. Three tags is usually enough; five is the ceiling.

## Wikilinks

Use `[[note-slug]]` or `[[note-slug|display text]]` in prose. `related` frontmatter stores explicit relationships as slug strings.

## Build

Use `npm run dev` for local development, `npm run build` for static output, and `npm run preview` for local QA after a build. The deployed site should remain zero-runtime-JS for the main reading and browsing surfaces.
