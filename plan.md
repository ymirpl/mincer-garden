# Critique: marcin's garden — `index.html`

Preflight: `context=adapted (garden.md acts as PRODUCT.md+DESIGN.md combined) · register=brand · shape=n/a (critique only) · image_gate=skipped (artifact has no live photos yet) · mutation=closed`.

## Anti-Patterns Verdict

**Does it look AI-generated?** Half no, half yes — and the half that does is mostly fixable.

The strong half: typography is committed (three families, real weight contrast, real scale jumps), color is OKLCH-tinted (no `#000`, no `#fff`), `color-mix(in oklch, …)` is used the way the spec wants, paper grain is dialed in at 6% via SVG noise, and the masonry is real CSS multi-column with zero JS. None of that reads as slop.

The slop half is the **placeholder gradient layer** — every link/product/image tile is a colored `<div>` with an italic ghost label on top (`tone-a/b/c/d` gradients, `style-a/b/c` OG fakes, the cross-hatched `.frame` on the featured tile). The brand reference is explicit: a colored block where a hero photo belongs is worse than stock. The whole personality of a mymind-style wall lives in real photos with extracted tints; the current preview can't be honestly evaluated because that signal is missing. This is the single biggest issue.

**One absolute-ban infraction**: the intro band copy contains an em dash — *"…notes — tended in markdown…"*. Shared laws ban em dashes. Easy fix, but it's there.

**One borderline call**: `.t-quote blockquote` uses `border-left:1px solid var(--terracotta)`. The ban is on side-stripes >1px, so 1px scrapes through the letter. Spirit-wise it's still the colored vertical rule move; spec called for `0.5px`, so the implementation actually went thicker than spec.

## Design Health Score (Nielsen 10)

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Nav active state correct; filters have no on-click affordance yet. |
| 2 | Match System / Real World | 4 | "tended", "seedling", "fragment" — language matches the metaphor honestly. |
| 3 | User Control and Freedom | 3 | Two views accessible, but no back/escape signposts on tile dives (n/a in static). |
| 4 | Consistency and Standards | 3 | Tile chrome consistent. Filter strip diverges in casing (lowercase mono) from header (mixed). |
| 5 | Error Prevention | n/a | Read-only surface. |
| 6 | Recognition Rather Than Recall | 3 | Type badges + status pills carry meaning. Sage vs terracotta swatches read pre-label. |
| 7 | Flexibility and Efficiency | 2 | No keyboard focus styling, no skip-link, no `prefers-reduced-motion`. |
| 8 | Aesthetic and Minimalist Design | 3 | Strong restraint, but intro band over-talks (see P1). |
| 9 | Error Recovery | n/a | |
| 10 | Help and Documentation | 3 | Colophon + "tended in markdown" line carries it lightly; no about page. |
| **Total** | | **24/32 applicable** | **Solid; clear path to 28+.** |

## What's Working

1. **The tint system is the design.** `color-mix(in oklch, var(--tint) 10%, var(--surface))` for the surface, plus `color-mix(in oklch, var(--tint) 35%, transparent)` for the hover shadow, is the load-bearing move that translates Maggie-Appleton-warmth into a programmable system. Nothing else in the file beats this.
2. **Restraint pays off.** One terracotta accent (link underlines, status pills, active filter), one sage (evergreen, the leaf in the wordmark) — the Restrained color strategy is correctly held. No gradient text, no glassmorphism, no semantic-color UI.
3. **Tile diversity beats grid sameness.** Pull quote with no chrome, image tile with full-bleed and no padding, tweet with highlight-marked phrase, link with OG region — the shared "absolute ban on identical card grids" is sidestepped because each template has its own anatomy.

## Priority Issues

### [P0] Real imagery is missing — the wall has no photos
**Why it matters.** The mosaic's reason-for-being is "mymind feel" — heterogeneous photographic fragments that read as a curated wall. The current preview ships colored gradients with italic ghost text where every photo, OG, and product image belongs. Brand register: zero imagery on a brief that *requires* imagery is a bug. Without real photos, you can't evaluate dominant-color tinting, hover-shadow color bleed, image-aspect rhythm, or whether "no two same type adjacent" actually reads as varied.

