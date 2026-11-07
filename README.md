# The Tag family

Use the Tag family when you want plain semantic HTML that looks finished (TagBrush.css), behaves as people expect (TagAction), and is checked for mistakes (TagCheck), starting from finished pages and sections (TagKit), with no classes to learn, no framework, and no build step.

This repository is the family's home: the shared spec, the family-wide [`llms.txt`](llms.txt) for AI agents (published at https://kovirlabs.github.io/tagstack/llms.txt), the family site, and the brand. The tools live in their own repositories.

| Project | Role | Status |
| --- | --- | --- |
| [TagBrush.css](https://github.com/kovirlabs/tagbrush) | Classless CSS for semantic HTML | 1.2.0 |
| [TagAction](https://github.com/kovirlabs/tagaction) | Behaviors for semantic tags | 0.1.0 |
| [TagCheck](https://github.com/kovirlabs/tagcheck) | Semantic and accessibility checker | 0.1.1 |
| [TagKit](https://github.com/kovirlabs/tagkit) | Templates, snippets, includes, themes | 0.1.0 |
| [TagKit for Jekyll](https://github.com/kovirlabs/tagkit-jekyll) | GitHub Pages remote theme (part of TagKit) | 0.1.0, unreleased |
| [TagKit for WordPress](https://github.com/kovirlabs/tagkit-wordpress) | WordPress block theme (part of TagKit) | 0.1.0, unreleased |

See [Spec.md](Spec.md) for the plan, [CLAUDE.md](CLAUDE.md) for working rules, and [RELEASING.md](RELEASING.md) for publishing to npm.

## Workspace

Clone each project into this folder; they are ignored by this repository's git:

```sh
git clone https://github.com/kovirlabs/tagstack.git && cd tagstack
for p in tagbrush tagaction tagcheck tagkit tagkit-jekyll tagkit-wordpress; do git clone https://github.com/kovirlabs/$p.git; done
```

`node scripts/check.mjs` checks that `llms.txt` matches the projects: its example page passes TagCheck, the classes and attributes it lists are exactly the documented ones, its CDN lines match each project's guide, and every project's `llms.txt` links back to it. CI runs it on every change and weekly.

[`evals/`](evals/) is the family agent evaluation: fresh agents with only the family guide build pages from plain requests, and `npm test` scores them (TagCheck clean, no hand-written JavaScript, usable without JavaScript, and the requested behaviors working). Its README has the findings.

## Site and brand

[`index.html`](index.html) is the family site, https://kovirlabs.github.io/tagstack/. [`brand.css`](brand.css) and [`mark.svg`](mark.svg) are the family brand: a TagBrush.css theme (one violet, `#7c3aed`) and a family bar that every family site links from https://kovirlabs.github.io/tagstack/brand.css, so a change here shows up on every site. [`brand.html`](brand.html) has the markup to copy. `npm test` checks both pages with TagCheck (`--browser`), and that brand.css sets only TagBrush.css variables and styles `data-brand` elements.
