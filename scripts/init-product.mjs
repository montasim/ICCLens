import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const values = parseArguments(process.argv.slice(2))
if (!values.name) {
  console.error(
    'Usage: pnpm init:product -- --name "Product" [--slug product] [--homepage URL]',
  )
  process.exit(1)
}

const configPath = path.join(root, 'product.config.json')
const packagePath = path.join(root, 'package.json')
const config = JSON.parse(await readFile(configPath, 'utf8'))
const packageJson = JSON.parse(await readFile(packagePath, 'utf8'))
const previousName = config.name
const slug = values.slug ?? slugify(values.name)

Object.assign(config, {
  name: values.name,
  shortName: values.shortName ?? values.name.slice(0, 12),
  slug,
  description: values.description ?? config.description,
  homepage: values.homepage ?? config.homepage,
  repository: values.repository ?? config.repository,
  supportEmail: values.supportEmail ?? config.supportEmail,
  privacyUrl: values.privacyUrl ?? config.privacyUrl,
})
packageJson.name = slug
packageJson.description = config.description

await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`)
await writeFile(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`)

for (const file of ['entrypoints/popup/index.html']) {
  const filePath = path.join(root, file)
  const content = await readFile(filePath, 'utf8')
  await writeFile(filePath, content.replaceAll(previousName, values.name))
}

console.log(
  `Initialized ${values.name}. Review PRODUCT.md, product.config.json, and permission-ledger.md next.`,
)

function parseArguments(args) {
  const parsed = {}
  for (let index = 0; index < args.length; index += 1) {
    const token = args[index]
    const value = args[index + 1]
    if (
      token?.startsWith('--') &&
      token !== '--' &&
      value &&
      !value.startsWith('--')
    ) {
      parsed[token.slice(2)] = value
      index += 1
    }
  }
  return parsed
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-|-$/gu, '')
}
