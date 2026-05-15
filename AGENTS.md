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

`tweet`: `tags`, optional `created`, `updated`, `source`, `author`, `handle`, `image`, `source_date`, `truncated`. Body should be the captured tweet text or short original prose.

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

## Tweets

Tweets can be original short prose or captured external posts. For captured posts, preserve provenance without pretending the text is Marcin's original voice.

Use `tweets/YYYY-MM-DD-<tweet-context>.md` with lowercase kebab-case. The date prefix should normally be the capture date; add `source_date` when the source post date is known and meaningfully different.

For captured external tweets:

1. Put the source URL in `source`.
2. Add `author` and `handle` when known.
3. If the capture is incomplete, set `truncated: true` and keep the body to the captured excerpt only.
4. If there is a screenshot, save it under `public/attachments/tweets/` and reference it as `image: tweets/<filename>`.
5. Keep tags sparse and factual, usually three tags. Use `[change-me]` only when the user has not provided enough context.
6. Do not rewrite the tweet's wording unless the user explicitly asks. Formatting fixes are okay when needed to make markdown render correctly.
7. After creating or editing tweet content, run `npm run build` before committing.

## Build

Use `npm run dev` for local development, `npm run build` for static output, and `npm run preview` for local QA after a build. The deployed site should remain zero-runtime-JS for the main reading and browsing surfaces.

## Inbox

`inbox/raw/` is a capture buffer for unformatted stuff. Drop anything there and run `npm run inbox` to process it into proper garden files.

### What goes in the inbox

- **URL files** (`.url` or `.txt` containing a single URL) → becomes a `link`. `defuddle` fetches title and description automatically.
- **Markdown with frontmatter** → routed to the correct folder based on frontmatter keys (`url` = link, `name` + `image` = product, `src` + `alt` = image, `title` = note, none = tweet).
- **Markdown without frontmatter, ≤280 chars** → becomes a `tweet`.
- **Markdown without frontmatter, >280 chars** → becomes a `note`. The first line becomes the title; the rest becomes the body.
- **Image files** (`.jpg`, `.png`, `.webp`, `.svg`, `.gif`) → moved to `public/attachments/` and an `image` markdown file is created alongside.

### Agent inbox workflow

When the user pastes a raw capture with no instruction:

1. Draft a file in `inbox/raw/` using the simplest possible format:
   - Just a URL → save as `YYYY-MM-DD-<slug>.url`
   - A raw thought → save as `YYYY-MM-DD-<slug>.md`
   - An image → save as-is (the script will rename with a date prefix)
2. Do **not** guess tags. Use `[change-me]` if unsure.
3. Do **not** write frontmatter for raw text unless the user specifies type or fields.
4. Show the user what will be created, then run `npm run inbox` on confirmation.
5. Report the created files and any `change-me` tags that need replacing.

### Processing details

`scripts/process-inbox.mjs` handles the conversion:

1. Reads every file in `inbox/raw/` (ignoring `.gitkeep` and dotfiles).
2. For URLs: runs `npx defuddle parse <url> --json` to extract title and description. Falls back to basic URL metadata if defuddle fails.
3. Generates filenames per garden conventions, checking for collisions and appending `-1`, `-2`, etc.
4. Writes markdown to `notes/`, `tweets/`, `links/`, `products/`, or `images/`.
5. Moves the original file to `inbox/processed/` as an archive.

Processed files accumulate in `inbox/processed/`. Clean that folder whenever you like — it is not tracked by git.
