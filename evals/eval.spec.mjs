// Scores the pages agents wrote with only the family guide (see README.md).
// Each page must pass TagCheck, contain no hand-written JavaScript, keep every
// visible control working with JavaScript off, and do what its request asked
// for, using the TagAction and TagBrush.css features the guides document.

import { test, expect } from '@playwright/test';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { checkFiles } from '@kovirlabs/tagcheck';

const ROUNDS = readdirSync('evals').filter((d) => /^round-\d+$/.test(d)).sort();
const REQUESTS = JSON.parse(readFileSync('evals/requests.json', 'utf8'));
// Checks a kept page fails for a reason outside the agent's control, with the
// cause and the fix. Playwright reports it if one starts passing.
const KNOWN = {
  'round-1/release-notes/zoom': 'copied TagKit\'s blog post template, whose photo link had no file ending, so TagAction never opened its viewer (fixed in kovirlabs/tagkit b95a33a)',
};

const PAGES = ROUNDS.flatMap((round) => REQUESTS
  .filter(({ id }) => existsSync(`evals/${round}/${id}.html`))
  .map((request) => ({ ...request, round, file: `evals/${round}/${request.id}.html` })));

// The CDN links are served from the published packages; nothing else loads.
const CDN = [
  [/cdn\.jsdelivr\.net\/npm\/tagbrush@1\/(tagbrush(?:\.scoped)?(?:\.min)?\.css)$/, 'tagbrush', 'text/css'],
  [/cdn\.jsdelivr\.net\/npm\/tagaction@0\/(tagaction(?:\.min)?\.js)$/, 'tagaction', 'text/javascript'],
];
async function open(page, file, { javaScriptEnabled = true } = {}) {
  await page.route(/^https?:/, (route) => {
    for (const [pattern, pkg, contentType] of CDN) {
      const match = pattern.exec(route.request().url());
      if (match) return route.fulfill({ path: join('node_modules', pkg, match[1]), contentType });
    }
    return route.abort();
  });
  await page.goto(pathToFileURL(file).href);
  if (javaScriptEnabled) await page.waitForFunction(() => window.TagAction !== undefined);
}

// The page's text for each element matching a selector, with JavaScript off.
async function textsWithoutJs(browser, file, selector) {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await open(page, file, { javaScriptEnabled: false });
  const texts = await page.locator(selector).allTextContents();
  await context.close();
  return texts;
}

