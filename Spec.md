# Tag Family Ecosystem Spec

Kovir Labs — TagBrush, TagAction, TagCheck, TagKit

## 1. Purpose

The Tag family makes plain semantic HTML look good, behave well, stay correct, and be quick to assemble — with no classes, no framework, and no required build step. It is designed to be equally usable by people and by AI agents writing pages, documentation, and chat output.

The family deliberately does not compete with component frameworks (Vue, React, Svelte UI kits). It enhances the HTML the browser already understands.

## 2. Family overview

| Repo | Role | Status |
| --- | --- | --- |
| kovirlabs/tagbrush | Classless CSS for semantic HTML | Existing |
| kovirlabs/tagaction | JavaScript behaviors that make tags act as expected | New |
| kovirlabs/tagcheck | CLI/CI checker for semantic and accessibility mistakes | New |
| kovirlabs/tagkit | Page templates, copy-paste snippets, build-time includes, platform themes | New |

Each repo is independent and opt-in. TagBrush must never require JavaScript. TagAction must never require TagBrush, but should look best with it.

## 3. Shared principles

- Semantic HTML first. Use native elements and attributes before inventing anything.
- Progressive enhancement. Every page must work, plainly, with JavaScript disabled.
- No build step required for users. One file, one CDN line.
- Tiny. TagBrush stays around 4 KB gzipped; TagAction targets a similar budget.
- Classless by default. Where hooks are needed, prefer existing ARIA attributes, then `data-tag*` attributes. Never invent utility classes.
- Fill gaps, do not reimplement the browser. Native `details`, `dialog`, and `popover` behavior is used, not replaced.
- Specificity-safe. CSS selectors wrapped in `:where()`; user CSS always wins.
- Accessible. WCAG AA contrast in light and dark schemes; full keyboard support for every behavior.
- AI-legible. Every feature must be describable in llms.txt in a few lines, with nothing an agent could plausibly hallucinate.

## 4. Repo structure decision

TagAction is a separate companion repo, not part of TagBrush.

Reasons:

- TagBrush's core promise is no JavaScript.
- Agent instructions for TagBrush stay simple: add one stylesheet. Mixing JS in invites agents to add unrequested scripts.
- Independent versioning and size budgets.

Coupling rules:

- TagAction keys off TagBrush's existing ARIA and `data-` hooks where they exist.
- Each TagAction release documents the TagBrush versions it is tested against.
- Both repos share the eval and benchmark harness approach.

## 5. TagAction

### 5.1 Scope

Make HTML tags behave the way people expect on a web page. Single script, auto-initializes on load, opt-out per element with `data-tagaction="off"`.

### 5.2 Behaviors (all in v1)

1. dialog — close on backdrop click; open from a button that targets the dialog by id with no page script.
2. details — optional group mode where opening one closes siblings; optionally remember open state.
3. table — click a column header to sort (with `aria-sort`); optional filtering from an associated search input.
4. form — friendlier validation messages; submit button disables while submitting; warn on leaving with unsaved changes.
5. textarea — auto-grow while typing; character counter when `maxlength` is set.
6. input type="file" — show chosen file names; drag-and-drop support.
7. input type="password" — show/hide toggle.
8. pre and code — copy-to-clipboard button.
9. time — render in the reader's local timezone or as relative time ("3 hours ago").
10. nav and a — set `aria-current="page"` on the current link; highlight the active section on scroll.
11. h2 and h3 — automatic anchor links; optional generated table of contents.
12. img — click to enlarge; lazy-load fallback.
13. menu, or a button controlling a list — dropdown keyboard behavior: arrow keys, Escape, close on outside click.
14. output — live update from its associated form inputs.
15. abbr — show the title on tap, since touch devices have no hover.

Also in v1: cloning a `template` element to add repeated rows or list items.

### 5.3 Dynamic content

A single MutationObserver initializes behaviors on content added after load. This must work with htmx swaps and any other library that modifies the DOM. Document "works great with htmx" without depending on it.

### 5.4 Out of scope

- Bundling htmx or any server-fetching/swapping behavior.
- Client-side HTML includes (headers, footers). Handled at build time by TagKit.
- Reactive state, templating syntax, or components.

### 5.5 Positioning versus frameworks

