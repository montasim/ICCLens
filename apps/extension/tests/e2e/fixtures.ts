import { chromium, test as base, type BrowserContext } from '@playwright/test'
import path from 'node:path'

type ExtensionFixtures = {
  context: BrowserContext
  extensionId: string
}

export const test = base.extend<ExtensionFixtures>({
  context: async ({}, use) => {
    const extensionPath = path.resolve('../../.output')
    const context = await chromium.launchPersistentContext('', {
      channel: 'chromium',
      headless: true,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
      ],
    })
    await use(context)
    await context.close()
  },
  extensionId: async ({ context }, use) => {
    let serviceWorker = context.serviceWorkers()[0]
    serviceWorker ??= await context.waitForEvent('serviceworker')
    await use(new URL(serviceWorker.url()).host)
  },
})

export const expect = test.expect
