import { _ as __mf_0$1, a as __mf_11 } from './_plugin-vue_export-helper-CBSFdLOB.js';
import Config from './Config-Dnc1_mi9.js';

true&&(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
}());

const __mfPromiseGlobalKey$1 = "__mf_init__virtual:mf:__mfe_internal__SynologyImageBridge__mf_owner__170490178608142__mf_v__runtimeInit__mf_v__.js__";
let __mfPromiseState$1 = globalThis[__mfPromiseGlobalKey$1];
if (!__mfPromiseState$1) {
  let initResolve, initReject;
  const initPromise = new Promise((re, rj) => {
    initResolve = re;
    initReject = rj;
  });
  __mfPromiseState$1 = globalThis[__mfPromiseGlobalKey$1] = {
    initPromise,
    initResolve,
    initReject,
  };
  
}
const initPromise$1 = __mfPromiseState$1.initPromise;

    
const __mfCacheGlobalKey$1 = "__mf_module_cache__";
globalThis[__mfCacheGlobalKey$1] ||= { share: {}, remote: {} };
globalThis[__mfCacheGlobalKey$1].share ||= {};
globalThis[__mfCacheGlobalKey$1].remote ||= {};
const __mfModuleCache$1 = globalThis[__mfCacheGlobalKey$1];
const __mfTrackPendingShareLoad$1 = (promise) => {
  const pendingShareLoads = (__mfModuleCache$1.pendingShareLoads ||= []);
  pendingShareLoads.push(promise);
  const cleanup = () => {
    const index = pendingShareLoads.indexOf(promise);
    if (index !== -1) pendingShareLoads.splice(index, 1);
  };
  void promise.then(cleanup, cleanup);
  return promise;
};
for (const __mfShareKey of Object.keys(__mfModuleCache$1.share)) {
  if (__mfShareKey.startsWith("default:")) {
    const __mfLegacyShareKey = __mfShareKey.slice("default:".length);
    if (__mfModuleCache$1.share[__mfLegacyShareKey] === undefined) {
      __mfModuleCache$1.share[__mfLegacyShareKey] = __mfModuleCache$1.share[__mfShareKey];
    }
  } else if (!__mfShareKey.includes(":")) {
    const __mfDefaultShareKey = "default:" + __mfShareKey;
    if (__mfModuleCache$1.share[__mfDefaultShareKey] === undefined) {
      __mfModuleCache$1.share[__mfDefaultShareKey] = __mfModuleCache$1.share[__mfShareKey];
    }
  }
}
          const __mfReadSharedCache$1 = (cache, descriptor) => {
            const value = cache[descriptor.canonical];
            if (value !== undefined) return value;
            const aliases = descriptor.aliases || [];
            for (const alias of aliases) {
              if (!Object.prototype.hasOwnProperty.call(cache, alias)) continue;
              const aliasValue = cache[alias];
              if (aliasValue !== undefined) {
                cache[descriptor.canonical] = aliasValue;
                return aliasValue;
              }
            }
            return undefined;
          };
          const __mfSharedCacheListenersKey$1 = Symbol.for("module-federation.shared-cache-listeners");
          const __mfGetSharedCacheListeners$1 = (cache) => {
            let listeners = cache[__mfSharedCacheListenersKey$1];
            if (listeners === undefined) {
              listeners = Object.create(null);
              Object.defineProperty(cache, __mfSharedCacheListenersKey$1, {
                value: listeners,
                enumerable: false,
                configurable: false,
                writable: false
              });
            }
            return listeners;
          };
          const __mfSubscribeSharedCache$1 = (cache, descriptor, listener) => {
            const listeners = __mfGetSharedCacheListeners$1(cache);
            (listeners[descriptor.canonical] ||= new Set()).add(listener);
          };
    let __mf_0;
    const __mfApplyHostProvidedExports$1 = (exportModule) => {
      __mf_0 = exportModule["createVuetify"];
      exportModule.default ?? exportModule;
    };
    let exportModule$1 = __mfReadSharedCache$1(__mfModuleCache$1.share, {"canonical":"default:vuetify","aliases":["vuetify"]});
    if (exportModule$1 === undefined) {
      __mfSubscribeSharedCache$1(__mfModuleCache$1.share, {"canonical":"default:vuetify"}, (mod) => {
        exportModule$1 = mod;
        __mfApplyHostProvidedExports$1(mod);
      });
      __mfTrackPendingShareLoad$1(initPromise$1.then(() => {
        exportModule$1 = __mfReadSharedCache$1(__mfModuleCache$1.share, {"canonical":"default:vuetify","aliases":["vuetify"]});
        // A share init() left to its dynamic import is normally bridged before that import runs;
        // bridge it here when this wrapper is reached another way.
        if (exportModule$1 === undefined && typeof __mfPromiseState$1.loadLazyShares === "function") {
          return __mfPromiseState$1.loadLazyShares(["vuetify"]).then(() => {
            exportModule$1 = __mfReadSharedCache$1(__mfModuleCache$1.share, {"canonical":"default:vuetify","aliases":["vuetify"]});
          });
        }
      }).then(() => {
        if (exportModule$1 === undefined) {
          throw new Error("[Module Federation] Shared module vuetify was imported before federation bootstrap finished.");
        }
        __mfApplyHostProvidedExports$1(exportModule$1);
      }));
    } else {
      __mfApplyHostProvidedExports$1(exportModule$1);
    }

