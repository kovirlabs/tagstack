# orders-admin notes

## 1. TagCheck results
- First run (`npx @kovirlabs/tagcheck orders-admin.html --json --browser`): 0 errors, 0 warnings. No rule ids reported.
- Runs to get clean: 1.

## 2. Guides, templates, snippets used
- Family guide (kovirlabs.github.io/tagstack/llms.txt), TagBrush.css llms.txt, TagAction llms.txt, TagCheck llms.txt, TagKit llms.txt.
- TagKit template `templates/dashboard.html` as the base (full-height sidebar `<aside>` before `<header>`, top bar with account dropdown, title row with action).
- TagKit snippets: `user-menu.html` (aria-expanded/aria-controls dropdown with Profile, Settings, Sign out), `data-table.html` (hidden `type="search"` filter with aria-controls, `<time datetime>` and `<data value>` sort values, `<mark data-tone>` badges), `confirm-dialog.html` (commandfor/command="show-modal" dialog with a POST form), `sidebar-layout.html`.
- `templates/admin-table.html` for the unsortable actions column (`<th data-tagaction="off">` with a `visually-hidden` label).
- TagBrush theming: `--color-primary` in a `<style>` variables block.

## 3. Gaps and guesses
- Refund confirmation per row: no guide shows a confirm dialog repeated across table rows. I guessed one `<dialog id="refund-NNNN">` per refundable order, placed after the table inside `<main>` (not inside the cells), each with a POST form to that order's refund URL, so it works without JavaScript and needs no page script. A single shared dialog would need script to know which order was clicked.
- "Sort by any column": I made the five data columns sortable and turned the Refund/actions column off with `data-tagaction="off"`, since sorting a column of buttons is meaningless.
- Refund buttons: visible text "Refund" plus `aria-label="Refund order #NNNN"` so screen-reader users can tell them apart. The guides don't say whether aria-label or visually-hidden text is preferred here.
- Refunded/failed orders: guessed to show `<small>Not refundable</small>` instead of a button (avoided a disabled button since the guides don't say how disabled text is treated in contrast checks).
- Status tone mapping is my guess: Paid = success, Pending = warning, Ready for pickup = info, Delivered = neutral, Failed and Refunded = error.
- Filter box without JavaScript: the template keeps it `hidden` with no server fallback; I followed that rather than wrapping it in a GET form (the search-bar snippet would have been the alternative).
- Brand color #9a3412 (warm brown/orange) chosen for a bakery; the guide says text on buttons stays readable automatically, and TagCheck's contrast check passed.
