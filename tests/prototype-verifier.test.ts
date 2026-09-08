import { execFileSync } from 'node:child_process'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

const verifier = path.resolve(process.cwd(), 'scripts/verify-prototype.mjs')
const temporaryRoots: string[] = []

const createPrototype = async (status: 'draft' | 'approved' = 'draft') => {
  const root = await mkdtemp(path.join(tmpdir(), 'extension-prototype-'))
  temporaryRoots.push(root)
  const prototypeRoot = path.join(root, 'prototype')
  await mkdir(prototypeRoot)

  await writeFile(
    path.join(prototypeRoot, 'index.html'),
    `<!doctype html>
<html lang="en">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  </head>
  <body class="bg-white text-slate-950"><button type="button">Open panel</button></body>
</html>`,
  )

  await writeFile(
    path.join(prototypeRoot, 'coverage.md'),
    `# Prototype coverage

Prototype status: ${status}
Approved by: ${status === 'approved' ? 'Product owner' : ''}
Approved on: ${status === 'approved' ? '2026-08-30' : ''}

| Requirement | Surface | Interaction or state | Mock boundary | Review evidence |
| --- | --- | --- | --- | --- |
| Open the workspace | Action popup | Default and denied | Simulated Chrome API | Browser review |
`,
  )

  return root
}

const verify = (root: string, approved = false) =>
  execFileSync(
    process.execPath,
    [verifier, ...(approved ? ['--approved'] : [])],
    {
      cwd: root,
      encoding: 'utf8',
      stdio: 'pipe',
    },
  )

afterEach(async () => {
  await Promise.all(
    temporaryRoots
      .splice(0)
      .map((root) => rm(root, { recursive: true, force: true })),
  )
})

describe('prototype verifier', () => {
  it('accepts a complete draft and requires explicit approval for implementation', async () => {
    const draftRoot = await createPrototype()
    expect(verify(draftRoot)).toContain('human approval may still be pending')
    expect(() => verify(draftRoot, true)).toThrow()

    const approvedRoot = await createPrototype('approved')
    expect(verify(approvedRoot, true)).toContain(
      'Verified the approved functional prototype contract',
    )
  })

  it('rejects handwritten stylesheets', async () => {
    const root = await createPrototype()
    await writeFile(
      path.join(root, 'prototype', 'custom.css'),
      '.button { color: red; }',
    )
    expect(() => verify(root)).toThrow()
  })

  it('rejects styles written by inline scripts', async () => {
    const root = await createPrototype()
    const htmlPath = path.join(root, 'prototype', 'index.html')
    const html = await readFile(htmlPath, 'utf8')
    await writeFile(
      htmlPath,
      html.replace(
        '</body>',
        '<script>document.body.style.color = "red"</script></body>',
      ),
    )
    expect(() => verify(root)).toThrow()
  })
})
