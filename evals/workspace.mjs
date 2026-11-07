// Builds the folder an evaluation agent works in: the published guides and
// TagKit files, laid out by URL (web/<host>/<path>), and the published
// packages, so TagCheck runs offline and previews use the released CSS and JS.
//
//   node evals/workspace.mjs <folder>
//
// Everything comes from the npm packages in node_modules (what agents get from
// the CDN), except the family guide, which GitHub Pages serves from this repo.

import { cpSync, existsSync, mkdirSync, readFileSync, symlinkSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const target = process.argv[2];
if (!target) {
  console.error('usage: node evals/workspace.mjs <folder>');
  process.exit(2);
}
const root = resolve(import.meta.dirname, '..');
const modules = join(root, 'node_modules');
const out = resolve(target);
if (existsSync(join(out, 'web'))) {
  console.error(`${out} already has a workspace`);
  process.exit(2);
}

const copy = (from, url) => {
  const to = join(out, 'web', url.replace(/^https:\/\//, '').replace(/#.*$/, ''));
  mkdirSync(dirname(to), { recursive: true });
  cpSync(from, to, { recursive: true });
};

const pkg = (name) => join(modules, name);
copy(join(root, 'llms.txt'), 'https://kovirlabs.github.io/tagstack/llms.txt');
copy(join(pkg('tagbrush'), 'llms.txt'), 'https://kovirlabs.github.io/tagbrush/llms.txt');
copy(join(pkg('tagaction'), 'llms.txt'), 'https://raw.githubusercontent.com/kovirlabs/tagaction/main/llms.txt');
copy(join(pkg('@kovirlabs/tagcheck'), 'llms.txt'), 'https://raw.githubusercontent.com/kovirlabs/tagcheck/main/llms.txt');
copy(join(pkg('@kovirlabs/tagkit'), 'llms.txt'), 'https://raw.githubusercontent.com/kovirlabs/tagkit/main/llms.txt');
for (const part of ['templates', 'snippets', 'snippets.json', 'themes/pandoc/template.html']) {
  copy(join(pkg('@kovirlabs/tagkit'), part), `https://raw.githubusercontent.com/kovirlabs/tagkit/main/${part}`);
}
for (const [name, repo] of [['tagbrush', 'tagbrush'], ['tagaction', 'tagaction'], ['@kovirlabs/tagcheck', 'tagcheck'], ['@kovirlabs/tagkit', 'tagkit']]) {
  copy(join(pkg(name), 'README.md'), `https://github.com/kovirlabs/${repo}/README.md`);
}
for (const file of ['tagbrush.css', 'tagbrush.min.css', 'tagbrush.scoped.css', 'tagbrush.scoped.min.css']) {
  copy(join(pkg('tagbrush'), file), `https://cdn.jsdelivr.net/npm/tagbrush@1/${file}`);
}
for (const file of ['tagaction.js', 'tagaction.min.js']) {
  copy(join(pkg('tagaction'), file), `https://cdn.jsdelivr.net/npm/tagaction@0/${file}`);
}

// TagCheck (with Playwright for --browser) runs from the shared node_modules.
symlinkSync(modules, join(out, 'node_modules'), 'dir');
writeFileSync(join(out, 'package.json'), JSON.stringify({ private: true }, null, 2) + '\n');

const versions = Object.fromEntries(['tagbrush', 'tagaction', '@kovirlabs/tagcheck', '@kovirlabs/tagkit']
  .map((name) => [name, JSON.parse(readFileSync(join(pkg(name), 'package.json'), 'utf8')).version]));
writeFileSync(join(out, 'versions.json'), JSON.stringify(versions, null, 2) + '\n');
console.log(`workspace ready in ${out}`, versions);
