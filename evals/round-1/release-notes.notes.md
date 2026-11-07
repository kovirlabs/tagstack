# Notes: Pebble release notes page

## 1. TagCheck results

- First run (`npx @kovirlabs/tagcheck release-notes.html --json --browser`): 0 errors, 0 warnings. No rule ids reported.
- Runs to get clean: 1.

## 2. Guides, templates, and snippets used

- Family guide (web/kovirlabs.github.io/tagstack/llms.txt): page skeleton, CDN URLs for TagBrush.css and TagAction.
- TagAction guide: `<time datetime>` with a timezone (shown in reader's timezone), `data-tag-time="relative"` ("3 days ago"), `data-tag-remember` on a `<section>` containing `<details id>` (open/closed state remembered), image links in `<figure>` opening in the viewer, `<h2>/<h3 id>` anchor links, `<abbr>`, `aria-current` in nav.
- TagBrush.css guide: header nav with `aria-current="page"`, single `<article>` in `<main>` for reading width, `<hgroup>` with a label paragraph before the heading, `<mark data-tone="success">` badge, `<aside>` callout inside an article, `<kbd>`.
- TagKit blog-post template: the `<figure><a href="large"><img src="small" width height></a><figcaption>` pattern for enlargeable screenshots, and picsum.photos placeholder images.
- TagCheck guide: the check loop.

## 3. Gaps, unclear points, and guesses

- Relative time plus absolute local time: the guide shows `data-tag-time="relative"` replacing the text with "3 days ago" and putting the full date in `title`. The request wanted both the local date/time and "how long ago". I guessed two `<time>` elements with the same `datetime`: one plain (localized) and one relative in parentheses. Not documented whether that's the intended pattern.
- No-JS fallback text for a relative time: unclear what the source text should be. I used the plain date ("November 4, 2026") so it reads sensibly without JavaScript.
- Fallback text for localized `<time>`: I wrote the UTC time with "UTC" in the text, assuming TagAction replaces the whole text content. The guide doesn't say what format TagAction outputs (date only vs. date and time) or whether it keeps a date-only style when the source text has no time.
- Time inside `<summary>`: guessed it is fine to put a `<time>` inside a `<details>` summary; not mentioned either way.
- `data-tag-remember` default state: the guide doesn't say what happens on a first visit; I left all older releases closed in the HTML, assuming that's the default until the reader changes it.
- Screenshots: no real Pebble screenshots exist, so I used picsum.photos placeholders (as the blog-post template does) with descriptive alt text. Guessed that `loading="lazy"` on images inside closed `<details>` is fine.
- Images inside closed `<details>`: not documented whether the image viewer works for links inside `<details>` opened later; assumed yes.
- Subresource Integrity: a tooling hook suggested adding `integrity` to the script tag, but the guides pin to a floating major version (`tagaction@0`), which makes SRI hashes impossible to keep valid. Followed the guides and left it out.
- `--browser` with no internet: TagCheck reported clean, but I couldn't confirm whether the contrast/overflow checks rendered the CDN stylesheet offline or fell back silently. The report didn't say.
