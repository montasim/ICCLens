import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const extensionRoot = process.cwd()
const repositoryRoot = path.resolve(extensionRoot, '../..')
const configPath = path.join(repositoryRoot, 'product.config.json')
const config = JSON.parse(await readFile(configPath, 'utf8'))
const iconDirectory = path.join(extensionRoot, 'public', 'icon')
const generatedAt = new Date().toISOString()

await mkdir(iconDirectory, { recursive: true })

const logo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-labelledby="title"><title>${escapeXml(config.name)} logo</title><rect width="128" height="128" rx="18" fill="${config.theme.primary}"/><path d="M105 0h23v128H91z" fill="#55d6be"/><text x="17" y="78" fill="${config.theme.actionForeground}" font-family="Arial,Helvetica,sans-serif" font-size="39" font-weight="700" letter-spacing="-2">ICC</text></svg>`

await writeFile(path.join(extensionRoot, 'public', 'logo.svg'), logo)
for (const size of [16, 32, 48, 96, 128]) {
  await sharp(Buffer.from(logo))
    .resize(size, size)
    .png()
    .toFile(path.join(iconDirectory, `${size}.png`))
}

await writeFile(
  path.join(extensionRoot, 'src', 'generated-theme.css'),
  `:root,
:host,
[data-theme='light'] {
  --canvas: #f7f2e8;
  --surface: #fffaf0;
  --surface-muted: #efe7d8;
  --border: #d8cbb8;
  --text-primary: #000000;
  --text-secondary: #4d4439;
  --text-muted: #675f54;
  --action: ${config.theme.actionSurface};
  --action-hover: ${config.theme.actionHover};
  --action-foreground: ${config.theme.actionForeground};
  --action-on-surface: #854d0e;
  --support: #55d6be;
  --support-hover: #79e1ce;
  --support-foreground: #062d27;
  --player-accent: var(--action);
  --player-accent-hover: var(--action-hover);
  --player-black: #000000;
  --player-black-90: rgba(0, 0, 0, 0.90);
  --player-black-75: rgba(0, 0, 0, 0.75);
  --player-black-70: rgba(0, 0, 0, 0.70);
  --player-black-50: rgba(0, 0, 0, 0.50);
  --player-black-45: rgba(0, 0, 0, 0.45);
  --player-black-40: rgba(0, 0, 0, 0.40);
  --player-black-35: rgba(0, 0, 0, 0.35);
  --player-black-25: rgba(0, 0, 0, 0.25);
  --player-black-15: rgba(0, 0, 0, 0.15);
  --player-black-10: rgba(0, 0, 0, 0.10);
  --player-black-07: rgba(0, 0, 0, 0.07);
  --player-black-05: rgba(0, 0, 0, 0.05);
  --player-white: #ffffff;
  --player-white-90: rgba(255, 255, 255, 0.90);
  --player-white-70: rgba(255, 255, 255, 0.70);
  --player-white-60: rgba(255, 255, 255, 0.60);
  --player-white-55: rgba(255, 255, 255, 0.55);
  --player-white-25: rgba(255, 255, 255, 0.25);
  --player-white-20: rgba(255, 255, 255, 0.20);
  --player-white-15: rgba(255, 255, 255, 0.15);
  --player-white-10: rgba(255, 255, 255, 0.10);
  --player-white-07: rgba(255, 255, 255, 0.07);
  --player-white-05: rgba(255, 255, 255, 0.05);
  --player-shadow-30: rgba(0, 0, 0, 0.30);
  --player-shadow-28: rgba(0, 0, 0, 0.28);
  --player-shadow-26: rgba(0, 0, 0, 0.26);
  --player-shadow-24: rgba(0, 0, 0, 0.24);
  --player-shadow-20: rgba(0, 0, 0, 0.20);
  --player-shadow-18: rgba(0, 0, 0, 0.18);
  --player-shadow-45: rgba(0, 0, 0, 0.45);
  --player-shadow-50: rgba(0, 0, 0, 0.50);
  --player-shadow-40: rgba(0, 0, 0, 0.40);
  --player-shadow-22: rgba(0, 0, 0, 0.22);
  --player-panel: #080c12;
  --danger-foreground: #fffaf0;
  --danger: #991b1b;
  --focus-ring: ${config.theme.primary};
  --action-shadow-18: color-mix(in srgb, var(--action) 18%, transparent);
  --selection: #fde68a;
  --selection-foreground: #000000;
  --scrollbar-thumb: #c48a20;
  --scrollbar-track: #efe7d8;
  --primary: var(--action);
  --ink: var(--text-primary);
  --paper: var(--canvas);
  --signal: #fef3c7;
  --ring: var(--focus-ring);
}

