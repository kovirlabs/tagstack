import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { checkFiles } from '@kovirlabs/tagcheck';

// The family site (index.html) and the brand page every family site reuses.
const PAGES = ['index.html', 'brand.html'];

test('the family pages pass TagCheck, with contrast and phone width (--browser)', async () => {
  test.setTimeout(120000);
  const report = await checkFiles(PAGES, { browser: true });
  expect(report.files.flatMap((f) => f.problems.map((p) => `${f.file}: ${p.rule}: ${p.message}`))).toEqual([]);
});

test('the family bar on brand.html, which other sites copy, matches the one on index.html', () => {
  const bar = (html) => /<nav aria-label="Tag family" data-brand="bar">[\s\S]*?<\/nav>/.exec(html)?.[0];
  const unescape = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
  const copy = unescape(/<pre><code>(&lt;nav aria-label="Tag family"[\s\S]*?)<\/code><\/pre>/.exec(readFileSync('brand.html', 'utf8'))[1]);
  const live = bar(readFileSync('index.html', 'utf8'))
    .replace(' aria-current="page"', '')
    .replace('src="mark.svg"', 'src="https://kovirlabs.github.io/tagstack/mark.svg"')
    .replace('kovirlabs/tagstack"', 'kovirlabs/REPO"');
  const words = (s) => s.replace(/\s+/g, ' ').trim();
  expect(words(copy)).toBe(words(live));
});

test('brand.css only sets TagBrush.css variables and styles data-brand elements', () => {
  const css = readFileSync('brand.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const selectors = [...css.matchAll(/([^{}]+)\{/g)].flatMap((m) => m[1].split(',').map((s) => s.trim()));
  for (const s of selectors) expect(s).toMatch(/^:root:not\(\[data-brand="chrome"\]\)$|^\[data-brand="(bar|footer)"\]/);
});
