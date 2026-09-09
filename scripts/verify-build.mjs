import { access, readFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const releaseConfigOnly = process.argv.includes('--release-config-only')
const config = JSON.parse(
  await readFile(path.join(root, 'product.config.json'), 'utf8'),
)
const extensionPackage = JSON.parse(
  await readFile(path.join(root, 'apps/extension/package.json'), 'utf8'),
)

assert(config.name?.trim(), 'Product name is required.')
assert(
  `@${config.slug}/extension` === extensionPackage.name,
  'product.config.json slug must match the extension package scope.',
)
assert(
  extensionPackage.description.includes(config.name),
  'The extension package description must identify the product.',
)
assert(
  /^#[0-9a-f]{6}$/iu.test(config.theme.primary),
  'Theme colors must use six-digit hex values.',
)
assert(
  /^#[0-9a-f]{6}$/iu.test(config.theme.actionForeground),
  'Action foreground must use a six-digit hex value.',
)
assert(
  /^#[0-9a-f]{6}$/iu.test(config.theme.actionSurface),
  'Action surface must use a six-digit hex value.',
)
assert(
  /^#[0-9a-f]{6}$/iu.test(config.theme.actionHover),
  'Action hover must use a six-digit hex value.',
)

if (releaseConfigOnly) {
  const serialized = JSON.stringify(config)
  assert(
    !/example\.com|github\.com\/example|support@example/iu.test(serialized),
    'Replace example URLs and support email before release.',
  )
  console.log('Release configuration contains no starter placeholders.')
  process.exit(0)
}

const output = path.join(root, '.output')
const manifest = JSON.parse(
  await readFile(path.join(output, 'manifest.json'), 'utf8'),
)
const expectedPermissions = ['storage']
const expectedMatches = ['http://10.16.100.244/*']

assert(
  manifest.manifest_version === 3,
  'The build must use Chrome Manifest V3.',
)
assert(
  manifest.name === config.name,
  'Built manifest name does not match product config.',
)
assert(
  manifest.version === extensionPackage.version,
  'Built manifest version does not match package version.',
)
assert(
  JSON.stringify([...manifest.permissions].sort()) ===
    JSON.stringify(expectedPermissions.sort()),
  `Permissions must remain exactly: ${expectedPermissions.join(', ')}.`,
)
assert(
  !manifest.host_permissions?.length,
  'ICC Lens does not need separate host_permissions.',
)
assert(
  manifest.minimum_chrome_version === '120',
  'Minimum Chrome version must remain explicit.',
)
assert(!manifest.side_panel, 'ICC Lens must not ship the starter side panel.')

const contentScripts = manifest.content_scripts ?? []
assert(contentScripts.length === 1, 'Expected one ICC Lens content script.')
assert(
  JSON.stringify(contentScripts[0]?.matches) ===
    JSON.stringify(expectedMatches),
  `Content script access must remain exactly: ${expectedMatches.join(', ')}.`,
)
assert(
  contentScripts[0]?.run_at === 'document_idle',
  'ICC Lens must parse the page at document_idle.',
)

const accessibleResources = manifest.web_accessible_resources ?? []
assert(
  accessibleResources.every(
    (entry) =>
      JSON.stringify(entry.matches) === JSON.stringify(expectedMatches),
  ),
  'Every web-accessible resource must remain limited to the exact ICC host.',
)
assert(
  accessibleResources.some((entry) => entry.resources.includes('logo.svg')),
  'The content-page logo must be web-accessible on the ICC host.',
)

for (const required of [
  'popup.html',
  'logo.svg',
  'icon/128.png',
  'content-scripts/icc.js',
  'content-scripts/icc.css',
]) {
  await access(path.join(output, required))
}

const serviceWorker = manifest.background?.service_worker
assert(typeof serviceWorker === 'string', 'MV3 service worker is missing.')
await access(path.join(output, serviceWorker))

console.log(
  'Chrome MV3 build, exact-host content script, permissions, entrypoints, and assets verified.',
)

function assert(condition, message) {
  if (!condition) throw new Error(message)
}
