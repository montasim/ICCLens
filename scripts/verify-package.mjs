import { createHash } from 'node:crypto'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { unzipSync } from 'fflate'

const root = process.cwd()
const archives = (await readdir(path.join(root, '.output'))).filter((file) =>
  file.endsWith('.zip'),
)
if (archives.length !== 1)
  throw new Error(
    `Expected one Chrome zip in .output, found ${archives.length}.`,
  )

const archivePath = path.join(root, '.output', archives[0])
const archive = await readFile(archivePath)
const entries = unzipSync(archive)
const manifestBytes = entries['manifest.json']
if (!manifestBytes)
  throw new Error(
    'Packaged archive does not contain manifest.json at its root.',
  )

const manifest = JSON.parse(new TextDecoder().decode(manifestBytes))
if (manifest.manifest_version !== 3)
  throw new Error('Packaged extension is not Manifest V3.')
if (manifest.host_permissions?.length)
  throw new Error('Packaged extension unexpectedly requests host access.')
if (JSON.stringify(manifest.permissions) !== JSON.stringify(['storage']))
  throw new Error('Packaged permissions must remain exactly: storage.')
if (
  JSON.stringify(manifest.content_scripts?.[0]?.matches) !==
  JSON.stringify(['http://10.16.100.244/*'])
)
  throw new Error('Packaged content script is not limited to the ICC host.')
if (manifest.side_panel)
  throw new Error('Packaged extension unexpectedly contains a side panel.')
if (
  !manifest.web_accessible_resources?.every(
    (entry) =>
      JSON.stringify(entry.matches) ===
      JSON.stringify(['http://10.16.100.244/*']),
  )
)
  throw new Error(
    'Packaged web-accessible resources are not limited to the ICC host.',
  )
for (const required of [
  'popup.html',
  'content-scripts/icc.js',
  'content-scripts/icc.css',
  'icon/128.png',
]) {
  if (!entries[required])
    throw new Error(`Packaged extension is missing ${required}.`)
}

const digest = createHash('sha256').update(archive).digest('hex')
const checksumPath = `${archivePath}.sha256`
await writeFile(checksumPath, `${digest}  ${path.basename(archivePath)}\n`)
console.log(
  `Verified ${path.basename(archivePath)} and wrote its SHA-256 checksum.`,
)