**Fix.** Replace the eight image/product/link tile placeholders with real Unsplash IDs (e.g. `photo-1559339352-11d035aa65de` for a study desk, `photo-1590490360182-c33d57733427` for olive groves, etc.). Wire the `--tint` style to a single hardcoded sampled color per image so the shadow color works. Even four real photos plus four placeholders changes the read of the page completely.

**Suggested command.** `$impeccable polish` (after photos land) or a manual image pass.

### [P1] The intro band over-explains and quantifies what should stay quiet
**Why it matters.** The line *"a small wall of fragments, links, products, images and notes — tended in markdown, ordered by topic, not by date"* restates what the wall already demonstrates. The meta column *"412 fragments · 87 evergreen"* is SaaS-dashboard energy on a non-performative page — exactly the "feed" stance you said you'd reject. Cognitive load goes up; voice goes down. Plus this is where the em-dash ban gets violated.

**Fix.** Cut the explanatory sentence entirely. Keep the meta column but lose the count: *"tended apr 26, 2026 · prefers warm-paper"*. Or replace with a single italic line of marginalia ("*currently growing: como notes, taste vocabulary, evergreens that won't behave*") — voice, not metric.

**Suggested command.** `$impeccable clarify` for the copy, then `$impeccable distill` for the band.

### [P2] Inter is the reflex sans — the garden's sans has no personality
**Why it matters.** Inter is on the brand reference's reflex-reject list for a reason: it's the training-data default for "neutral grotesk." Source Serif 4 carries the warmth single-handedly while Inter shows up only at 11–14px in mono'd-out filter chrome and badges. The pairing is competent but predictable. "Considered, calm, alive" deserves a sans with a face — Söhne (your own spec listed it), Geist, ABC Diatype, Untitled Sans, or even just Inter swapped for a humanist like Söhne or Maple Mono.

**Fix.** Either commit to a more characterful sans (license it once and use it sparingly so the cost is bounded), or lean in further on serif by setting filter labels and badges in small-caps Source Serif at the same sizes — which would actually intensify the "wunderkammer" voice. The compromise (Inter at 11px in tracked-out mono casing) is the timid middle.

**Suggested command.** `$impeccable typeset` with constraint "stay in the warm/considered lane, avoid Inter and the editorial-magazine reflex."

### [P3] Accessibility floor not met
**Why it matters.** Your own spec (12.3) mandates: 2px terracotta focus ring, 2px offset, on every focusable element; skip-link; `prefers-reduced-motion: reduce` collapsing transitions to instant; semantic landmarks. The current implementation has none of this. Tile shadow-on-hover is the only state. Tab through it on a keyboard and you can't tell where you are.

**Fix.** Add `:focus-visible` ring (2px terracotta, 2px offset, 4px radius) to `.tile`, `nav.views a`, `.filters a`. Add a skip-link before `<header>`. Wrap the `transition` rules in a `@media (prefers-reduced-motion: no-preference)` guard. Lift `transition` properties off `.tile` when reduced-motion is set.

**Suggested command.** `$impeccable harden`.

