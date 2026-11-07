# docs.html notes

## 1. TagCheck results

- First run (`npx @kovirlabs/tagcheck docs.html --json --browser`): 0 errors, 0 warnings. No rule ids reported.
- Runs needed to get clean: 1.

## 2. Guides, templates, and snippets used

- Family guide: web/kovirlabs.github.io/tagstack/llms.txt
- TagBrush.css guide (docs page with a table of contents, callout aside in article, figure-wrapped table, hgroup, breadcrumb, pagination, abbr, kbd).
- TagAction guide (`<nav data-tag-toc>`, heading "#" anchors on h2/h3 with ids, Copy buttons on `<pre>`, sortable table, `<details name>` accordion, `data-tag-remember`, `<abbr>` tap-to-show).
- TagCheck guide (the run loop and rules).
- TagKit guide, plus the **Docs page template** (templates/docs.html) as the starting skeleton and the **FAQ snippet** (snippets/faq.html) for the accordion.

## 3. Gaps, unclear spots, and guesses

- **TOC with JavaScript off.** The template's `<nav data-tag-toc>` is empty until TagAction fills it, so with JS off the aside is an empty nav. The family rule says pages must work without JS; I followed the template anyway (the article still reads fine). Unclear whether I should have written the links by hand (TagBrush's static TOC example) and whether TagAction then replaces or leaves a non-empty `data-tag-toc` nav.
- **FAQ heading placement.** The FAQ snippet puts its `<h2>` inside `<section data-tag-remember>`. I moved the `<h2 id="faq">` just before the section so it sits at the same level as the other article headings; I guessed either works for the TOC (TOC takes h2/h3 anywhere in `<main>`).
- **`data-tag-remember`.** The user only asked for "one open at a time"; the snippet also remembers the open answer across visits. I kept it since it came with the snippet; the guide doesn't say whether that's recommended by default.
- **Options table sorting.** Every `<table>` with a thead and 2+ rows becomes sortable automatically. Sorting an options reference isn't very useful, but harmless, so I left it on. The guide doesn't say whether to turn it off for reference tables (`data-tagaction="off"` on the table or each `<th>`).
- **Repeated abbreviations.** I gave every `<abbr>` a `title`, including the second "CI". The guides don't say whether only the first use needs one. I did not wrap "CI" inside the options table description in `<abbr>`.
- **Mixed header nav.** The top bar mixes page links with one in-page link (`#options`). The TagAction guide says scroll-tracking `aria-current="true"` only applies when all links in a nav point to sections, so I assumed the header nav is unaffected and only the TOC tracks the scroll.
- **Pagination links** point to `docs.html` / `configure.html`, which don't exist in this workspace; they're realistic placeholders like the template's.
