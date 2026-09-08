import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const nativePackagePath = require.resolve('@typescript/native/package.json')
const compatibilityPackagePath = require.resolve('typescript/package.json')
const [nativePackage, compatibilityPackage] = await Promise.all([
  readPackage(nativePackagePath),
  readPackage(compatibilityPackagePath),
])
assertMajor(nativePackage.version, 7, 'TypeScript compiler package')
assertMajor(compatibilityPackage.version, 6, 'TypeScript tooling API')
assertBinary(nativePackage, 'tsc', 'TypeScript compiler package')
assertBinary(compatibilityPackage, 'tsc6', 'TypeScript tooling API')

console.log(
  `Verified TypeScript ${nativePackage.version} compiler with TypeScript ${compatibilityPackage.version} tooling compatibility.`,
)

async function readPackage(path) {
  return JSON.parse(await readFile(path, 'utf8'))
}

function assertMajor(version, expected, label) {
  if (!version.startsWith(`${expected}.`)) {
    throw new Error(`Expected ${label} ${expected}.x, received ${version}.`)
  }
}

function assertBinary(packageJson, binary, label) {
  if (!packageJson.bin?.[binary]) {
    throw new Error(`Expected ${label} to expose the ${binary} binary.`)
  }
}
