# signup.html notes

## 1. TagCheck results

- First run (`npx @kovirlabs/tagcheck signup.html --json --browser`): 0 errors, 0 warnings. No rule ids reported.
- Runs to clean: 1.

## 2. Guides, templates, snippets used

- Family guide: web/kovirlabs.github.io/tagstack/llms.txt
- TagBrush.css guide: web/kovirlabs.github.io/tagbrush/llms.txt (one-form page inside `<article>` in `<main>`, `<small>` help text, `<fieldset>`/`<legend>`, switch checkbox)
- TagAction guide: web/raw.githubusercontent.com/kovirlabs/tagaction/main/llms.txt (form validation messages under fields, password Show/Hide, textarea `maxlength` counter, file input drag and drop)
- TagAction README (web/github.com/kovirlabs/tagaction/README.md), skimmed for file input details
- TagCheck guide: web/raw.githubusercontent.com/kovirlabs/tagcheck/main/llms.txt
- TagKit template: templates/signup.html (base structure, adapted), and snippets/contact-form.html for comparison

## 3. Gaps, unclear points, and guesses

- Error messages for a radio group and a wrapped checkbox: the guide says a `<small>` "right after the field" is used for the message, but for radios inside a `<fieldset>` and a checkbox wrapped in its `<label>` there is no obvious "right after the field" spot. I guessed TagAction creates/places the message itself and added no `<small>` there. Not sure where the message for the required "Experience level" radios ends up (after the first radio? after the fieldset?).
- Textarea with both a `maxlength` counter and a `<small>` help text: not stated whether the counter goes into the `<small>`, replaces it, or is added beside it. I kept a `<small>` with help text ("Up to 160 characters...") and assumed the counter is added separately.
- Drag and drop on a single-file input: the guide says files can be dropped onto "any file input or its `<label>`", and file names are listed only for `multiple`. For a single photo I left out `multiple` and relied on the browser showing the chosen file name. No guidance on an image preview or on validating file type/size with a visible message; I used `accept` only. A visible drop zone (larger target) isn't described, so the drop target is just the normal input and label.
- Experience level: the TagKit template uses a `<select>`; I used required radio buttons with descriptions instead, since a select with a placeholder option needs an empty-value first option, which the guides don't show.
- Showing server-side errors (e.g. "That email is already registered") on first load: TagBrush documents `aria-invalid="true"` plus a red `<small>`, but nothing says whether TagAction clears that `aria-invalid` and restores help text once the user edits the field. I didn't include a pre-rendered server error.
- The `--browser` run printed no indication that the browser checks actually ran (no separate section in the JSON); I assumed they did since Playwright is in the workspace and exit code was 0.