const BEHAVIORS = {
  // An account menu that drops down: TagAction's aria-expanded button, or a native popover.
  async dropdown(page) {
    const toggle = page.locator('button[aria-expanded][aria-controls]').first();
    if (await toggle.count()) {
      const menu = page.locator(`[id="${await toggle.getAttribute('aria-controls')}"]`);
      await expect(menu).toBeHidden();
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      await expect(menu).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(menu).toBeHidden();
      return;
    }
    const opener = page.locator('button[popovertarget]').first();
    expect(await opener.count(), 'a button with aria-expanded and aria-controls, or popovertarget').toBe(1);
    const popover = page.locator(`[id="${await opener.getAttribute('popovertarget')}"]`);
    await opener.click();
    await expect(popover).toBeVisible();
  },

  // A search box that filters a table or list as you type.
  async filter(page) {
    const box = page.locator('input[type="search"][aria-controls]').first();
    expect(await box.count(), '<input type="search" aria-controls="…">').toBe(1);
    const target = page.locator(`[id="${await box.getAttribute('aria-controls')}"]`);
    const rows = target.locator(':scope > tbody > tr, :scope > li');
    const count = await rows.count();
    expect(count, 'rows to filter').toBeGreaterThan(1);
    const word = (await rows.last().innerText()).split(/\s+/).find((w) => w.length > 3);
    await box.fill(word);
    await expect(rows.last()).toBeVisible();
    const visible = await rows.evaluateAll((all) => all.filter((r) => r.checkVisibility()).length);
    expect(visible, `rows still shown after typing "${word}"`).toBeLessThan(count);
  },

  // Clicking a column header sorts the table.
  async sort(page) {
    const table = page.locator('table:has(thead):has(tbody tr + tr)').first();
    expect(await table.count(), 'a <table> with <thead> and two or more rows').toBe(1);
    const header = table.locator('thead th:has([data-tag="sort"])').first();
    expect(await header.count(), 'a header TagAction made sortable').toBe(1);
    await header.locator('[data-tag="sort"]').click();
    await expect(header).toHaveAttribute('aria-sort', /ascending|descending/);
  },

  // A button opens a confirmation <dialog> with the browser's own command attributes.
  async dialog(page) {
    const button = page.locator('button[command="show-modal"][commandfor]').first();
    expect(await button.count(), '<button commandfor="…" command="show-modal">').toBe(1);
    await button.click();
    await expect(page.locator(`dialog[id="${await button.getAttribute('commandfor')}"]`)).toHaveAttribute('open', '');
  },

  // Colored status labels: TagBrush.css badges in more than one tone.
  async 'status-badges'(page) {
    const tones = await page.locator('mark[data-tone]').evaluateAll((marks) => new Set(marks.map((m) => m.dataset.tone)).size);
    expect(tones, '<mark data-tone="…"> in two or more tones').toBeGreaterThan(1);
  },

  async password(page) {
    const field = page.locator('[data-tag="password"] input').first();
    const toggle = page.locator('[data-tag="password"] button').first();
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(field).toHaveAttribute('type', 'text');
  },

  async counter(page) {
    const area = page.locator('textarea[maxlength]').first();
    expect(await area.count(), '<textarea maxlength="…">').toBe(1);
    const count = page.locator('[data-tag="count"]').first();
    await expect(count).toBeVisible();
    const before = await count.innerText();
    await area.fill('Weekend hikes and long climbs.');
    await expect(count).not.toHaveText(before);
  },

  async files(page) {
    const input = page.locator('input[type="file"]').first();
    expect(await input.count(), '<input type="file">').toBe(1);
    // TagAction lists the names for multiple files; a single file input shows its own.
    if (await input.evaluate((i) => i.multiple)) {
      await input.setInputFiles({ name: 'summit.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('jpg') });
      await expect(page.locator('[data-tag="files"]').first()).toContainText('summit.jpg');
    }
  },

  // Submitting an empty form shows messages as text under the fields.
  async validation(page) {
    const form = page.locator('form:has([required])').first();
    expect(await form.count(), 'a form with required fields').toBe(1);
    await form.locator('button:not([type="button"]):not([type="reset"]), input[type="submit"]').last().click();
    await expect(form.locator('[aria-invalid="true"]').first()).toBeVisible();
    await expect(form.locator('[data-tag="error"]:visible, small:visible').filter({ hasText: /\S/ }).first()).toBeVisible();
  },

  async toc(page) {
    const links = page.locator('nav[data-tag-toc] a');
    await expect(links.nth(1)).toBeAttached();
  },

  async anchors(page) {
    expect(await page.locator('h2 [data-tag="anchor"], h3 [data-tag="anchor"]').count(), '"#" links on headings').toBeGreaterThan(1);
  },

  // Every code block gets a Copy button.
  async copy(page) {
    const blocks = await page.locator('pre').count();
    expect(blocks, 'a <pre> code block').toBeGreaterThan(0);
    expect(await page.locator('[data-tag="copy"]').count(), 'a Copy button for every <pre>').toBe(blocks);
  },

  // Neighboring <details> with the same name: opening one closes the other.
  async accordion(page) {
    const named = page.locator('details[name]');
    expect(await named.count(), '<details name="…">').toBeGreaterThan(0);
    const name = await named.first().getAttribute('name');
    const group = page.locator(`details[name="${name}"]`);
    expect(await group.count()).toBeGreaterThan(1);
    await group.nth(0).locator('summary').click();
    await group.nth(1).locator('summary').click();
    await expect(group.nth(0)).not.toHaveAttribute('open', '');
    await expect(group.nth(1)).toHaveAttribute('open', '');
  },

  async abbr(page) {
    const abbr = page.locator('abbr[title]');
    expect(await abbr.count(), '<abbr title="…">').toBeGreaterThan(0);
    await abbr.first().click();
    await expect(page.locator('[data-tag="abbr"]').first()).toBeVisible();
  },

  // An <output for="…"> changes when a field it reads changes.
  async output(page) {
    const output = page.locator('output[for]').first();
    expect(await output.count(), '<output for="…">').toBe(1);
    const before = await output.innerText();
    const ids = (await output.getAttribute('for')).split(/\s+/);
    let changed = false;
    for (const id of ids) {
      const field = page.locator(`[id="${id}"]`);
      const type = await field.getAttribute('type');
      if ((type === 'checkbox' || type === 'radio') && !(await field.isChecked())) await field.check();
      else if (type !== 'checkbox' && type !== 'radio') await field.fill(String(Number(await field.inputValue() || 0) + 3));
      else continue;
      changed = true;
      break;
    }
    expect(changed, 'a field the output reads that can be changed').toBe(true);
    await expect(output).not.toHaveText(before);
  },

  // A button with command="--clone" adds a copy of a <template>.
  async clone(page) {
    const button = page.locator('button[command="--clone"][commandfor]').first();
    expect(await button.count(), '<button commandfor="…" command="--clone">').toBe(1);
    const id = await button.getAttribute('commandfor');
    const count = () => page.evaluate((id) => {
      const template = document.getElementById(id);
      const tag = template.content.firstElementChild.localName;
      return template.parentElement.querySelectorAll(`:scope > ${tag}`).length;
    }, id);
    const before = await count();
    await button.click();
    expect(await count()).toBe(before + 1);
  },

  // Clicking a photo shows it larger, in TagAction's viewer.
  async zoom(page) {
    const linked = page.locator('a[href$=".jpg"] > img, a[href$=".jpeg"] > img, a[href$=".png"] > img, a[href$=".webp"] > img, a[href$=".avif"] > img, a[href$=".svg"] > img');
    expect(await linked.count(), 'a photo linked to its larger version: <a href="large.jpg"><img …></a>').toBeGreaterThan(0);
    await linked.first().click();
    await expect(page.locator('[data-tag="viewer"]')).toBeVisible();
  },

  // Times with a timezone are rewritten in the reader's timezone.
  async 'local-time'(page, { browser, file }) {
    const selector = 'time[datetime*="T"]';
    const original = await textsWithoutJs(browser, file, selector);
    expect(original.length, '<time datetime="…T…Z"> with a time and timezone').toBeGreaterThan(0);
    expect(await page.locator(selector).allTextContents()).not.toEqual(original);
  },

  async 'relative-time'(page) {
    const time = page.locator('time[data-tag-time="relative"]').first();
    expect(await time.count(), '<time data-tag-time="relative">').toBe(1);
    await expect(time).toHaveText(/ago|yesterday|last|today|now/i);
  },

  // Open and closed <details> are remembered across visits.
  async remember(page) {
    const details = page.locator('[data-tag-remember] details[id], details[data-tag-remember][id]').first();
    expect(await details.count(), '<details id="…"> under data-tag-remember').toBe(1);
    const id = await details.getAttribute('id');
    const wasOpen = await details.evaluate((d) => d.open);
    await details.locator('summary').click();
    await expect.poll(() => page.evaluate(() => Object.keys(localStorage).some((k) => k.startsWith('tagaction:details:'))),
      'open state saved').toBe(true);
    await page.reload();
    await page.waitForFunction(() => window.TagAction !== undefined);
    expect(await page.locator(`details[id="${id}"]`).evaluate((d) => d.open)).toBe(!wasOpen);
  },

  // Chat output: compact density and a reasoning block. Messages inside an app
  // use the scoped build, each wrapped in class="tagbrush"; a page that is only
  // a conversation uses the full stylesheet with data-density on <html>.
  async chat(page) {
    const scoped = await page.locator('link[href*="tagbrush.scoped"]').count();
    if (scoped) {
      expect(await page.locator('.tagbrush[data-density="compact"], [data-density="compact"] .tagbrush, .tagbrush [data-density="compact"]').count(),
        'data-density="compact" on or around the messages').toBeGreaterThan(0);
      expect(await page.locator('.tagbrush details[data-reasoning]').count(), '<details data-reasoning> in a message').toBeGreaterThan(0);
    } else {
      await expect(page.locator('html'), 'a transcript page: data-density="compact" on <html>').toHaveAttribute('data-density', 'compact');
      expect(await page.locator('details[data-reasoning]').count(), '<details data-reasoning>').toBeGreaterThan(0);
    }
  },
};

test('every request has a behavior check for each behavior it lists', () => {
  for (const { id, behaviors } of REQUESTS) {
    for (const behavior of behaviors) expect(BEHAVIORS[behavior], `${id}: ${behavior}`).toBeDefined();
  }
});

for (const { id, round, file, behaviors } of PAGES) {
  test.describe(`${round}/${id}`, () => {
    test('passes TagCheck with no errors or warnings, including contrast and phone width', async () => {
      const report = await checkFiles([file], { browser: true });
      expect(report.files.flatMap((f) => f.problems.map((p) => `${p.line ?? '-'}: ${p.level} ${p.rule}: ${p.message}`))).toEqual([]);
    });

    test('has no hand-written JavaScript', () => {
      const html = readFileSync(file, 'utf8');
      const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
      expect(scripts.filter(([, attrs, body]) => body.trim() || !/src="https:\/\/cdn\.jsdelivr\.net\/npm\/tagaction@0\//.test(attrs))
        .map(([tag]) => tag.slice(0, 120)), 'scripts other than TagAction').toEqual([]);
      expect([...html.matchAll(/\s(on[a-z]+)=/gi)].map((m) => m[1]), 'event handler attributes').toEqual([]);
      expect(html, 'javascript: links').not.toMatch(/href="javascript:/i);
    });

    test('every visible button does something with JavaScript off', async ({ browser }) => {
      const context = await browser.newContext({ javaScriptEnabled: false });
      const page = await context.newPage();
      await open(page, file, { javaScriptEnabled: false });
      const dead = await page.locator('button').evaluateAll((buttons) => buttons
        .filter((b) => b.checkVisibility())
        .filter((b) => {
          if (b.form && b.type !== 'button') return false; // submits or resets its form
          if (b.hasAttribute('popovertarget')) return false;
          const command = b.getAttribute('command');
          if (b.hasAttribute('commandfor') && command && !command.startsWith('--')) return false; // the browser's own commands
          if (b.hasAttribute('aria-controls') && b.hasAttribute('aria-expanded')) return false; // TagAction dropdown; its list is shown
          return true;
        })
        .map((b) => b.outerHTML.slice(0, 120)));
      await context.close();
      expect(dead, 'buttons that do nothing without JavaScript (give them hidden, or make them work natively)').toEqual([]);
    });

    for (const behavior of behaviors) {
      test(`behavior: ${behavior}`, async ({ page, browser }) => {
        const known = KNOWN[`${round}/${id}/${behavior}`];
        test.fail(Boolean(known), known);
        await open(page, file);
        await BEHAVIORS[behavior](page, { browser, file });
      });
    }
  });
}
