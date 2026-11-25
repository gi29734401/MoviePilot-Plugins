import { b as _export_sfc, c as __mf_1, d as __mf_4, n as __mf_12, e as __mf_15, f as __mf_13, g as __mf_5, h as __mf_16, i as __mf_8, j as __mf_10, k as __mf_9, l as __mf_2, m as __mf_6, o as __mf_7, p as __mf_3, q as __mf_14 } from './_plugin-vue_export-helper-CBSFdLOB.js';

const _hoisted_1 = { class: "bridge-page__header" };
const _hoisted_2 = { class: "bridge-page__title" };
const _hoisted_3 = { class: "d-flex ga-2" };
const _hoisted_4 = { class: "stat-card" };
const _hoisted_5 = { class: "stat-card__value" };
const _hoisted_6 = { class: "stat-card" };
const _hoisted_7 = { class: "stat-card__value" };
const _hoisted_8 = { class: "stat-card" };
const _hoisted_9 = { class: "stat-card__value" };
const _hoisted_10 = { class: "stat-card__sub" };
const _hoisted_11 = { class: "stat-card" };
const _hoisted_12 = { class: "stat-card__value stat-card__value--small" };
const _hoisted_13 = { class: "stat-card__sub" };
const _hoisted_14 = { class: "d-flex flex-wrap align-center ga-2 mb-4" };
const _hoisted_15 = { class: "mb-2 d-flex justify-space-between text-caption text-medium-emphasis" };
const _hoisted_16 = { class: "mono" };
const _hoisted_17 = { class: "text-end" };
const _hoisted_18 = { class: "text-end" };


