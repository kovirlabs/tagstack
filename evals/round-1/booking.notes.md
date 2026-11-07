# booking.html notes

## 1. TagCheck results

First run (`npx @kovirlabs/tagcheck booking.html --json --browser`): 0 errors, 0 warnings, no problems reported. Clean on run 1 of 1.

I also ran a small Playwright smoke test (CDN URLs routed to the local copies under web/): the total starts at 320, becomes 620 after picking Heron Lodge + breakfast + firewood, and "Add guest" adds rows (1 -> 3 after two clicks).

## 2. Guides, templates, snippets used

- Family guide: web/kovirlabs.github.io/tagstack/llms.txt (page skeleton, CDN URLs, workflow).
- TagBrush.css llms.txt: page bar, hgroup, `<article>` around a single form, fieldset/legend, radio/checkbox labels, `<small>` help text, `.grid` and `<figure>` for the gallery, `secondary` button.
- TagAction llms.txt: `<output for="...">` live sum (radio/checkbox count only while checked), `<template>` + `command="--clone"` with `hidden` button for "Add guest", link-around-image viewer for the gallery, textarea counter, form validation.
- TagCheck llms.txt: the run loop and rules.
- TagKit signup.html template: form structure (labels, help text, fieldsets) as a model. I did not copy a whole template since none is a booking page.
- I read the output behavior in tagaction.js to confirm how the sum is computed and displayed (plain number, no formatting).

## 3. Gaps, unclear points, and guesses

- Currency formatting of `<output>`: the guide doesn't say how the sum is displayed. It is a plain number, so I put "$" as text before the `<output>` and wrote the no-JS default ("320") inside it.
- Radio values must be the prices for `<output>` to sum them, so the submitted `cabin` value is a price (320/410/560) rather than a cabin name. The guide doesn't address this. I gave each cabin a distinct price so the server can still tell them apart; a cleaner pattern (e.g. a separate value for the sum vs. the submitted value) would help.
- Totals that multiply (nights x nightly rate) aren't possible, since `<output>` only sums. I priced cabins as a fixed two-night weekend stay to keep the total a simple sum.
- "Add guest" without JS: the guide says to mark the button `hidden`, so with JS off guests can only enter one extra name. I accepted that; the guide doesn't suggest a no-JS fallback for more rows.
- Labels in cloned rows: I wrapped each input in its `<label>` (instead of the guide's `aria-label` example) so there are no ids to renumber. I guessed that's fine; TagCheck agreed.
- Gallery layout: no snippet covers a photo gallery. I guessed `<div class="grid">` of `<figure>`s with `<a href="...-large.jpg"><img></a>` (the guide's viewer pattern). The image files are placeholder paths (images/*.jpg); no real photos were available.
- No date-range or availability guidance exists; I used a single `type="date"` "Arrival Friday" field with `step="7"` from a Friday, and help text.
