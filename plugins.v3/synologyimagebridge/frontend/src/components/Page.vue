<script setup>
import { computed, onMounted, ref } from 'vue'

const props = defineProps({
  api: { type: Object, default: () => ({}) },
  pluginId: { type: String, default: '' },
  sourcePluginId: { type: String, default: '' },
  nativeSubscribe: { type: Function, default: null },
})

const emit = defineEmits(['action', 'switch', 'close'])

const loading = ref(false)
const clearing = ref(false)
const error = ref('')
const stats = ref({
  enabled: false,
  count: 0,
  size_bytes: 0,
  hits: 0,
  misses: 0,
  hit_rate: 0,
  written: 0,
  pruned: 0,
  last_cleanup: 0,
  retention_days: 0,
  max_size_mb: 0,
  allowed_hosts: [],
})
const entries = ref([])

const sizeText = computed(() => formatSize(stats.value.size_bytes || 0))
const hitRate = computed(() => `${Number(stats.value.hit_rate || 0).toFixed(1)}%`)
const capacityText = computed(() => `${stats.value.max_size_mb || 0} MB`)
const usagePercent = computed(() => {
  const limit = (stats.value.max_size_mb || 0) * 1024 * 1024
  if (!limit) return 0
  return Math.min(100, Math.round(((stats.value.size_bytes || 0) / limit) * 100))
})
const lastCleanup = computed(() =>
  stats.value.last_cleanup ? new Date(stats.value.last_cleanup * 1000).toLocaleString() : '尚未清理',
)