### [P4] The pull-quote tile is the only ban-adjacent move; the OG ghost layer is the louder slop tell
**Why it matters.** Two related issues: (a) the `border-left` on the pull quote is at 1px (technically inside the rule, but doubled the spec's 0.5px); (b) the `.t-link .og .ghost` italic-text-with-shadow over a gradient is a faked OG-card affordance that screams placeholder. When real OG images land, the `.ghost` div becomes orphan code.

**Fix.** Pull quote: drop the border-left entirely, set the blockquote in a slightly larger italic with leading hanging punctuation; move the cite under it without the indent. OG ghost: remove the `.ghost` element from the markup; let the real OG image carry it. If a fallback for missing OG is needed, render the title in serif at 19px on a flat warm tint, no italic, no shadow.

**Suggested command.** `$impeccable polish`.

## Persona Red Flags

**Maggie-Appleton-comparer (the intended audience).** Reads the wall, recognizes the lineage, expects the marginalia rail and the painterly status glyphs to do real work. Status glyphs are present but tiny (12×12 SVG with hairline strokes — they read as decoration, not as the painterly marks promised in 5.7). Rail is absent (deferred to long-note view, fair). **Risk:** reads as homage, not as your own version. The fix is signature moves — a typographic risk somewhere, a moment of over-design that's clearly Marcin and not Maggie.

**Cmd-F reader (Nat-Friedman list register).** Toggles to list view, gets pure white + serif + blue links. List view is the strongest part of the file as-is — austere, correct, right. Only red flag: the list collapses 412 fragments into 16 example rows, but the year groupings work and the typography is calm. **No fixes needed for this persona.**

**Mobile reader.** Three breakpoints (1180, 760, 480). Below 760 the intro stacks correctly; below 480 it goes single-column. The filter strip wraps but doesn't simplify — at 360px viewport you'd see ~11 filter chips taking 4 rows before the wall begins. **Risk:** filter strip becomes the page on mobile. Consider collapsing tag filters into a single `tags →` link below 760px.

## Minor Observations

- The `nav.views` underline uses `text-decoration-color:var(--terracotta)` at `text-decoration-thickness:0.5px` — half-pixel underlines render inconsistently across DPI. Use 1px and rely on color to keep it quiet.
- The body grain `mix-blend-mode:multiply` on top of cream is right; just verify it doesn't darken the dark-mode surface (which isn't implemented yet — `[data-theme]` switch is missing from the file).
- `.t-feature .frame` uses a 135° repeating linear gradient at rgba(194,96,74,0.10) — a faux-cross-hatch. Once a real illustration lands here, kill the cross-hatch. If an illustration won't land, replace the cross-hatch with a single vertical sage rule and a serif drop-cap "A" — closer to your own 5.6.1 description.
- `box-sizing` is set globally in two places (the bootstrap CSS and the design CSS). Harmless, but the bootstrap `* { margin: 0; padding: 0; box-sizing: border-box; }` resets margin globally and that fights typography defaults — consider scoping the bootstrap to its own loading screen only.
- The view switcher does work via JS (`data-view` toggle), but your spec said "two static routes, no runtime toggle." Single-file artifact constraint forces this; flag it for the real Astro build.
- `--hairline:rgba(20,17,12,0.08)` and `--hairline-strong:rgba(20,17,12,0.14)` are in srgb space, while the rest of the palette is OKLCH-friendly. Convert hairlines to OKLCH so `color-mix` calls don't quietly cross color spaces.

## Questions to Consider

1. **What is the one signature move that says "Marcin," not "tasteful Maggie homage"?** Right now the wall is faithful to references. A small, specific gesture — a marginalia handwritten note on the home page, an unusual type treatment on a single tile, a per-section grain density that varies — would lift it from skilled imitation to authored.
2. **Does the home need an intro at all, or is the wordmark + the wall enough?** If the wall is the argument, prose under the wordmark dilutes it. Compare to mymind: zero prose on the home.
3. **Should the tweet tile look the way it does — chrome'd, padded, framed?** Tweets are scraps. The least-chrome tile (the pull quote) is the most successful one. Consider tweets dropping the border + radius + tile-shadow entirely and just being pure typography among the tiles.
4. **What if filters collapsed into the colophon at the bottom, not the top?** A filter strip above the wall reads as toolbar-as-feature; a discreet tag list at the bottom reads as "if you need it, it's here." Closer to garage-door-up.

---

## Recommended Actions

Natural order:

1. **`$impeccable polish`** — drop placeholder gradients in favor of real Unsplash photos with sampled tints; remove em dash from intro; trim `.ghost` overlays; thin the pull-quote border.
2. **`$impeccable distill`** — cut intro sentence, shrink meta line, kill the metric count.
3. **`$impeccable harden`** — focus rings, skip-link, `prefers-reduced-motion`, dark-mode tokens.
4. **`$impeccable typeset`** — replace Inter with a more characterful sans (or commit harder to serif-only chrome).
5. **`$impeccable bolder`** *(optional)* — find the one signature move that signs the page.
