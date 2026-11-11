# What visitors expect from each tag

A work list for the Tag family: what people already expect from a semantic element or a combination of elements, and the CSS (TagBrush.css) or JavaScript (TagAction) that would deliver it. Only gaps are listed; anything in the guides today is left out. Written November 10, 2026 against TagBrush.css 1.2.0 + unreleased, TagAction 0.2.0 + unreleased.

## For the implementer

- Every repo's `CLAUDE.md` and the family `Spec.md` still apply: no classes as API, hooks in the order native → ARIA → `data-tag*`, pages work without JavaScript, one PR per pattern (TagBrush) with CHANGELOG, README, `llms.txt` and demo in the same change.
- Budgets: TagBrush.css is 11.0 of 15 KB gzipped, TagAction 9.0 of 15 KB, the TagBrush guide index 3,038 of 4,000 tokens. Each item below must fit in one guide line.
- Each CSS pattern needs a false-match test (nearby markup it must leave alone). Each behavior needs mouse, keyboard, dynamic-insertion and no-JS tests.
- New attributes and commands must be added to TagCheck's vocabulary (`unknown-attribute`, `unknown-command`) in the same round.
- Before writing an item marked **mwg**, retrieve that guide: `npx -y modern-web-guidance@latest retrieve <id>`. Follow its fallback rules; do not assume browser support from memory.
- Decided November 10, 2026: section 2 ships as TagBrush.css 2.0 (the new look is the default, no opt-in variable), and the sticky header hook is `<header data-layout="sticky">`.

## 1. Defects (fix first)

Found by rendering TagKit's templates with the local builds.

| # | Where | What happens | Fix |
|---|---|---|---|
| D1 | TagAction `password.js` | The Show button wraps the input in a `role="group"` div, so a help `<small>` after the field is no longer next to it. In `signup.html` "At least 10 characters." lands inline beside the next label. The validation message placement ("a `<small>` right after the field") likely breaks the same way. | Move a following `<small>` (and the message element) so it follows the group, or look past the group when placing. Test with the sign-up template. |
| D2 | TagBrush stat tiles | `<del>−0.4%</del>` in a `<dl>` tile is struck through on a red highlight, so a drop reads as a deleted value. `<ins>` is a green highlight. | In `dl > div`, `ins` and `del` are plain colored text (success, error), no line, no background, with `▲`/`▼` before them (`content: "▲ " / ""`). Elsewhere unchanged. |
| D3 | Tables | Only cells holding a lone `<data>` align right. In the blog template "Customers" (42, 118) is left-aligned next to a right-aligned "Revenue", and no numeric header lines up with its column. | TagAction's sort already knows which columns are numeric: mark those `th` and `td` (`data-tag="num"`), and style them in TagAction's own sheet: `text-align: end; font-variant-numeric: tabular-nums`. An author's `align`/`text-align` wins. |
| D4 | TagAction `theme.js` | The saved theme is applied when the deferred script runs, after first paint on long pages: a flash of the other scheme. | Apply `data-theme` at module top level (before `start()`), and say in the guide that a page with a theme switch loads the script without `defer`. |
| D5 | Page footer columns | Columns bunch at the start and leave half the row empty. | The leading paragraph takes the free space; the `<nav>` columns sit at the end. |

## 2. The look: reading as designed, not generated (TagBrush.css 2.0)

`ROADMAP.md` chunk 23 left this open; it is now decided as the 2.0 default. The rendered templates confirm it: the landing page shows most of the marks people now read as machine-made.

