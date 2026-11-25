<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  initialConfig: { type: Object, default: () => ({}) },
  api: { type: Object, default: () => ({}) },
  pluginId: { type: String, default: '' },
  sourcePluginId: { type: String, default: '' },
  nativeSubscribe: { type: Function, default: null },
})

const emit = defineEmits(['save', 'close', 'switch'])

const config = ref({
  enabled: props.initialConfig?.enabled ?? false,
  retention_days: props.initialConfig?.retention_days ?? 7,
  max_size_mb: props.initialConfig?.max_size_mb ?? 512,
  extra_hosts: props.initialConfig?.extra_hosts ?? '',
})

const saving = ref(false)
const savedHint = ref('')

const hostLines = computed(() =>
  String(config.value.extra_hosts || '')
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean),
)

const estimated = computed(() => {
  const days = Number(config.value.retention_days) || 0
  const cap = Number(config.value.max_size_mb) || 0
  return `保留 ${days} 天，容量上限 ${cap} MB（超过上限时优先删除最旧的图片）`
})

function save() {
  saving.value = true
  const payload = {
    enabled: !!config.value.enabled,
    retention_days: Number(config.value.retention_days) || 7,
    max_size_mb: Number(config.value.max_size_mb) || 512,
    extra_hosts: hostLines.value.join('\n'),
  }
  emit('save', payload)
  setTimeout(() => {
    saving.value = false
    savedHint.value = '配置已提交，稍候可在详情页确认缓存状态'
  }, 400)
}
</script>

<template>
  <v-card class="bridge-config" rounded="lg" elevation="0">
    <div class="bridge-config__header">
      <div class="bridge-config__title">
        <v-icon icon="mdi-image-multiple-outline" size="26" class="me-2" />
        群晖图片桥
      </div>
      <div class="bridge-config__subtitle">
        为 Synology Chat 等渠道提供带扩展名、免登录的图片地址：原图落盘缓存，按天数与容量自动清理
      </div>
    </div>

    <v-card-text class="pt-4">
      <v-alert type="info" variant="tonal" density="comfortable" class="mb-4">
        Synology Chat 的 incoming webhook 只接受<strong>路径以图片扩展名结尾</strong>的
        <code>file_url</code>，否则整条消息返回 <code>error 117</code> 并被丢弃。本插件把媒体服务器原图缓存到本地，
        对外提供 <code>/img/&lt;摘要&gt;.jpg</code> 形式的匿名地址。
      </v-alert>

      <v-switch
        v-model="config.enabled"
        color="primary"
        inset
        hide-details
        label="启用插件"
        class="mb-4"
      />

      <v-row dense>
        <v-col cols="12" md="6">
          <v-text-field
            v-model.number="config.retention_days"
            type="number"
            min="1"
            max="365"
            label="缓存保留天数"
            hint="超过该天数的图片会被自动清理"
            persistent-hint
            variant="outlined"
            density="comfortable"
          >
            <template #append-inner>
              <span class="text-caption text-medium-emphasis">天</span>
            </template>
          </v-text-field>
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            v-model.number="config.max_size_mb"
            type="number"
            min="16"
            max="20480"
            label="缓存容量上限"
            hint="超过上限时按写入时间从旧到新删除"
            persistent-hint
            variant="outlined"
            density="comfortable"
          >
            <template #append-inner>
              <span class="text-caption text-medium-emphasis">MB</span>
            </template>
          </v-text-field>
        </v-col>
      </v-row>

      <v-textarea
        v-model="config.extra_hosts"
        label="额外允许的图片主机（可选）"
        hint="每行一个主机名，例如 emby.example.com；已配置的媒体服务器主机默认自动允许"
        persistent-hint
        variant="outlined"
        rows="3"
        class="mt-2"
      />

      <div class="d-flex flex-wrap align-center ga-2 mt-4">
        <v-chip size="small" variant="tonal" color="primary">{{ estimated }}</v-chip>
        <v-chip size="small" variant="tonal">已允许主机 {{ hostLines.length }} 个自定义</v-chip>
        <v-chip v-if="savedHint" size="small" variant="tonal" color="success">{{ savedHint }}</v-chip>
      </div>
    </v-card-text>

    <v-divider />

    <v-card-actions class="px-4 py-3">
      <v-btn color="primary" variant="flat" :loading="saving" @click="save">保存配置</v-btn>
      <v-btn variant="text" prepend-icon="mdi-chart-box-outline" @click="emit('switch')">查看缓存状态</v-btn>
      <v-spacer />
      <v-btn variant="text" @click="emit('close')">关闭</v-btn>
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.bridge-config {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.bridge-config__header {
  padding: 18px 20px;
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.16), rgba(0, 172, 193, 0.12));
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.bridge-config__title {
  display: flex;
  align-items: center;
  font-size: 1.15rem;
  font-weight: 600;
}

.bridge-config__subtitle {
  margin-top: 6px;
  font-size: 0.8rem;
  line-height: 1.5;
  opacity: 0.75;
}
</style>
