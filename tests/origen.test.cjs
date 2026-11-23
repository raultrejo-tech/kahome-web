const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const source = readFileSync(require('node:path').join(__dirname, '../origen.js'), 'utf8');

function run({ search = '', referrer = '', saved = null, blocked = false } = {}) {
  const storage = new Map(saved === null ? [] : [['kahome.origen.v1', saved]]);
  const sessionStorage = {
    getItem: (k) => { if (blocked) throw Error('blocked'); return storage.get(k) ?? null; },
    setItem: (k, v) => { if (blocked) throw Error('blocked'); storage.set(k, v); },
  };
  const window = {};
  vm.runInNewContext(source, { window, sessionStorage, URLSearchParams, location: { search }, document: { referrer } });
  return { ...window.KAHOME_ORIGEN, storage };
}

const casos = [
  ['?utm_source=google&utm_medium=cpc&utm_campaign=202612_busqueda', '', 'google_anuncio', 'Vi su anuncio en Google'],
  ['?gclid=abc123', '', 'google_anuncio', 'Vi su anuncio en Google'],
  ['', 'https://www.google.com/', 'google', 'Los encontré en Google'],
  ['?utm_source=gbp&utm_medium=perfil', '', 'maps', 'Los encontré en Google Maps'],
  ['?utm_source=fb&utm_medium=paid&utm_campaign=202612_persianas', '', 'fb_anuncio', 'Vi su anuncio en Facebook'],
  ['?utm_source=ig&utm_medium=paid', '', 'ig_anuncio', 'Vi su anuncio en Instagram'],
  ['?utm_source=ig&utm_medium=bio', '', 'instagram', 'Los vi en Instagram'],
  ['?fbclid=xyz', '', 'redes', 'Los vi en redes'],
  ['', 'https://l.facebook.com/', 'redes', 'Los vi en redes'],
  ['?utm_source=folleto&utm_medium=qr', '', 'folleto', 'Vi su folleto'],
  ['?utm_source=correo&utm_medium=email', '', 'correo', 'Recibí su correo'],
  ['', '', 'pagina', 'Vi su página'],
  ['?utm_source=otra_cosa', '', 'pagina', 'Vi su página'],
  ['?UTM_SOURCE=x&utm_source=FB&utm_medium=PAID', '', 'fb_anuncio', 'Vi su anuncio en Facebook'],
];

for (const [search, referrer, clave, frase] of casos) {
  test(`origen ${search || referrer || '(directo)'} → ${clave}`, () => {
    const r = run({ search, referrer });
    assert.equal(r.clave, clave);
    assert.equal(r.frase, frase);
  });
}

test('la primera fuente de la visita se conserva al navegar', () => {
  const r = run({ search: '', saved: 'folleto' });
  assert.equal(r.clave, 'folleto');
});

test('un valor guardado desconocido se ignora y se vuelve a detectar', () => {
  const r = run({ search: '?gclid=1', saved: 'basura' });
  assert.equal(r.clave, 'google_anuncio');
  assert.equal(r.storage.get('kahome.origen.v1'), 'google_anuncio');
});

test('sin almacenamiento (navegación privada) sigue funcionando', () => {
  const r = run({ search: '?utm_source=folleto', blocked: true });
  assert.equal(r.clave, 'folleto');
});

test('ninguna frase lleva códigos ni datos del cliente', () => {
  const { FRASES } = run();
  for (const f of Object.values(FRASES)) assert.match(f, /^[A-ZÁÉÍÓÚ][\p{L} ]+$/u);
});