const _sfc_main = {
  __name: 'Page',
  props: {
  api: { type: Object, default: () => ({}) },
  pluginId: { type: String, default: '' },
  sourcePluginId: { type: String, default: '' },
  nativeSubscribe: { type: Function, default: null },
},
  emits: ['action', 'switch', 'close'],
  setup(__props, { emit: __emit }) {

const props = __props;

const emit = __emit;

const loading = __mf_1(false);
const clearing = __mf_1(false);
const error = __mf_1('');
const stats = __mf_1({
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
});
const entries = __mf_1([]);

const sizeText = __mf_4(() => formatSize(stats.value.size_bytes || 0));
const hitRate = __mf_4(() => `${Number(stats.value.hit_rate || 0).toFixed(1)}%`);
const capacityText = __mf_4(() => `${stats.value.max_size_mb || 0} MB`);
const usagePercent = __mf_4(() => {
  const limit = (stats.value.max_size_mb || 0) * 1024 * 1024;
  if (!limit) return 0
  return Math.min(100, Math.round(((stats.value.size_bytes || 0) / limit) * 100))
});
const lastCleanup = __mf_4(() =>
  stats.value.last_cleanup ? new Date(stats.value.last_cleanup * 1000).toLocaleString() : '尚未清理',
);

function formatSize(bytes) {
  const value = Number(bytes) || 0;
  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`
  if (value < 1024 * 1024 * 1024) return `${(value / 1024 / 1024).toFixed(1)} MB`
  return `${(value / 1024 / 1024 / 1024).toFixed(2)} GB`
}

function formatTime(seconds) {
  return seconds ? new Date(seconds * 1000).toLocaleString() : '-'
}

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const base = `plugin/${props.pluginId}`;
    const [statsData, entriesData] = await Promise.all([
      props.api.get(`${base}/stats`),
      props.api.get(`${base}/entries`, { params: { limit: 20 } }),
    ]);
    if (statsData) stats.value = { ...stats.value, ...statsData };
    entries.value = Array.isArray(entriesData) ? entriesData : [];
  } catch (err) {
    error.value = `读取缓存状态失败：${err?.message || err}`;
  } finally {
    loading.value = false;
  }
}

async function clearCache() {
  clearing.value = true;
  error.value = '';
  try {
    await props.api.post(`plugin/${props.pluginId}/clear`);
    await load();
    emit('action');
  } catch (err) {
    error.value = `清理缓存失败：${err?.message || err}`;
  } finally {
    clearing.value = false;
  }
}

__mf_12(load);

return (_ctx, _cache) => {
  const _component_v_icon = __mf_15("v-icon");
  const _component_v_btn = __mf_15("v-btn");
  const _component_v_alert = __mf_15("v-alert");
  const _component_v_col = __mf_15("v-col");
  const _component_v_row = __mf_15("v-row");
  const _component_v_chip = __mf_15("v-chip");
  const _component_v_progress_linear = __mf_15("v-progress-linear");
  const _component_v_table = __mf_15("v-table");
  const _component_v_card_text = __mf_15("v-card-text");
  const _component_v_divider = __mf_15("v-divider");
  const _component_v_spacer = __mf_15("v-spacer");
  const _component_v_card_actions = __mf_15("v-card-actions");
  const _component_v_card = __mf_15("v-card");

  return (__mf_13(), __mf_5(_component_v_card, {
    class: "bridge-page",
    rounded: "lg",
    elevation: "0"
  }, {
    default: __mf_16(() => [
      __mf_8("div", _hoisted_1, [
        __mf_8("div", null, [
          __mf_8("div", _hoisted_2, [
            __mf_10(_component_v_icon, {
              icon: "mdi-image-multiple-outline",
              size: "26",
              class: "me-2"
            }),
            _cache[2] || (_cache[2] = __mf_9(" 群晖图片桥 · 缓存概览 ", -1))
          ]),
          _cache[3] || (_cache[3] = __mf_8("div", { class: "bridge-page__subtitle" }, [
            __mf_9(" 对外地址形如 "),
            __mf_8("code", null, "/img/<摘要>.jpg"),
            __mf_9("，命中缓存时不再回源媒体服务器 ")
          ], -1))
        ]),
        __mf_8("div", _hoisted_3, [
          __mf_10(_component_v_btn, {
            variant: "text",
            size: "small",
            "prepend-icon": "mdi-refresh",
            loading: loading.value,
            onClick: load
          }, {
            default: __mf_16(() => [...(_cache[4] || (_cache[4] = [
              __mf_9(" 刷新 ", -1)
            ]))]),
            _: 1
          }, 8, ["loading"]),
          __mf_10(_component_v_btn, {
            color: "error",
            variant: "tonal",
            size: "small",
            "prepend-icon": "mdi-delete-sweep-outline",
            loading: clearing.value,
            onClick: clearCache
          }, {
            default: __mf_16(() => [...(_cache[5] || (_cache[5] = [
              __mf_9(" 清空缓存 ", -1)
            ]))]),
            _: 1
          }, 8, ["loading"])
        ])
      ]),
      __mf_10(_component_v_card_text, null, {
        default: __mf_16(() => [
          (error.value)
            ? (__mf_13(), __mf_5(_component_v_alert, {
                key: 0,
                type: "error",
                variant: "tonal",
                density: "comfortable",
                class: "mb-4"
              }, {
                default: __mf_16(() => [
                  __mf_9(__mf_2(error.value), 1)
                ]),
                _: 1
              }))
            : __mf_6("", true),
          (!stats.value.enabled)
            ? (__mf_13(), __mf_5(_component_v_alert, {
                key: 1,
                type: "warning",
                variant: "tonal",
                density: "comfortable",
                class: "mb-4"
              }, {
                default: __mf_16(() => [...(_cache[6] || (_cache[6] = [
                  __mf_9(" 插件当前未启用，图片网关不会响应请求。请到配置页开启。 ", -1)
                ]))]),
                _: 1
              }))
            : __mf_6("", true),
          __mf_10(_component_v_row, {
            dense: "",
            class: "mb-2"
          }, {
            default: __mf_16(() => [
              __mf_10(_component_v_col, {
                cols: "6",
                md: "3"
              }, {
                default: __mf_16(() => [
                  __mf_8("div", _hoisted_4, [
                    _cache[8] || (_cache[8] = __mf_8("div", { class: "stat-card__label" }, "缓存图片", -1)),
                    __mf_8("div", _hoisted_5, [
                      __mf_9(__mf_2(stats.value.count), 1),
                      _cache[7] || (_cache[7] = __mf_8("span", { class: "unit" }, "张", -1))
                    ])
                  ])
                ]),
                _: 1
              }),
              __mf_10(_component_v_col, {
                cols: "6",
                md: "3"
              }, {
                default: __mf_16(() => [
                  __mf_8("div", _hoisted_6, [
                    _cache[9] || (_cache[9] = __mf_8("div", { class: "stat-card__label" }, "占用空间", -1)),
                    __mf_8("div", _hoisted_7, __mf_2(sizeText.value), 1)
                  ])
                ]),
                _: 1
              }),
              __mf_10(_component_v_col, {
                cols: "6",
                md: "3"
              }, {
                default: __mf_16(() => [
                  __mf_8("div", _hoisted_8, [
                    _cache[10] || (_cache[10] = __mf_8("div", { class: "stat-card__label" }, "命中率", -1)),
                    __mf_8("div", _hoisted_9, __mf_2(hitRate.value), 1),
                    __mf_8("div", _hoisted_10, "命中 " + __mf_2(stats.value.hits) + " / 未命中 " + __mf_2(stats.value.misses), 1)
                  ])
                ]),
                _: 1
              }),
              __mf_10(_component_v_col, {
                cols: "6",
                md: "3"
              }, {
                default: __mf_16(() => [
                  __mf_8("div", _hoisted_11, [
                    _cache[11] || (_cache[11] = __mf_8("div", { class: "stat-card__label" }, "上次清理", -1)),
                    __mf_8("div", _hoisted_12, __mf_2(lastCleanup.value), 1),
                    __mf_8("div", _hoisted_13, "累计清理 " + __mf_2(stats.value.pruned) + " 张", 1)
                  ])
                ]),
                _: 1
              })
            ]),
            _: 1
          }),
          __mf_8("div", _hoisted_14, [
            __mf_10(_component_v_chip, {
              size: "small",
              variant: "tonal",
              color: "primary"
            }, {
              default: __mf_16(() => [
                __mf_9("保留 " + __mf_2(stats.value.retention_days) + " 天", 1)
              ]),
              _: 1
            }),
            __mf_10(_component_v_chip, {
              size: "small",
              variant: "tonal"
            }, {
              default: __mf_16(() => [
                __mf_9("容量上限 " + __mf_2(capacityText.value), 1)
              ]),
              _: 1
            }),
            __mf_10(_component_v_chip, {
              size: "small",
              variant: "tonal"
            }, {
              default: __mf_16(() => [
                __mf_9("累计写入 " + __mf_2(stats.value.written) + " 张", 1)
              ]),
              _: 1
            })
          ]),
          __mf_8("div", _hoisted_15, [
            _cache[12] || (_cache[12] = __mf_8("span", null, "容量占用", -1)),
            __mf_8("span", null, __mf_2(sizeText.value) + " / " + __mf_2(capacityText.value), 1)
          ]),
          __mf_10(_component_v_progress_linear, {
            "model-value": usagePercent.value,
            color: usagePercent.value > 90 ? 'error' : 'primary',
            height: "8",
            rounded: "",
            class: "mb-6"
          }, null, 8, ["model-value", "color"]),
          _cache[15] || (_cache[15] = __mf_8("div", { class: "text-subtitle-2 mb-2" }, "最近写入的图片", -1)),
          (entries.value.length)
            ? (__mf_13(), __mf_5(_component_v_table, {
                key: 2,
                density: "compact",
                class: "entries-table"
              }, {
                default: __mf_16(() => [
                  _cache[13] || (_cache[13] = __mf_8("thead", null, [
                    __mf_8("tr", null, [
                      __mf_8("th", null, "文件名"),
                      __mf_8("th", { class: "text-end" }, "大小"),
                      __mf_8("th", { class: "text-end" }, "写入时间")
                    ])
                  ], -1)),
                  __mf_8("tbody", null, [
                    (__mf_13(true), __mf_7(__mf_3, null, __mf_14(entries.value, (item) => {
                      return (__mf_13(), __mf_7("tr", {
                        key: item.name
                      }, [
                        __mf_8("td", _hoisted_16, __mf_2(item.name), 1),
                        __mf_8("td", _hoisted_17, __mf_2(formatSize(item.size)), 1),
                        __mf_8("td", _hoisted_18, __mf_2(formatTime(item.created)), 1)
                      ]))
                    }), 128))
                  ])
                ]),
                _: 1
              }))
            : (__mf_13(), __mf_5(_component_v_alert, {
                key: 3,
                type: "info",
                variant: "tonal",
                density: "comfortable"
              }, {
                default: __mf_16(() => [...(_cache[14] || (_cache[14] = [
                  __mf_9(" 暂无缓存。群晖首次取图后这里会出现记录。 ", -1)
                ]))]),
                _: 1
              }))
        ]),
        _: 1
      }),
      __mf_10(_component_v_divider),
      __mf_10(_component_v_card_actions, { class: "px-4 py-3" }, {
        default: __mf_16(() => [
          __mf_10(_component_v_btn, {
            variant: "text",
            "prepend-icon": "mdi-cog-outline",
            onClick: _cache[0] || (_cache[0] = $event => (emit('switch')))
          }, {
            default: __mf_16(() => [...(_cache[16] || (_cache[16] = [
              __mf_9("查看配置", -1)
            ]))]),
            _: 1
          }),
          __mf_10(_component_v_spacer),
          __mf_10(_component_v_btn, {
            variant: "text",
            onClick: _cache[1] || (_cache[1] = $event => (emit('close')))
          }, {
            default: __mf_16(() => [...(_cache[17] || (_cache[17] = [
              __mf_9("关闭", -1)
            ]))]),
            _: 1
          })
        ]),
        _: 1
      })
    ]),
    _: 1
  }))
}
}

};
const Page = /*#__PURE__*/_export_sfc(_sfc_main, [['__scopeId',"data-v-d749f597"]]);

export { Page as default };
