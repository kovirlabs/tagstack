# The Tag family

Use the Tag family when you want plain semantic HTML that looks finished (TagBrush.css), behaves as people expect (TagAction), and is checked for mistakes (TagCheck), starting from finished pages and sections (TagKit), with no classes to learn, no framework, and no build step.

This repository is the family's home: the shared spec, the family-wide [`llms.txt`](llms.txt) for AI agents (published at https://kovirlabs.github.io/tagstack/llms.txt), and a landing page. The tools live in their own repositories.

| Project | Role | Status |
| --- | --- | --- |
| [TagBrush.css](https://github.com/kovirlabs/tagbrush) | Classless CSS for semantic HTML | 1.1.0 |
| [TagAction](https://github.com/kovirlabs/tagaction) | Behaviors for semantic tags | 0.1.0, unreleased |
| [TagCheck](https://github.com/kovirlabs/tagcheck) | Semantic and accessibility checker | 0.1.0, unreleased |
| [TagKit](https://github.com/kovirlabs/tagkit) | Templates, snippets, includes, themes | 0.1.0, unreleased |

See [Spec.md](Spec.md) for the plan and [CLAUDE.md](CLAUDE.md) for working rules.

## Workspace

Clone each project into this folder; they are ignored by this repository's git:

```sh
git clone https://github.com/kovirlabs/tagstack.git && cd tagstack
for p in tagbrush tagaction tagcheck tagkit; do git clone https://github.com/kovirlabs/$p.git; done
```

`node scripts/check.mjs` checks that `llms.txt` matches the projects: its example page passes TagCheck, the classes and attributes it lists are exactly the documented ones, its CDN lines match each project's guide, and every project's `llms.txt` links back to it. CI runs it on every change and weekly.