const __mfPromiseGlobalKey = "__mf_init__virtual:mf:__mfe_internal__SynologyImageBridge__mf_owner__170490178608142__mf_v__runtimeInit__mf_v__.js__";
let __mfPromiseState = globalThis[__mfPromiseGlobalKey];
if (!__mfPromiseState) {
  let initResolve, initReject;
  const initPromise = new Promise((re, rj) => {
    initResolve = re;
    initReject = rj;
  });
  __mfPromiseState = globalThis[__mfPromiseGlobalKey] = {
    initPromise,
    initResolve,
    initReject,
  };
  
}
const initPromise = __mfPromiseState.initPromise;

    
const __mfCacheGlobalKey = "__mf_module_cache__";
globalThis[__mfCacheGlobalKey] ||= { share: {}, remote: {} };
globalThis[__mfCacheGlobalKey].share ||= {};
globalThis[__mfCacheGlobalKey].remote ||= {};
const __mfModuleCache = globalThis[__mfCacheGlobalKey];
const __mfTrackPendingShareLoad = (promise) => {
  const pendingShareLoads = (__mfModuleCache.pendingShareLoads ||= []);
  pendingShareLoads.push(promise);
  const cleanup = () => {
    const index = pendingShareLoads.indexOf(promise);
    if (index !== -1) pendingShareLoads.splice(index, 1);
  };
  void promise.then(cleanup, cleanup);
  return promise;
};
for (const __mfShareKey of Object.keys(__mfModuleCache.share)) {
  if (__mfShareKey.startsWith("default:")) {
    const __mfLegacyShareKey = __mfShareKey.slice("default:".length);
    if (__mfModuleCache.share[__mfLegacyShareKey] === undefined) {
      __mfModuleCache.share[__mfLegacyShareKey] = __mfModuleCache.share[__mfShareKey];
    }
  } else if (!__mfShareKey.includes(":")) {
    const __mfDefaultShareKey = "default:" + __mfShareKey;
    if (__mfModuleCache.share[__mfDefaultShareKey] === undefined) {
      __mfModuleCache.share[__mfDefaultShareKey] = __mfModuleCache.share[__mfShareKey];
    }
  }
}
          const __mfReadSharedCache = (cache, descriptor) => {
            const value = cache[descriptor.canonical];
            if (value !== undefined) return value;
            const aliases = descriptor.aliases || [];
            for (const alias of aliases) {
              if (!Object.prototype.hasOwnProperty.call(cache, alias)) continue;
              const aliasValue = cache[alias];
              if (aliasValue !== undefined) {
                cache[descriptor.canonical] = aliasValue;
                return aliasValue;
              }
            }
            return undefined;
          };
          const __mfSharedCacheListenersKey = Symbol.for("module-federation.shared-cache-listeners");
          const __mfGetSharedCacheListeners = (cache) => {
            let listeners = cache[__mfSharedCacheListenersKey];
            if (listeners === undefined) {
              listeners = Object.create(null);
              Object.defineProperty(cache, __mfSharedCacheListenersKey, {
                value: listeners,
                enumerable: false,
                configurable: false,
                writable: false
              });
            }
            return listeners;
          };
          const __mfSubscribeSharedCache = (cache, descriptor, listener) => {
            const listeners = __mfGetSharedCacheListeners(cache);
            (listeners[descriptor.canonical] ||= new Set()).add(listener);
          };
    const __mfApplyHostProvidedExports = (exportModule) => {
      exportModule.default ?? exportModule;
    };
    let exportModule = __mfReadSharedCache(__mfModuleCache.share, {"canonical":"default:vuetify/styles","aliases":["vuetify/styles"]});
    if (exportModule === undefined) {
      __mfSubscribeSharedCache(__mfModuleCache.share, {"canonical":"default:vuetify/styles"}, (mod) => {
        exportModule = mod;
        __mfApplyHostProvidedExports(mod);
      });
      __mfTrackPendingShareLoad(initPromise.then(() => {
        exportModule = __mfReadSharedCache(__mfModuleCache.share, {"canonical":"default:vuetify/styles","aliases":["vuetify/styles"]});
        // A share init() left to its dynamic import is normally bridged before that import runs;
        // bridge it here when this wrapper is reached another way.
        if (exportModule === undefined && typeof __mfPromiseState.loadLazyShares === "function") {
          return __mfPromiseState.loadLazyShares(["vuetify/styles"]).then(() => {
            exportModule = __mfReadSharedCache(__mfModuleCache.share, {"canonical":"default:vuetify/styles","aliases":["vuetify/styles"]});
          });
        }
      }).then(() => {
        if (exportModule === undefined) {
          throw new Error("[Module Federation] Shared module vuetify/styles was imported before federation bootstrap finished.");
        }
        __mfApplyHostProvidedExports(exportModule);
      }));
    } else {
      __mfApplyHostProvidedExports(exportModule);
    }

// 仅本地预览用：宿主环境下由 MoviePilot 加载联邦组件，不经过此入口
const vuetify = __mf_0();

__mf_0$1({
  render: () =>
    __mf_11(Config, {
      initialConfig: { enabled: true, retention_days: 7, max_size_mb: 512, extra_hosts: '' },
      pluginId: 'SynologyImageBridge',
      api: { get: async () => ({}), post: async () => ({}) },
    }),
})
  .use(vuetify)
  .mount('#app');
