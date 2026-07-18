// @ts-check
import withNuxt from './node_modules/.cache/nuxt/.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    // Self-contained apps under projects/ have their own toolchain
    ignores: ['projects/**'],
  },
)