| Mark of a generated page | Where TagBrush.css does it today | Proposed default |
|---|---|---|
| Every block in the same tinted, bordered, rounded box | Feature cards, plans, testimonials, stat tiles, callouts, code, quotes all share one frame | Frame by role. A box means "one discrete thing you can act on or compare": plans, clickable cards, stat tiles. Feature cards (no link, no picture) lose the box: icon, heading, text, separated by space. A box has a fill or a border, never both. Shadow only on overlays and the featured card. |
| Icon on a tinted rounded tile | `svg` first in a card | Plain icon at heading size in the text color. |
| Uppercase, letter-spaced label in the brand color over each heading | `hgroup > p` before a heading | Sentence case, muted text color, normal spacing. |
| Soft glow of the brand color behind the hero | `--hero-background` radial gradient | `none` by default; the variable stays. |
| Blue-tinted "slate" neutrals and a navy dark mode | Text, surface, border and dark background all take the primary's hue (chroma × 0.14–0.15) | Near-neutral: cap the chroma carried into neutrals at about 0.012, so the brand color appears only where it means something. |
| Brand color on everything that can take it | Header and sidebar nav links, table links, eyebrows are all primary blue | The primary color is for the main action, links inside prose, and focus. Nav links are text-colored (current page: full-contrast and heavier; others muted or with a hover fill). |
| Quote and callout look alike | `blockquote` and `article aside` are both a filled box with a start rule | A quote is text: start rule, no fill, normal text color. A callout keeps the fill. |
| Even, tight rhythm | About 2rem between landing sections; h1 sits on its subtitle | In `main[data-layout="full"]`, sections get generous block padding (`clamp(3rem, 8vw, 6rem)`). Space separates sections; boxes don't. More room between a hero h1 and its paragraph. |
| One type size contrast | h1 tops out at 2.5rem | A hero h1 (in `body > header hgroup`) grows to about 3.5rem with tighter tracking. App and article h1 unchanged. |
| The price is body text | "$12 per month" in a plan card (roadmap follow-up) | In a card, a paragraph that starts with `<strong>` or `<data>` followed by `<small>` is a price: large figure, small muted period. |

What makes a page feel hand-built is less the palette than completeness: every state is considered (hover, pressed, selected, busy, empty, error, disabled), numbers line up, nothing shifts, and the keyboard works. Sections 3 and 4 are that work, and they matter more than this table.

Not proposed: a new default brand color (any default becomes the tell; presets with font pairings in the theme builder do more), scroll reveals, hover lift on every card, gradient text.

## 3. Expectations by element

Priority: **P1** people notice its absence; **P2** familiar from good sites; **P3** polish. "CSS" is TagBrush.css, "JS" is TagAction. Without JavaScript each falls back to the plain element.

### Buttons and controls

