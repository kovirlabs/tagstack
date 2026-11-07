# chat.html notes

## 1. TagCheck results

- First run (`npx @kovirlabs/tagcheck chat.html --json --browser`): 0 errors, 0 warnings. No rules reported.
- Runs to get clean: 1.
- I also took a 360px and 1280px screenshot with Playwright (CDN URLs routed to the local `web/` copies) to check the layout. Code and the table scroll inside themselves, and the page does not scroll sideways.

## 2. Guides, templates, snippets used

- Family guide (`web/kovirlabs.github.io/tagstack/llms.txt`): the page skeleton and CDN URLs.
- TagBrush.css guide: the "Chat and AI output" section (`data-density="compact"`, `<details data-reasoning>`, `<sup><a href="#source-1">` citations, a `<footer><h2>Sources</h2><ol>` at the end of the answer), the "`<main>` with a single `<article>` is kept at reading width" rule for the narrow column, and `<aside>` inside an article for the callout.
- TagBrush README "Chat apps and AI output" section, for the notes on math.
- TagAction guide: the automatic Copy button on `<pre>`, table sorting with `<data value>`, the textarea counter from `maxlength`, and form validation.
- TagCheck guide: the check loop.
- TagKit `snippets/callout.html`: the `<aside><strong>Note:</strong> …</aside>` pattern. TagKit has no chat template, so I didn't use one.

## 3. Gaps, unclear points, guesses

- **Scoped build vs. full stylesheet.** The guides say chat output should use `tagbrush.scoped.min.css` and wrap each message in `<div class="tagbrush" data-density="compact">`. That fits Markdown inside an existing chat app. This page is the whole app, though, and the scoped build has no page layout, so I would have had to write my own CSS for the narrow column and the header. I guessed the full `tagbrush.min.css` was right, with `data-density="compact"` on `<html>` (the guide allows that) and `<main><article>` for the reading-width column. A short "whole-page chat transcript" recipe would settle this.
- **Message structure.** No guide says how to mark up a single message or tell the sender apart: user vs. assistant, right-aligned bubbles, avatars. I guessed `<section aria-label="Message from you|Atlas">` with a bold sender name as the first paragraph. The messages don't look like bubbles; they are separated only by spacing. I avoided putting the messages in `<article>`s inside a `<section>`, because TagBrush would turn those into a card grid.
- **Math.** The guides mention KaTeX and MathJax, but they "still need their own stylesheets", and no local copy or CDN URL for them is given. I used native MathML (`<math display="block">`). The README says block MathML scrolls only in Chromium. The formula is short, so it fits at 360px.
- **Citation numbering across messages.** The guide shows a sources footer for one answer. For the second answer I continued the numbers with `<ol start="3">` and `id="source-3"` so the ids stay unique on the page. This is a guess.
- **Callout tone.** I used a plain `<aside>` with "Note:" rather than `data-tone="info"`. The guide doesn't say which is the default note look.
- **Composer.** No guide covers a chat input box. I used a plain post form with a labeled `<textarea maxlength="4000">` (TagAction adds the counter) and a Send button. Its action URL is a placeholder.
