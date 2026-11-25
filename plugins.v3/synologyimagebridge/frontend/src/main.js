import { createApp, h } from 'vue'
import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import Config from './components/Config.vue'

// 仅本地预览用：宿主环境下由 MoviePilot 加载联邦组件，不经过此入口
const vuetify = createVuetify()

createApp({
  render: () =>
    h(Config, {
      initialConfig: { enabled: true, retention_days: 7, max_size_mb: 512, extra_hosts: '' },
      pluginId: 'SynologyImageBridge',
      api: { get: async () => ({}), post: async () => ({}) },
    }),
})
  .use(vuetify)
  .mount('#app')
