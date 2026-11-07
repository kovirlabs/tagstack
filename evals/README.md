# Family agent evaluation

How well does an AI coding agent do with the whole Tag family when all it has is the [family guide](../llms.txt) and the guides it links to?

[TagBrush.css's evaluation](https://github.com/kovirlabs/tagbrush/tree/main/evals) asks whether pages look right. This one asks whether the four tools work together: the agent has to find the right TagAction behavior for what the user asked for, write it in plain HTML, keep the page usable without JavaScript, and use TagCheck to fix its own mistakes.

## How a round runs

1. Build a workspace for each request: `node evals/workspace.mjs <folder>`. It holds the published guides, TagKit's templates and snippets, and the CDN files, laid out by URL (`web/<host>/<path>`), plus TagCheck with Playwright. Everything comes from the npm packages, which are what agents get from the CDN.
2. Give a fresh agent its workspace and one request from [`requests.json`](requests.json), with the instructions below. The request says what the user wants, in the user's words; it never names an element, attribute, or TagAction behavior.
3. Save its page and notes in `round-N/` as `<id>.html` and `<id>.notes.md`.
4. `npm test` scores every page (see [`eval.spec.mjs`](eval.spec.mjs)).

The instructions, the same for every agent:

> Use the Tag family of tools. Start by reading its guide (web/kovirlabs.github.io/tagstack/llms.txt), then the guides it links to for the tools you use. You have no internet: any https:// URL in the guides is available as web/&lt;host&gt;/&lt;path&gt;. Don't read anything outside the workspace or inside node_modules. Write one self-contained HTML page that loads the tools from the CDN URLs the guides give, with realistic content, following the guides. Check it with TagCheck as its guide describes (with `--json` and `--browser`) and fix what it reports until it's clean. Then write notes: what TagCheck reported on the first run and how many runs it took; which guides, templates, or snippets you used; and anything the guides didn't cover or where you had to guess.

## What is scored

Every page, against the published packages:

- **TagCheck is clean**: no errors and no warnings, including WCAG AA contrast in light and dark mode and no sideways scrolling on phones (`--browser`).
- **No hand-written JavaScript**: the only script is TagAction from the CDN, with no `on…` attributes or `javascript:` links.
- **Works without JavaScript**: every visible button submits a form, uses the browser's own `commandfor`/`popovertarget`, or is a TagAction dropdown button (whose list is shown). Anything else must carry `hidden` until TagAction shows it.
- **Each behavior the request implies works**, the way the guides document it:

| Behavior | Checked by |
|---|---|
| `dropdown` | The menu button opens and Escape closes its list (or a native popover opens). |
| `filter` | Typing in a `type="search"` box with `aria-controls` hides rows of the table or list. |
| `sort` | Clicking a column header's sort button sets `aria-sort`. |
| `dialog` | A `command="show-modal"` button opens its `<dialog>`. |
| `status-badges` | `<mark data-tone>` in two or more tones. |
| `password` | The Show button reveals the password. |
| `counter` | A `<textarea maxlength>` shows a count that changes as you type. |
| `files` | A file input; with `multiple`, the chosen names are listed. |
| `validation` | Submitting the empty form marks a field `aria-invalid` and shows a message under it. |
| `toc` | `<nav data-tag-toc>` is filled with links. |
| `anchors` | Headings get "#" links. |
| `copy` | Every `<pre>` gets a Copy button. |
| `accordion` | Opening one `<details name>` closes its neighbor. |
| `abbr` | `<abbr title>` shows its title on tap. |
| `output` | `<output for>` changes when a field it reads changes. |
| `clone` | A `command="--clone"` button adds a row from a `<template>`. |
| `zoom` | Clicking a linked photo opens TagAction's viewer. |
| `local-time` | A `<time>` with a time and timezone is rewritten in the reader's timezone. |
| `relative-time` | `<time data-tag-time="relative">` reads like "3 days ago". |
| `remember` | A `<details>` under `data-tag-remember` keeps its state across a reload. |
| `chat` | `data-density="compact"` and a `<details data-reasoning>`: with the scoped build, inside a `class="tagbrush"` message; on a page that is only a conversation, `data-density` on `<html>`. |

The checks were calibrated on known-good pages built from the guides' own examples (each check passes) and on a broken page (an `onclick`, a visible "Add guest" button without `hidden`, and an invented class each fail).

A check that fails for a reason outside the agent's control is listed in `KNOWN` in the spec, with the cause and the fix, and is expected to fail. The page stays as the agent wrote it.

## Findings

### Round 1 (November 2026)

Six agents, one page each, against TagBrush.css 1.2.0, TagAction 0.1.0, TagCheck 0.1.1, and TagKit 0.1.0. Each took one to two minutes.

| Page | TagCheck, first run | Behaviors | Started from |
|---|---|---|---|
| `orders-admin` | clean | 5 of 5 | TagKit dashboard template; user menu, data table, confirm dialog snippets |
| `signup` | clean | 4 of 4 | TagKit sign-up template |
| `docs` | clean | 5 of 5 | TagKit docs template, FAQ snippet |
| `booking` | clean | 3 of 3 | its own HTML (no template fits), sign-up template as a model |
| `release-notes` | clean | 3 of 4 | blog post template's figures |
| `chat` | clean | 2 of 2 | its own HTML, callout snippet |

Every page passed TagCheck on the first run, had no hand-written JavaScript, and kept every visible control working without JavaScript. Every agent found the right TagAction behavior for what the user asked, in plain words, from the guides alone. The TagCheck loop was never needed, which says more about the templates than about the loop: four of six agents started from TagKit.

Fixed:

- **Photos in TagKit's blog post template never opened in the viewer** (release-notes `zoom`). The template linked a photo to a picsum.photos address with no file ending, and TagAction only treats links to image files as photos. The agent copied it faithfully. TagKit's link now ends in `.jpg` and a test clicks every linked photo in every template and snippet (kovirlabs/tagkit b95a33a); TagAction's guide lists the file endings (kovirlabs/tagaction 22ed542).
- **TagCheck's browser checks didn't say whether they ran**, and served only the main TagBrush.css build offline, so a chat page using the scoped build would have been measured unstyled. Two agents noticed they couldn't tell. TagCheck now serves every build offline, reports a stylesheet or script that doesn't load (`not-loaded`), and says when the browser checks ran (kovirlabs/tagcheck 550e8e5, unreleased).
- **Which stylesheet a chat transcript page uses**: the guide only described the scoped build inside a chat app. The agent chose the full stylesheet with `data-density="compact"` on `<html>`, which is right; the TagBrush.css guide now says so (kovirlabs/tagbrush#40). The check was too strict and now accepts both.

Open, for a decision before round 2:

- **`<output>` can only add.** The booking agent couldn't multiply nights by a nightly rate, had to make the radio buttons' submitted values prices, and put the "$" outside the output. Whether TagAction should do more (a product, a format) is a scope question for the spec.
- **An empty table of contents without JavaScript.** `<nav data-tag-toc>` is empty until TagAction fills it, so with JavaScript off the docs page (and TagKit's docs template) has an empty sidebar, and screen readers announce an empty "On this page" navigation.
- **Where validation messages go** for a required radio group in a `<fieldset>` or a checkbox inside its `<label>`, and how a `maxlength` counter sits beside a `<small>` help text. The signup agent guessed; the TagAction guide could say.
- **A confirm dialog on every table row.** The orders agent wrote one `<dialog>` per row, which works without script but repeats markup. A TagKit snippet could show the pattern.
- **Smaller gaps** the agents noted: no photo gallery snippet, no chat message markup (who said what), a relative time next to an absolute one, citation numbering across several answers, and whether a reference table should opt out of sorting.

## Limits

- One page per request and round, so a single agent's choices weigh heavily.
- The agents run in this workspace's environment, so they may see the project instructions (`CLAUDE.md`) that the harness loads. Those describe the family's rules, not its attributes or patterns.
- Behavior checks test what the guides document. An agent that meets a request some other way (its own script, say) fails the check, which is intended: the guides should lead it to the documented way.
