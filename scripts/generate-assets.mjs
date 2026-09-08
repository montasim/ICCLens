import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const root = process.cwd()
const configPath = path.join(root, 'product.config.json')
const config = JSON.parse(await readFile(configPath, 'utf8'))
const iconDirectory = path.join(root, 'public', 'icon')
const generatedAt = new Date().toISOString()

await mkdir(iconDirectory, { recursive: true })

const logo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-labelledby="title"><title>${escapeXml(config.name)} logo: catalog cards brought into focus</title><rect width="128" height="128" rx="25" fill="${config.theme.ink}"/><path d="M40 29H27v70h13M88 29h13v70H88" fill="none" stroke="${config.theme.primary}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/><rect x="39" y="43" width="14" height="48" rx="4" fill="${config.theme.paper}"/><rect x="57" y="34" width="14" height="57" rx="4" fill="${config.theme.signal}"/><rect x="75" y="40" width="14" height="51" rx="4" fill="${config.theme.paper}"/></svg>`

await writeFile(path.join(root, 'public', 'logo.svg'), logo)
for (const size of [16, 32, 48, 96, 128]) {
  await sharp(Buffer.from(logo))
    .resize(size, size)
    .png()
    .toFile(path.join(iconDirectory, `${size}.png`))
}

await writeFile(
  path.join(root, 'src', 'generated-theme.css'),
  `:root {\n  --primary: ${config.theme.primary};\n  --ink: ${config.theme.ink};\n  --paper: ${config.theme.paper};\n  --signal: ${config.theme.signal};\n  --ring: ${config.theme.primary};\n}\n`,
)

await writeFile(
  path.join(root, 'public', 'brand-assets.json'),
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
