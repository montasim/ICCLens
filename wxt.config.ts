import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type WxtViteConfig } from 'wxt'
import product from './product.config.json'

const icons = {
  16: 'icon/16.png',
  32: 'icon/32.png',
  48: 'icon/48.png',
  128: 'icon/128.png',
}

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  vite: (): WxtViteConfig => ({
    plugins: tailwindcss() as NonNullable<WxtViteConfig['plugins']>,
  }),
  manifest: {
    name: product.name,
    short_name: product.shortName,
    description: product.description,
    minimum_chrome_version: '120',
    permissions: ['storage'],
    web_accessible_resources: [
      {
        resources: ['logo.svg'],
        matches: ['http://10.16.100.244/*'],
      },
    ],
    action: {
      default_title: `Control ${product.name}`,
      default_icon: icons,
    },
    icons,
  },
})
