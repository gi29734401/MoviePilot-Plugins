import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { federation } from '@module-federation/vite'

// 产物直接落到插件运行目录，宿主按 get_render_mode() 的 "dist/assets" 加载 remoteEntry.js
export default defineConfig({
  plugins: [
    vue(),
    federation({
      name: 'SynologyImageBridge',
      filename: 'assets/remoteEntry.js',
      exposes: {
        './Config': './src/components/Config.vue',
        './Page': './src/components/Page.vue',
      },
      dts: false,
      shared: {
        vue: { requiredVersion: false, import: false },
        vuetify: { requiredVersion: false, import: false, singleton: true },
        'vuetify/styles': { requiredVersion: false, import: false, singleton: true },
      },
    }),
  ],
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: true,
    outDir: '../plugins.v3/synologyimagebridge/dist',
    emptyOutDir: true,
  },
  css: {
    postcss: {
      plugins: [
        {
          postcssPlugin: 'internal:charset-removal',
          AtRule: {
            charset: (atRule) => {
              if (atRule.name === 'charset') atRule.remove()
            },
          },
        },
        {
          postcssPlugin: 'vuetify-filter',
          Root(root) {
            root.walkRules((rule) => {
              if (rule.selector && (rule.selector.includes('.v-') || rule.selector.includes('.mdi-'))) {
                rule.remove()
              }
            })
          },
        },
      ],
    },
  },
})
