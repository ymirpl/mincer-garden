# Theory: Building The Garden

## Problem

The repo began with a detailed product/design plan and a static HTML prototype, but no executable site. The work is not just "convert HTML to Astro"; the hard part is turning a visual prototype and a markdown philosophy into a durable authoring system. The garden needs to feel hand-tended while staying low-friction enough that new fragments can be added from a plain text editor.

The user specifically wants the notes to live in an obvious repository folder. That changes the default Astro shape: instead of burying content under `src/content`, the right model is root-level content folders (`notes/`, `tweets/`, `links/`, `products/`, `images/`) loaded by Astro content collections. This keeps the repo legible to humans and agents while preserving build-time schema validation.

## Operating Theory

The project has two first-class experiences: a heterogeneous mosaic for browsing and a severe list view for reading inventory. The static `index.html` is the visual source of truth for the mosaic's warmth, typography, tile anatomy, and paper feeling. `garden.md` is the source of truth for architecture, authoring syntax, and scope.

Astro's current content collection loader API can load markdown from arbitrary folders, so the garden can satisfy both requirements: root-level markdown for authoring and typed collections for rendering. Each content type should stay a separate collection because the frontmatter contracts differ meaningfully, but the rendering layer should normalize them into a shared `GardenItem` shape for mosaic, tags, feeds, and interleaving.

The repo now expresses that model directly. `PRODUCT.md` and `DESIGN.md` capture the strategic and visual context so future design work does not have to re-infer the garden from the original brief. The implementation uses root folders as the user-facing content API and `src/content.config.ts` as the schema boundary. Everything downstream consumes normalized items from `src/lib/content.ts`, which keeps route files simple and makes new views cheaper to add.

Verification confirmed the Astro build produces 58 static routes with no emitted JavaScript files and no `<script>` tags on the representative home, list, or note pages. That validates the central architectural bet: the garden can have multiple views and typed content without paying a runtime JavaScript cost.

## Strategy

The implementation should ship a complete Phase 0/Phase 1 slice rather than a skeleton. That means real routes, real schemas, starter content, reusable tile components, list views, note reading layouts, tag pages, RSS feeds, sitemap support, and GitHub Pages deployment. More ambitious build-time features like OG image generation, dominant-color extraction, Pagefind, and full wikilink failure enforcement can be represented by stable extension points without blocking the first deployable site.

The design strategy is to preserve the prototype's decisions but remove the prototype-only runtime toggle. Mosaic and list are separate static routes so the cold page remains zero-JS. Local SVG media placeholders are preferable to remote images for starter content because they keep builds deterministic and avoid third-party requests.

## Key Discoveries

The brief already contains the strategic product answers that the design setup normally asks for: brand register, audience, purpose, anti-references, visual system, accessibility constraints, performance budget, and authoring rules. The existing `index.html` uses client-side switching between mosaic and list, but `garden.md` explicitly rejects runtime view switching, so the Astro version should replace that behavior with static links.

The repo has an unrelated deleted `plan.md` in the worktree. That should not be restored or touched as part of this task.

The first implementation pass exposed a useful architectural simplification: interleaving does not need a generated file for v1. It can run during Astro's static render from the already-loaded collections, preserving zero runtime JavaScript. A generated `tags.json` remains useful later for Hermes, but route rendering can compute tag counts in memory today.

Dependency verification changed the package choice. Installing Astro 5 built successfully, but `npm audit` reported a moderate XSS advisory fixed only on the Astro 6 line. Upgrading to Astro 6.2.1 kept the build green and cleared the audit, so the scaffold should start on the safer major version rather than pinning to the older plan-era assumption.

The user correctly caught that the Astro port was not visually faithful enough to the actual `index.html` prototype. The source prototype was not lost: git shows it unchanged from commit `6980f1a`, with no working-tree diff. The mistake was interpretive, not destructive. The corrective move is to make the Astro shell reuse the prototype's class structure, font loading, paper texture, hex token layer, and tile sizing rules instead of treating the prototype as loose inspiration.

The concrete regressions named by the user were confirmed in source: Astro had retained a dark-mode media query and an `/about` navigation/page that the prototype did not expose. Those were removed. The layout now sets the same `data-view` attribute convention as the prototype, the built home nav contains only `mosaic · notes`, and a production build produces 57 static pages instead of the prior 58 because `/about` is gone.

A second regression explained the tile movement: `global.css` still contained the earlier approximation before the prototype overrides, so the old `.tile:hover { transform: translateY(-2px) }` rule remained active. The stylesheet has now been replaced with the `index.html` stylesheet as the base source, with only a small appended section for Astro-only detail pages. The build output no longer contains the moving-tile hover transform, the dark scheme, the about nav, or the earlier approximation class names.

## Open Questions

The biggest open area is no longer whether the scaffold builds; it does. The richer Phase 2 features remain intentionally deferred: real OG image generation, image tint extraction, Pagefind, generated tag indexes for agents, backlink enforcement, and a Hermes capture workflow. Visual QA in a browser is still worth doing because the build confirms structure and output, not taste at rendered viewport sizes.
