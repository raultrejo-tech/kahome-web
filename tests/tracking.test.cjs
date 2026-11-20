const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const source = readFileSync(require('node:path').join(__dirname, '../tracking.js'), 'utf8');
const key = 'kahome.marketing-consent.v1';
const pixelId = '123456789012345';

function setup({ saved = null, blocked = false, configured = true } = {}) {
  const listeners = {};
  const windowListeners = {};
  const scripts = [];
  const cookies = [];
  const storage = new Map(saved === null ? [] : [[key, saved]]);
  const elements = new Map();
  for (const id of ['marketingConsent', 'marketingSettings', 'marketingAccept', 'marketingReject']) {
    elements.set(id, { hidden: true, handlers: {}, focus() {}, addEventListener(event, fn) { this.handlers[event] = fn; } });
  }
  const document = {
    getElementById: (id) => elements.get(id),
    body: { classList: { toggle() {} } },
    head: { appendChild: (script) => scripts.push(script) },
    createElement: () => ({}),
    addEventListener: (event, fn) => { listeners[event] = fn; },
    set cookie(value) { cookies.push(value); },
  };
  const window = { addEventListener: (event, fn) => { windowListeners[event] = fn; } };
  const localStorage = {
    getItem: (name) => { if (blocked) throw Error('blocked'); return storage.get(name) ?? null; },
    setItem: (name, value) => { if (blocked) throw Error('blocked'); storage.set(name, value); },
  };
  const code = source.replace(/const PIXEL_ID = "[^"]*"/, `const PIXEL_ID = "${configured ? pixelId : ''}"`);
  vm.runInNewContext(code, { window, document, localStorage, location: { hostname: 'kahome-web.pages.dev' }, Date });
  return {
    window, scripts, cookies, elements, storage,
    queue: () => Array.from(window.fbq?.queue || [], (args) => JSON.parse(JSON.stringify(Array.from(args)))),
    click: (id) => elements.get(id).handlers.click(),
    waClick: (floating = false) => listeners.click({ target: { closest: () => ({ classList: { contains: () => floating } }) } }),
    form: () => listeners['kahome:whatsapp-form'](),
    sync: () => windowListeners.storage({ key }),
  };
}

test('no Meta script or events before consent; reject persists', () => {
  const ctx = setup();
  assert.equal(ctx.elements.get('marketingConsent').hidden, false);
  ctx.waClick(); ctx.form();
  assert.equal(ctx.scripts.length, 0);
  assert.equal(ctx.window.fbq, undefined);
  ctx.click('marketingReject');
  assert.equal(JSON.parse(ctx.storage.get(key)).accepted, false);
  assert.equal(ctx.scripts.length, 0);
});

test('accept initializes once, disables automatic collection, sends only named events', () => {
  const ctx = setup();
  ctx.click('marketingAccept');
  ctx.click('marketingAccept');
  ctx.waClick(true); ctx.waClick(false); ctx.form();
  assert.equal(ctx.scripts.length, 1);
  assert.equal(ctx.scripts[0].src, 'https://connect.facebook.net/en_US/fbevents.js');
  const q = ctx.queue();
  assert.deepEqual(q.find((item) => item[0] === 'set'), ['set', 'autoConfig', false, pixelId]);
  assert.deepEqual(q.find((item) => item[0] === 'init'), ['init', pixelId]);
  assert.equal(q.filter((item) => item[2] === 'PageView').length, 1);
  assert.deepEqual(q.filter((item) => item[0] === 'trackSingleCustom'), [
    ['trackSingleCustom', pixelId, 'WhatsAppClick', { source: 'floating_button' }],
    ['trackSingleCustom', pixelId, 'WhatsAppClick', { source: 'website_link' }],
    ['trackSingleCustom', pixelId, 'WhatsAppClick', { source: 'quote_form' }],
  ]);
});

test('revoke stops subsequent events and clears Meta cookies', () => {
  const ctx = setup();
  ctx.click('marketingAccept');
  ctx.click('marketingSettings');
  assert.equal(ctx.elements.get('marketingConsent').hidden, false);
  ctx.click('marketingReject');
  const length = ctx.queue().length;
  ctx.form(); ctx.waClick();
  assert.equal(ctx.queue().length, length);
  assert.deepEqual(ctx.queue().at(-1), ['consent', 'revoke']);
  assert.ok(ctx.cookies.some((value) => value.startsWith('_fbp=; Max-Age=0;')));
  assert.ok(ctx.cookies.some((value) => value.startsWith('_fbc=; Max-Age=0;')));
});

test('saved choices, expired/malformed choices, blocked storage, and unconfigured pixel', () => {
  for (const accepted of [true, false]) {
    const ctx = setup({ saved: JSON.stringify({ accepted, savedAt: Date.now() }) });
    assert.equal(ctx.elements.get('marketingConsent').hidden, true);
    assert.equal(ctx.scripts.length, accepted ? 1 : 0);
  }
  for (const saved of ['broken', JSON.stringify({ accepted: true, savedAt: 0 }), JSON.stringify({ accepted: true, savedAt: Date.now() + 86400000 })]) {
    const ctx = setup({ saved });
    assert.equal(ctx.scripts.length, 0);
    assert.equal(ctx.elements.get('marketingConsent').hidden, false);
  }
  const blocked = setup({ blocked: true });
  blocked.click('marketingAccept');
  assert.equal(blocked.scripts.length, 1);
  const unconfigured = setup({ configured: false });
  unconfigured.click('marketingAccept');
  assert.equal(unconfigured.scripts.length, 0);
});

test('a withdrawal in another tab is respected', () => {
  const ctx = setup();
  ctx.click('marketingAccept');
  ctx.storage.set(key, JSON.stringify({ accepted: false, savedAt: Date.now() }));
  ctx.sync();
  const length = ctx.queue().length;
  ctx.waClick();
  assert.equal(ctx.queue().length, length);
  assert.deepEqual(ctx.queue().at(-1), ['consent', 'revoke']);
});

test('form integration occurs after validation and does not include form data', () => {
  const formSource = readFileSync(require('node:path').join(__dirname, '../script.js'), 'utf8');
  assert.ok(formSource.indexOf('if (!valido) return;') < formSource.indexOf('document.dispatchEvent(new Event("kahome:whatsapp-form"))'));
  assert.equal((formSource.match(/kahome:whatsapp-form/g) || []).length, 1);
  assert.ok(!source.includes('form.nombre') && !source.includes('form.telefono') && !source.includes('form.mensaje'));
});
