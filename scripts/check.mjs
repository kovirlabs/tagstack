// Keeps the family llms.txt true. Needs the four projects checked out in
// this folder (tagbrush/, tagaction/, tagcheck/, tagkit/), as the workspace
// and CI do. Run with `node scripts/check.mjs`.

import { existsSync, readFileSync } from 'node:fs';
import { check } from '../tagcheck/src/index.mjs';
import { CLASSES, ATTRIBUTES } from '../tagcheck/src/vocabulary.mjs';

const FAMILY_URL = 'https://kovirlabs.github.io/tagstack/llms.txt';
const guide = readFileSync('llms.txt', 'utf8');
const failures = [];
const expect = (ok, message) => { if (!ok) failures.push(message); };

// 1. The example page is clean.
const example = /```html\n([\s\S]*?)```/.exec(guide)?.[1];
expect(example, 'llms.txt has an ```html example page');
for (const p of check(example ?? '')) failures.push(`example page, line ${p.line}: ${p.rule}: ${p.message}`);

// 2. The classes and attributes listed are exactly the documented ones.
const conventions = guide.split('## Shared conventions')[1].split('##')[0];
const classLine = conventions.split('\n').find((line) => line.includes('documents exactly'));
const classes = [...classLine.matchAll(/`([a-z-]+)`/g)].map((m) => m[1]);
expect(JSON.stringify(classes.sort()) === JSON.stringify([...CLASSES].sort()), `classes in llms.txt (${classes}) differ from TagBrush's (${[...CLASSES]})`);
const words = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
expect(classLine.includes(`exactly ${words[CLASSES.size]} classes`), `llms.txt should say "exactly ${words[CLASSES.size]} classes"`);
const attributeLine = conventions.split('\n').find((line) => line.startsWith('- Family attributes'));
const attributes = [...attributeLine.matchAll(/`(data-[a-z-]+)(?:="([^"]+)")?`/g)];
expect(JSON.stringify(attributes.map((m) => m[1]).sort()) === JSON.stringify(Object.keys(ATTRIBUTES).sort()), 'family attributes in llms.txt differ from TagCheck\'s vocabulary');
for (const [, name, value] of attributes) if (value) expect(ATTRIBUTES[name]?.includes(value), `${name}="${value}" isn't a documented value`);

// 3. CDN lines match each library's own guide.
for (const [project, url] of guide.matchAll(/(tagbrush|tagaction)@\d+\/[\w.]+/g).map((m) => [m[1], m[0]])) {
  const own = readFileSync(`${project}/llms.txt`, 'utf8');
  expect(own.includes(url), `${url} is not the CDN line in ${project}/llms.txt`);
}

// 4. Every project with an llms.txt links back here, and is linked from here.
for (const project of ['tagbrush', 'tagaction', 'tagcheck', 'tagkit']) {
  const path = `${project}/llms.txt`;
  if (!existsSync(path)) {
    expect(guide.includes('**TagKit** (planned') || project !== 'tagkit', `${project} has no llms.txt`);
    continue;
  }
  expect(readFileSync(path, 'utf8').includes(FAMILY_URL), `${path} doesn't link to ${FAMILY_URL}`);
  expect(guide.includes(`kovirlabs/${project}`), `llms.txt doesn't link to ${project}`);
}

// 5. The family's own pages are clean.
for (const page of ['index.html']) {
  for (const p of check(readFileSync(page, 'utf8'))) failures.push(`${page}:${p.line}: ${p.rule}: ${p.message}`);
}

if (failures.length) {
  console.error(failures.map((f) => `✘ ${f}`).join('\n'));
  process.exit(1);
}
console.log('Family llms.txt checks passed');