function formatSize(bytes) {
  const value = Number(bytes) || 0
  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`
  if (value < 1024 * 1024 * 1024) return `${(value / 1024 / 1024).toFixed(1)} MB`
  return `${(value / 1024 / 1024 / 1024).toFixed(2)} GB`
}

function formatTime(seconds) {
  return seconds ? new Date(seconds * 1000).toLocaleString() : '-'
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const base = `plugin/${props.pluginId}`
    const [statsData, entriesData] = await Promise.all([
      props.api.get(`${base}/stats`),
      props.api.get(`${base}/entries`, { params: { limit: 20 } }),
    ])
    if (statsData) stats.value = { ...stats.value, ...statsData }
    entries.value = Array.isArray(entriesData) ? entriesData : []
  } catch (err) {
    error.value = `读取缓存状态失败：${err?.message || err}`
  } finally {
    loading.value = false
  }
}

async function clearCache() {
  clearing.value = true
  error.value = ''
  try {
    await props.api.post(`plugin/${props.pluginId}/clear`)
    await load()
    emit('action')
  } catch (err) {
    error.value = `清理缓存失败：${err?.message || err}`
  } finally {
    clearing.value = false
  }
}

onMounted(load)
</script>

<template>
  <v-card class="bridge-page" rounded="lg" elevation="0">
    <div class="bridge-page__header">
      <div>
        <div class="bridge-page__title">
          <v-icon icon="mdi-image-multiple-outline" size="26" class="me-2" />
          群晖图片桥 · 缓存概览
        </div>
        <div class="bridge-page__subtitle">
          对外地址形如 <code>/img/&lt;摘要&gt;.jpg</code>，命中缓存时不再回源媒体服务器
        </div>
      </div>
      <div class="d-flex ga-2">
        <v-btn variant="text" size="small" prepend-icon="mdi-refresh" :loading="loading" @click="load">
          刷新
        </v-btn>
        <v-btn
          color="error"
          variant="tonal"
          size="small"
          prepend-icon="mdi-delete-sweep-outline"
          :loading="clearing"
          @click="clearCache"
        >
          清空缓存
        </v-btn>
      </div>
    </div>

    <v-card-text>
      <v-alert v-if="error" type="error" variant="tonal" density="comfortable" class="mb-4">
        {{ error }}
      </v-alert>
      <v-alert
        v-if="!stats.enabled"
        type="warning"
        variant="tonal"
        density="comfortable"
        class="mb-4"
      >
        插件当前未启用，图片网关不会响应请求。请到配置页开启。
      </v-alert>

      <v-row dense class="mb-2">
        <v-col cols="6" md="3">
          <div class="stat-card">
            <div class="stat-card__label">缓存图片</div>
            <div class="stat-card__value">{{ stats.count }}<span class="unit">张</span></div>
          </div>
        </v-col>
        <v-col cols="6" md="3">
          <div class="stat-card">
            <div class="stat-card__label">占用空间</div>
            <div class="stat-card__value">{{ sizeText }}</div>
          </div>
        </v-col>
        <v-col cols="6" md="3">
          <div class="stat-card">
            <div class="stat-card__label">命中率</div>
            <div class="stat-card__value">{{ hitRate }}</div>
            <div class="stat-card__sub">命中 {{ stats.hits }} / 未命中 {{ stats.misses }}</div>
          </div>
        </v-col>
        <v-col cols="6" md="3">
          <div class="stat-card">
            <div class="stat-card__label">上次清理</div>
            <div class="stat-card__value stat-card__value--small">{{ lastCleanup }}</div>
            <div class="stat-card__sub">累计清理 {{ stats.pruned }} 张</div>
          </div>
        </v-col>
      </v-row>

      <div class="d-flex flex-wrap align-center ga-2 mb-4">
        <v-chip size="small" variant="tonal" color="primary">保留 {{ stats.retention_days }} 天</v-chip>
        <v-chip size="small" variant="tonal">容量上限 {{ capacityText }}</v-chip>
        <v-chip size="small" variant="tonal">累计写入 {{ stats.written }} 张</v-chip>
      </div>

      <div class="mb-2 d-flex justify-space-between text-caption text-medium-emphasis">
        <span>容量占用</span>
        <span>{{ sizeText }} / {{ capacityText }}</span>
      </div>
      <v-progress-linear
        :model-value="usagePercent"
        :color="usagePercent > 90 ? 'error' : 'primary'"
        height="8"
        rounded
        class="mb-6"
      />

      <div class="text-subtitle-2 mb-2">最近写入的图片</div>
      <v-table v-if="entries.length" density="compact" class="entries-table">
        <thead>
          <tr>
            <th>文件名</th>
            <th class="text-end">大小</th>
            <th class="text-end">写入时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in entries" :key="item.name">
            <td class="mono">{{ item.name }}</td>
            <td class="text-end">{{ formatSize(item.size) }}</td>
            <td class="text-end">{{ formatTime(item.created) }}</td>
          </tr>
        </tbody>
      </v-table>
      <v-alert v-else type="info" variant="tonal" density="comfortable">
        暂无缓存。群晖首次取图后这里会出现记录。
      </v-alert>
    </v-card-text>

    <v-divider />
    <v-card-actions class="px-4 py-3">
      <v-btn variant="text" prepend-icon="mdi-cog-outline" @click="emit('switch')">查看配置</v-btn>
      <v-spacer />
      <v-btn variant="text" @click="emit('close')">关闭</v-btn>
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.bridge-page {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.bridge-page__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 20px;
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.16), rgba(0, 172, 193, 0.12));
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.bridge-page__title {
  display: flex;
  align-items: center;
  font-size: 1.15rem;
  font-weight: 600;
}

.bridge-page__subtitle {
  margin-top: 6px;
  font-size: 0.8rem;
  opacity: 0.75;
}

.stat-card {
  height: 100%;
  padding: 14px 16px;
  border-radius: 12px;
  background: rgba(var(--v-theme-surface-variant), 0.35);
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.stat-card__label {
  font-size: 0.75rem;
  opacity: 0.7;
}

.stat-card__value {
  margin-top: 6px;
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.2;
}

.stat-card__value--small {
  font-size: 0.95rem;
  font-weight: 500;
}

.stat-card__value .unit {
  margin-left: 4px;
  font-size: 0.85rem;
  font-weight: 400;
  opacity: 0.7;
}

.stat-card__sub {
  margin-top: 4px;
  font-size: 0.7rem;
  opacity: 0.6;
}

.entries-table .mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.75rem;
}
</style>
