// Builds public/index.html from src/index.html, injecting the values from .env.
// Usage: node build.mjs   (no dependencies)
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';

function parseEnv(text) {
  const env = {};
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    env[key] = val;
  }
  return env;
}

const envFile = existsSync('.env') ? '.env' : '.env.example';
if (envFile !== '.env') console.warn('No .env found, using .env.example values');
const env = { ...parseEnv(readFileSync(envFile, 'utf8')), ...process.env };

const required = ['NAME_A', 'NAME_B', 'START_DATE', 'BIRTHDAY_NAME', 'BIRTHDAY_DATE'];
const missing = required.filter(k => !env[k]);
if (missing.length) { console.error('Missing in ' + envFile + ': ' + missing.join(', ')); process.exit(1); }
for (const k of ['START_DATE', 'BIRTHDAY_DATE'])
  if (!/^\d{4}-\d{2}-\d{2}$/.test(env[k])) { console.error(k + ' must be YYYY-MM-DD'); process.exit(1); }

const config = {
  nameA: env.NAME_A,
  nameB: env.NAME_B,
  startDate: env.START_DATE,
  birthdayName: env.BIRTHDAY_NAME,
  birthdayDate: env.BIRTHDAY_DATE,
  msgMonthiversary: env.MSG_MONTHIVERSARY || 'feliz cumple mes 💐',
  msgAnniversaryFirst: env.MSG_ANNIVERSARY_FIRST || 'feliz aniversario 💐',
  msgAnniversary: env.MSG_ANNIVERSARY || 'feliz {n} años 💐',
  msgBirthday: env.MSG_BIRTHDAY || '¡felices {age}, {name}! 🎂',
  // --prod (used by npm run deploy) always disables the ?test= previews
  enableTest: env.ENABLE_TEST === 'true' && !process.argv.includes('--prod'),
};
if (config.enableTest) console.warn('ENABLE_TEST=true: ?test= previews are ON (set it to false before deploying)');

let html = readFileSync('src/index.html', 'utf8');
// "<" escaped so a value can never close the <script> tag
const json = JSON.stringify(config, null, 2).replace(/</g, '\\u003c');
const before = html;
html = html.replace(/\/\*CONFIG_START\*\/[\s\S]*?\/\*CONFIG_END\*\//, () => json);
if (html === before) { console.error('CONFIG markers not found in src/index.html'); process.exit(1); }

if (env.PAGE_TITLE) {
  const esc = env.PAGE_TITLE.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  html = html.replace(/<title>[\s\S]*?<\/title>/, () => `<title>${esc}</title>`);
}

if (env.FAVICON) {
  // Emoji (or short text) drawn into an inline SVG favicon
  const text = env.FAVICON.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>${text}</text></svg>`;
  const href = 'data:image/svg+xml,' + encodeURIComponent(svg).replace(/'/g, '%27');
  html = html.replace(/<link rel="icon"[^>]*>/, () => `<link rel="icon" href="${href}">`);
}

mkdirSync('public', { recursive: true });
writeFileSync('public/index.html', html);
console.log(`Built public/index.html from ${envFile}`);