| Markup | People expect | Work |
|---|---|---|
| `button[aria-expanded]` | A chevron that flips when open | P1 CSS: `::after` chevron, rotated for `="true"`. Covers TagAction dropdown buttons. |
| `button[aria-pressed]` | A toggle looks held down when on | P1 CSS: pressed = filled with a tint. TagAction's own Show/Hide and theme buttons gain a visible state. |
| `<button data-tone="error">` | A destructive action is red, most of all in a confirm dialog | P1 CSS: extend `data-tone` to buttons (solid and `.outline`). Update TagKit's confirm-dialog snippets. |
| `aria-keyshortcuts="/"` on a field or button | "/" focuses search; a shortcut shown is a shortcut that works | P2 JS: one key listener. A key (or `Control+K`, `Meta+K`) focuses a field or clicks a button. Ignored while typing in a field, unless it has a modifier. |
| `<button popovertarget>` + `[popover]`, TagAction dropdown list | The menu stays on screen: flips up or aligns to the other edge near a viewport edge | P2 CSS (and TagAction's sheet for `[data-tag="dropdown"]`): anchor positioning with fallbacks. **mwg** `viewport-aware-dropdowns` |
| `[popover="hint"]` with `interestfor` | A tooltip on hover and focus | P3 CSS only: style it small and inverted. No JS fallback (tooltips stay out of scope). **mwg** `interest-triggered-tooltips` |

### Forms

| Markup | People expect | Work |
|---|---|---|
| `label` + `:required` field | To see which fields are required before submitting | P1 CSS: `label:has(+ :required)::after`, `label:has(> :required)`: `content: " *" / ""` in the error color. Only in a form that also has optional fields (`form:has(:optional:not(button, [type="hidden"], [type="submit"]))`). |
| `<textarea>` in a form | Ctrl+Enter or ⌘+Enter sends it | P1 JS: `form.requestSubmit()`, so validation runs. **mwg** `ime-safe-enter-submit` |
| `role="status"`, `role="alert"` | A "Saved" or "Couldn't save" banner looks like one | P1 CSS: a banner with a tone (`status` info, `alert` error; `data-tone` overrides). Server-rendered or swapped in by htmx. No auto-dismiss. |
| `command="--clone"` rows | Every added row can be removed | P1 JS: `command="--remove"` with `commandfor` naming the row (ids in clones are already renumbered). Focus moves to the previous row or the Add button. Written `hidden` in the template's first, static row. |
| `input[type="file"][accept^="image"]` | A thumbnail of the chosen picture | P2 JS: object-URL `<img>` in the existing file list; revoke on change. |
| `search input[type="search"]` | A magnifier in the field | P3 CSS: background icon from `--color-text-muted`. |
| Submit with invalid fields | Focus goes to the first problem and it scrolls into view | Exists (`form.js`). Add a test that the field is not under a sticky header (see `scroll-padding`, below). |

### Tables and lists

| Markup | People expect | Work |
|---|---|---|
| Filter box + table or list, nothing matches | "No matches" instead of an empty table, and a count for screen readers | P1 JS: one `role="status"` line after the target ("No matches for 'x'", otherwise visually hidden "12 of 40 shown"). |
| Filter box with a `name` | The filter survives reload and can be shared | P2 JS: start from `?name=` in the URL; `history.replaceState` as it changes. |
| Filter box, matches | The matching text is highlighted | P2 JS + TagAction sheet: CSS Custom Highlight API, no DOM changes. **mwg** `highlight-text-ranges` |
| `thead th > input[type="checkbox"]`, a checkbox first in each row | Select all, a mixed state, Shift-click for a range, selected rows tinted | P2 JS: header box checks visible rows and shows `indeterminate`; Shift-click range. CSS: `tr:has(td :checked)` tint. |
| Sorted table | The order survives reload | P3 JS: under `data-tag-remember`, like `<details>`. |

### Disclosure, tabs, dialogs

| Markup | People expect | Work |
|---|---|---|
| `<details>` | It eases open; the marker is a chevron, not the browser's triangle | P1 CSS: chevron marker at the end of the summary in an accordion, at the start elsewhere; height transition where supported, instant otherwise and under reduced motion. **mwg** `animate-to-intrinsic-sizes` |
| `<details>`, printing | A printed FAQ includes the answers | P2 JS: open all on `beforeprint`, restore on `afterprint`. CSS print block: hide `nav`, `button`, `search`, `[data-tag]` controls; avoid breaks inside cards. |
| Tabs | Find-in-page reaches text in a hidden panel; a link to a panel's id selects its tab | P2 JS: hide panels with `hidden="until-found"`, select on `beforematch`, and select from the `#fragment` (as `details.js` does). |
| Modal `<dialog>` | The page behind doesn't scroll, and nothing shifts sideways when it opens | P1 CSS: `html:has(dialog:modal) { overflow: hidden }` with `scrollbar-gutter: stable` on the root. |
| Modal `<dialog>` on a phone | A sheet from the bottom edge, full width | P3 CSS: below about 30rem, dock to the bottom with top corners rounded; slide instead of scale. |
| Image viewer with several pictures | Arrow keys and buttons step through the set | P3 JS: pictures in the same `<figure>` or section form a set. Add a TagKit gallery snippet (asked for in eval round 1). |

### Page and navigation

| Markup | People expect | Work |
|---|---|---|
| `<header data-layout="sticky">` (opt-in) | A top bar that stays, gains a hairline or shadow once stuck, and never covers a heading you jumped to | P2 CSS: `position: sticky`, `scroll-padding-top` on the root via `:has()`, stuck styling where supported. **mwg** `state-aware-sticky-headers` |
| `a[target="_blank"]` in prose | A sign that it opens elsewhere | P2 CSS: `::after { content: " ↗" / " (opens in a new tab)" }`. Not on buttons, nav, cards, or image links. |
| Sidebar `aside nav` on a phone | It collapses instead of pushing content down | Check what happens today at 360px; if it stacks above `main`, document the `popover` phone-menu pattern for sidebars and add it to the dashboard template. |

## 4. Not doing

- Sticky table headers (a scrolling `<figure>` gives `sticky` nothing to hold to), drag-to-reorder, multi-step form wizards, toasts that time out, infinite scroll: components or accessibility traps.
- Automatic link prefetching: a prefetched `GET /logout` signs people out.
- Animated row reordering on sort, scroll reveals, parallax: motion as decoration.
- A tooltip fallback in JavaScript, and anything that needs a class.

## 5. Order of work

1. D1–D5.
2. P1 CSS in TagBrush (chevron, pressed, danger button, required mark, status and alert banners, details marker and easing, dialog scroll lock), one PR each.
3. P1 JS in TagAction (Ctrl+Enter, `--remove`, filter empty state), then TagCheck vocabulary and TagKit snippets that use them.
4. Section 2 as TagBrush.css 2.0, one release with before/after screenshots of all six templates in light and dark.
5. P2, then P3.
6. Eval round 2 with requests that need the new patterns (a selectable admin table, a destructive confirm, a form with repeatable removable rows, a saved-status banner).
