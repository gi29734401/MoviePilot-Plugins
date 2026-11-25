import { b as _export_sfc, c as __mf_1, d as __mf_4, e as __mf_15, f as __mf_13, g as __mf_5, h as __mf_16, i as __mf_8, j as __mf_10, k as __mf_9, l as __mf_2, m as __mf_6 } from './_plugin-vue_export-helper-CBSFdLOB.js';

const _hoisted_1 = { class: "bridge-config__header" };
const _hoisted_2 = { class: "bridge-config__title" };
const _hoisted_3 = { class: "d-flex flex-wrap align-center ga-2 mt-4" };


const _sfc_main = {
  __name: 'Config',
  props: {
  initialConfig: { type: Object, default: () => ({}) },
  api: { type: Object, default: () => ({}) },
  pluginId: { type: String, default: '' },
  sourcePluginId: { type: String, default: '' },
  nativeSubscribe: { type: Function, default: null },
},
  emits: ['save', 'close', 'switch'],
  setup(__props, { emit: __emit }) {

const props = __props;

const emit = __emit;

const config = __mf_1({
  enabled: props.initialConfig?.enabled ?? false,
  retention_days: props.initialConfig?.retention_days ?? 7,
  max_size_mb: props.initialConfig?.max_size_mb ?? 512,
  extra_hosts: props.initialConfig?.extra_hosts ?? '',
});

const saving = __mf_1(false);
const savedHint = __mf_1('');

const hostLines = __mf_4(() =>
  String(config.value.extra_hosts || '')
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean),
);

const estimated = __mf_4(() => {
  const days = Number(config.value.retention_days) || 0;
  const cap = Number(config.value.max_size_mb) || 0;
  return `保留 ${days} 天，容量上限 ${cap} MB（超过上限时优先删除最旧的图片）`
});

function save() {
  saving.value = true;
  const payload = {
    enabled: !!config.value.enabled,
    retention_days: Number(config.value.retention_days) || 7,
    max_size_mb: Number(config.value.max_size_mb) || 512,
    extra_hosts: hostLines.value.join('\n'),
  };
  emit('save', payload);
  setTimeout(() => {
    saving.value = false;
    savedHint.value = '配置已提交，稍候可在详情页确认缓存状态';
  }, 400);
}

return (_ctx, _cache) => {
  const _component_v_icon = __mf_15("v-icon");
  const _component_v_alert = __mf_15("v-alert");
  const _component_v_switch = __mf_15("v-switch");
  const _component_v_text_field = __mf_15("v-text-field");
  const _component_v_col = __mf_15("v-col");
  const _component_v_row = __mf_15("v-row");
  const _component_v_textarea = __mf_15("v-textarea");
  const _component_v_chip = __mf_15("v-chip");
  const _component_v_card_text = __mf_15("v-card-text");
  const _component_v_divider = __mf_15("v-divider");
  const _component_v_btn = __mf_15("v-btn");
  const _component_v_spacer = __mf_15("v-spacer");
  const _component_v_card_actions = __mf_15("v-card-actions");
  const _component_v_card = __mf_15("v-card");

  return (__mf_13(), __mf_5(_component_v_card, {
    class: "bridge-config",
    rounded: "lg",
    elevation: "0"
  }, {
    default: __mf_16(() => [
      __mf_8("div", _hoisted_1, [
        __mf_8("div", _hoisted_2, [
          __mf_10(_component_v_icon, {
            icon: "mdi-image-multiple-outline",
            size: "26",
            class: "me-2"
          }),
          _cache[6] || (_cache[6] = __mf_9(" 群晖图片桥 ", -1))
        ]),
        _cache[7] || (_cache[7] = __mf_8("div", { class: "bridge-config__subtitle" }, " 为 Synology Chat 等渠道提供带扩展名、免登录的图片地址：原图落盘缓存，按天数与容量自动清理 ", -1))
      ]),
      __mf_10(_component_v_card_text, { class: "pt-4" }, {
        default: __mf_16(() => [
          __mf_10(_component_v_alert, {
            type: "info",
            variant: "tonal",
            density: "comfortable",
            class: "mb-4"
          }, {
            default: __mf_16(() => [...(_cache[8] || (_cache[8] = [
              __mf_9(" Synology Chat 的 incoming webhook 只接受", -1),
              __mf_8("strong", null, "路径以图片扩展名结尾", -1),
              __mf_9("的 ", -1),
              __mf_8("code", null, "file_url", -1),
              __mf_9("，否则整条消息返回 ", -1),
              __mf_8("code", null, "error 117", -1),
              __mf_9(" 并被丢弃。本插件把媒体服务器原图缓存到本地， 对外提供 ", -1),
              __mf_8("code", null, "/img/<摘要>.jpg", -1),
              __mf_9(" 形式的匿名地址。 ", -1)
            ]))]),
            _: 1
          }),
          __mf_10(_component_v_switch, {
            modelValue: config.value.enabled,
            "onUpdate:modelValue": _cache[0] || (_cache[0] = $event => ((config.value.enabled) = $event)),
            color: "primary",
            inset: "",
            "hide-details": "",
            label: "启用插件",
            class: "mb-4"
          }, null, 8, ["modelValue"]),
          __mf_10(_component_v_row, { dense: "" }, {
            default: __mf_16(() => [
              __mf_10(_component_v_col, {
                cols: "12",
                md: "6"
              }, {
                default: __mf_16(() => [
                  __mf_10(_component_v_text_field, {
                    modelValue: config.value.retention_days,
                    "onUpdate:modelValue": _cache[1] || (_cache[1] = $event => ((config.value.retention_days) = $event)),
                    modelModifiers: { number: true },
                    type: "number",
                    min: "1",
                    max: "365",
                    label: "缓存保留天数",
                    hint: "超过该天数的图片会被自动清理",
                    "persistent-hint": "",
                    variant: "outlined",
                    density: "comfortable"
                  }, {
                    "append-inner": __mf_16(() => [...(_cache[9] || (_cache[9] = [
                      __mf_8("span", { class: "text-caption text-medium-emphasis" }, "天", -1)
                    ]))]),
                    _: 1
                  }, 8, ["modelValue"])
                ]),
                _: 1
              }),
              __mf_10(_component_v_col, {
                cols: "12",
                md: "6"
              }, {
                default: __mf_16(() => [
                  __mf_10(_component_v_text_field, {
                    modelValue: config.value.max_size_mb,
                    "onUpdate:modelValue": _cache[2] || (_cache[2] = $event => ((config.value.max_size_mb) = $event)),
                    modelModifiers: { number: true },
                    type: "number",
                    min: "16",
                    max: "20480",
                    label: "缓存容量上限",
                    hint: "超过上限时按写入时间从旧到新删除",
                    "persistent-hint": "",
                    variant: "outlined",
                    density: "comfortable"
                  }, {
                    "append-inner": __mf_16(() => [...(_cache[10] || (_cache[10] = [
                      __mf_8("span", { class: "text-caption text-medium-emphasis" }, "MB", -1)
                    ]))]),
                    _: 1
                  }, 8, ["modelValue"])
                ]),
                _: 1
              })
            ]),
            _: 1
          }),
          __mf_10(_component_v_textarea, {
            modelValue: config.value.extra_hosts,
            "onUpdate:modelValue": _cache[3] || (_cache[3] = $event => ((config.value.extra_hosts) = $event)),
            label: "额外允许的图片主机（可选）",
            hint: "每行一个主机名，例如 emby.example.com；已配置的媒体服务器主机默认自动允许",
            "persistent-hint": "",
            variant: "outlined",
            rows: "3",
            class: "mt-2"
          }, null, 8, ["modelValue"]),
          __mf_8("div", _hoisted_3, [
            __mf_10(_component_v_chip, {
              size: "small",
              variant: "tonal",
              color: "primary"
            }, {
              default: __mf_16(() => [
                __mf_9(__mf_2(estimated.value), 1)
              ]),
              _: 1
            }),
            __mf_10(_component_v_chip, {
              size: "small",
              variant: "tonal"
            }, {
              default: __mf_16(() => [
                __mf_9("已允许主机 " + __mf_2(hostLines.value.length) + " 个自定义", 1)
              ]),
              _: 1
            }),
            (savedHint.value)
              ? (__mf_13(), __mf_5(_component_v_chip, {
                  key: 0,
                  size: "small",
                  variant: "tonal",
                  color: "success"
                }, {
                  default: __mf_16(() => [
                    __mf_9(__mf_2(savedHint.value), 1)
                  ]),
                  _: 1
                }))
              : __mf_6("", true)
          ])
        ]),
        _: 1
      }),
      __mf_10(_component_v_divider),
      __mf_10(_component_v_card_actions, { class: "px-4 py-3" }, {
        default: __mf_16(() => [
          __mf_10(_component_v_btn, {
            color: "primary",
            variant: "flat",
            loading: saving.value,
            onClick: save
          }, {
            default: __mf_16(() => [...(_cache[11] || (_cache[11] = [
              __mf_9("保存配置", -1)
            ]))]),
            _: 1
          }, 8, ["loading"]),
          __mf_10(_component_v_btn, {
            variant: "text",
            "prepend-icon": "mdi-chart-box-outline",
            onClick: _cache[4] || (_cache[4] = $event => (emit('switch')))
          }, {
            default: __mf_16(() => [...(_cache[12] || (_cache[12] = [
              __mf_9("查看缓存状态", -1)
            ]))]),
            _: 1
          }),
          __mf_10(_component_v_spacer),
          __mf_10(_component_v_btn, {
            variant: "text",
            onClick: _cache[5] || (_cache[5] = $event => (emit('close')))
          }, {
            default: __mf_16(() => [...(_cache[13] || (_cache[13] = [
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
const Config = /*#__PURE__*/_export_sfc(_sfc_main, [['__scopeId',"data-v-d1a282c8"]]);

export { Config as default };