Vue and similar frameworks own the DOM through components and reactive state. TagAction is the opposite: write plain HTML, add one script, and existing tags behave better. No new syntax, works without JS, tiny, no build. Closest neighbors are htmx and Alpine.js, but TagAction requires little or no attribute vocabulary.

## 6. TagCheck

CLI and CI tool, also usable by agents, that scans HTML and reports semantic and accessibility mistakes.

Checks include:

- img without alt
- form fields with no label, id, or aria-label
- skipped heading levels
- div or span used as an interactive control where a button or link belongs
- undocumented classes or attributes against the Tag family docs
- WCAG AA contrast failures in both color schemes
- horizontal overflow at phone widths

Build it by packaging TagBrush's debug mode logic and the existing eval harness. Output must be machine-readable (JSON) as well as human-readable, so an agent can write a page, run TagCheck, and fix the results without human involvement.

## 7. TagKit

### 7.1 Templates and snippets

- Page templates: landing, dashboard, docs, blog post, sign-up, admin table.
- Copy-paste snippet library: pricing tables, FAQ sections, card grids, docs layouts, plus the existing app patterns (sidebar layouts, stat tiles, page headers, search bars, hero).
- Every snippet is plain HTML, tested with TagBrush and TagAction, and passes TagCheck.

### 7.2 Build-time includes

A small CLI that stitches shared pieces (header, footer, nav) into finished static pages. Output is plain HTML that works everywhere, with no runtime JavaScript needed.

### 7.3 Platform themes

Selective. Only build for platforms where TagBrush genuinely benefits the platform's use case, especially AI-written documentation, AI output, and simple websites. Avoid platforms with their own component systems.

Priority order:

1. Pandoc HTML template — style any Markdown, Word, or AI-written document.
2. Jekyll remote theme for GitHub Pages — one config line to enable.
3. MkDocs or mdBook theme for technical documentation.
4. Hugo or Eleventy starter theme.
5. Chat-app stylesheet for rendered AI Markdown output (TagBrush roadmap chunk 19).
6. WordPress block theme, targeted for the official WordPress theme directory.

WordPress notes:

- Block theme with theme.json mapping TagBrush colors, typography, and spacing.
- Semantic templates using header, main, article, footer.
- Small compatibility stylesheet for core block wrappers (for example wp-block-group, wp-block-columns) so TagBrush itself does not change.
- TagAction loaded only where needed.
- Plan for WordPress theme directory review requirements from the start.

Possible later addition: TagIcons, a small SVG icon set matched to TagBrush in light and dark modes.

## 8. AI discovery and adoption

### 8.1 Discovery

- Publish real pages, demos, and posts that use the family by name, so it appears in public examples.
- One stable, versioned CDN URL per library (jsDelivr and unpkg).
- Get listed in agent documentation indexes such as Context7.
- Consider a small MCP server that serves snippets and docs to agents.

### 8.2 Reasons to choose it

- Each README opens with a plain "Use this when" sentence. Example: "Use TagBrush when you want plain semantic HTML to look good with no classes or build step."
- Publish benchmark results (less markup per word of content, no contrast failures) prominently.

### 8.3 Using it well

- A family-wide llms.txt explaining how all four repos fit together, linked from each repo's own llms.txt.
- Predictable conventions: consistent `data-tag*` attribute naming, consistent versioning, nothing for an agent to invent.
- Generated agent instruction files per repo (Claude Code skill, Cursor rule, AGENTS.md) from llms.txt, kept in sync by CI, as TagBrush already does.
- llms.txt itself is tested: every snippet and every documented attribute must exist and work.
- TagCheck provides the self-check loop for agents.

## 9. Testing and quality

- Unit and browser tests for every TagAction behavior, including keyboard and screen-reader semantics.
- No-JS test: every page remains usable with scripts disabled.
- Agent evaluations: fresh agents given only llms.txt build representative pages; TagCheck and the existing harness score them.
- Benchmarks against Tailwind and hand-written CSS, results committed to the repo.
- Size budget checks in CI.

## 10. Suggested build order

1. TagAction core with the 15 behaviors and MutationObserver.
2. TagCheck, packaged from existing debug mode and eval harness.
3. Family-wide llms.txt and cross-linking.
4. TagKit snippets and templates.
5. Pandoc and Jekyll themes.
6. TagKit build-time include CLI.
7. Remaining platform themes, WordPress last given review overhead.