:host([data-theme='dark']),
[data-theme='dark'] {
  --canvas: #05080d;
  --surface: #0b1018;
  --surface-muted: #121824;
  --border: #293142;
  --text-primary: #f6f0e7;
  --text-secondary: #d8d4ce;
  --text-muted: #aab0b9;
  --action: ${config.theme.actionSurface};
  --action-hover: ${config.theme.actionHover};
  --action-foreground: ${config.theme.actionForeground};
  --action-on-surface: ${config.theme.primary};
  --support: #55d6be;
  --support-hover: #79e1ce;
  --support-foreground: #062d27;
  --player-accent: var(--action);
  --player-accent-hover: var(--action-hover);
  --player-black: #000000;
  --player-black-90: rgba(0, 0, 0, 0.90);
  --player-black-75: rgba(0, 0, 0, 0.75);
  --player-black-70: rgba(0, 0, 0, 0.70);
  --player-black-50: rgba(0, 0, 0, 0.50);
  --player-black-45: rgba(0, 0, 0, 0.45);
  --player-black-40: rgba(0, 0, 0, 0.40);
  --player-black-35: rgba(0, 0, 0, 0.35);
  --player-black-25: rgba(0, 0, 0, 0.25);
  --player-black-15: rgba(0, 0, 0, 0.15);
  --player-black-10: rgba(0, 0, 0, 0.10);
  --player-black-07: rgba(0, 0, 0, 0.07);
  --player-black-05: rgba(0, 0, 0, 0.05);
  --player-white: #ffffff;
  --player-white-90: rgba(255, 255, 255, 0.90);
  --player-white-70: rgba(255, 255, 255, 0.70);
  --player-white-60: rgba(255, 255, 255, 0.60);
  --player-white-55: rgba(255, 255, 255, 0.55);
  --player-white-25: rgba(255, 255, 255, 0.25);
  --player-white-20: rgba(255, 255, 255, 0.20);
  --player-white-15: rgba(255, 255, 255, 0.15);
  --player-white-10: rgba(255, 255, 255, 0.10);
  --player-white-07: rgba(255, 255, 255, 0.07);
  --player-white-05: rgba(255, 255, 255, 0.05);
  --player-shadow-30: rgba(0, 0, 0, 0.30);
  --player-shadow-28: rgba(0, 0, 0, 0.28);
  --player-shadow-26: rgba(0, 0, 0, 0.26);
  --player-shadow-24: rgba(0, 0, 0, 0.24);
  --player-shadow-20: rgba(0, 0, 0, 0.20);
  --player-shadow-18: rgba(0, 0, 0, 0.18);
  --player-shadow-45: rgba(0, 0, 0, 0.45);
  --player-shadow-50: rgba(0, 0, 0, 0.50);
  --player-shadow-40: rgba(0, 0, 0, 0.40);
  --player-shadow-22: rgba(0, 0, 0, 0.22);
  --player-panel: #080c12;
  --danger-foreground: #fffaf0;
  --danger: #fca5a5;
  --focus-ring: ${config.theme.primary};
  --action-shadow-18: color-mix(in srgb, var(--action) 18%, transparent);
  --selection: #92400e;
  --selection-foreground: #fffaf0;
  --scrollbar-thumb: #d59b2a;
  --scrollbar-track: #121824;
  --signal: #3a2a0c;
}
`,
)

await writeFile(
  path.join(extensionRoot, 'public', 'brand-assets.json'),
  `${JSON.stringify(
    {
      source: 'product.config.json',
      generatedAt,
      outputs: [
        'logo.svg',
        ...[16, 32, 48, 96, 128].map((size) => `icon/${size}.png`),
      ],
    },
    null,
    2,
  )}\n`,
)

console.log(`Generated ${config.name} extension assets.`)

function escapeXml(value) {
  return String(value).replace(/[<>&"']/gu, (character) => {
    return {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      '"': '&quot;',
      "'": '&apos;',
    }[character]
  })
}
