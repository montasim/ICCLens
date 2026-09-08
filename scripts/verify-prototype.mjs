import { access, readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const prototypeRoot = path.join(process.cwd(), 'prototype')
const approvedRequired = process.argv.includes('--approved')
const requiredFiles = ['index.html', 'coverage.md']

const assert = (condition, message) => {
  if (!condition) throw new Error(message)
}

for (const file of requiredFiles) {
  const target = path.join(prototypeRoot, file)
  try {
    await access(target)
  } catch {
    throw new Error(`Missing prototype/${file}. Follow docs/PROTOTYPING.md.`)
  }
}

const walk = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const target = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...(await walk(target)))
    if (entry.isFile()) files.push(target)
  }

  return files
}

const files = await walk(prototypeRoot)
const forbiddenStylesheets = files.filter((file) =>
  /\.(?:css|less|sass|scss|styl)$/i.test(file),
)

assert(
  forbiddenStylesheets.length === 0,
  `Prototype styling must use Tailwind utilities; remove authored stylesheet files: ${forbiddenStylesheets
    .map((file) => path.relative(process.cwd(), file))
    .join(', ')}`,
)

const htmlFiles = files.filter((file) => file.endsWith('.html'))
assert(
  htmlFiles.length > 0,
  'The prototype must contain at least one HTML file.',
)

const htmlDocuments = await Promise.all(
  htmlFiles.map(async (file) => ({
    file,
    source: await readFile(file, 'utf8'),
  })),
)

for (const { file, source } of htmlDocuments) {
  const relativeFile = path.relative(process.cwd(), file)
  assert(
    /<!doctype html>/i.test(source),
    `${relativeFile} needs an HTML doctype.`,
  )
  assert(
    /<html[^>]+lang=/i.test(source),
    `${relativeFile} needs a lang attribute.`,
  )
  assert(
    /name=["']viewport["']/i.test(source),
    `${relativeFile} needs a responsive viewport meta tag.`,
  )
  assert(
    !/<style\b/i.test(source),
    `${relativeFile} contains a forbidden <style> block.`,
  )
  assert(
    !/\sstyle\s*=/i.test(source),
    `${relativeFile} contains a forbidden inline style attribute.`,
  )
}

const combinedHtml = htmlDocuments.map(({ source }) => source).join('\n')
assert(
  combinedHtml.includes('@tailwindcss/browser@4'),
  'Load the Tailwind CSS 4 browser build in the prototype HTML.',
)
assert(
  !/<link[^>]+rel=["']stylesheet["']/i.test(combinedHtml),
  'Prototype HTML must not load authored stylesheets.',
)

const scriptFiles = files.filter((file) => /\.(?:js|mjs)$/i.test(file))
const externalScriptSources = await Promise.all(
  scriptFiles.map((file) => readFile(file, 'utf8')),
)
const scriptSources = [combinedHtml, ...externalScriptSources]
assert(
  !scriptSources.some((source) => /\.style(?:\.|\[|\s*=)/.test(source)),
  'Prototype scripts must change Tailwind classes or semantic state, not write CSS styles.',
)

const coverage = await readFile(path.join(prototypeRoot, 'coverage.md'), 'utf8')
assert(
  /^Prototype status:\s*(?:draft|approved)\s*$/im.test(coverage),
  'prototype/coverage.md needs `Prototype status: draft` or `Prototype status: approved`.',
)
assert(
  /\|\s*Requirement\s*\|\s*Surface\s*\|\s*Interaction or state\s*\|\s*Mock boundary\s*\|/i.test(
    coverage,
  ),
  'prototype/coverage.md needs the required coverage table from the template.',
)
assert(
  !/(?:<requirement>|<surface>|<interaction|\bTBD\b|\bTODO\b)/i.test(coverage),
  'Replace every placeholder in prototype/coverage.md before review.',
)

if (approvedRequired) {
  assert(
    /^Prototype status:\s*approved\s*$/im.test(coverage),
    'Production implementation requires `Prototype status: approved`.',
  )
  assert(/^Approved by:\s*\S.+$/im.test(coverage), 'Record the human approver.')
  assert(
    /^Approved on:\s*\d{4}-\d{2}-\d{2}\s*$/im.test(coverage),
    'Record the approval date as YYYY-MM-DD.',
  )
}

console.log(
  approvedRequired
    ? 'Verified the approved functional prototype contract.'
    : 'Verified the functional prototype structure; human approval may still be pending.',
)
