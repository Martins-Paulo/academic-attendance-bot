module.exports = [
(()=>{"use strict";return[
"[project]/node_modules/.pnpm/next@16.4.0_@types+node@22.20.5_babel-plugin-macros@3.1.0_react-dom@19.2.1_react@19.2.1__react@19.2.1_sass@1.77.4/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/node_modules/.pnpm/next@16.4.0_@types+node@22.20.5_babel-plugin-macros@3.1.0_react-dom@19.2.1_react@19.2.1__react@19.2.1_sass@1.77.4/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].ReactJsxDevRuntime;
}),
"[project]/node_modules/.pnpm/next@16.4.0_@types+node@22.20.5_babel-plugin-macros@3.1.0_react-dom@19.2.1_react@19.2.1__react@19.2.1_sass@1.77.4/node_modules/next/dist/shared/lib/app-dynamic.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return dynamic;
    }
});
const _interop_require_default = __turbopack_context__.r("[project]/node_modules/.pnpm/@swc+helpers@0.5.23/node_modules/@swc/helpers/cjs/_interop_require_default.cjs [app-ssr] (ecmascript)");
const _loadable = /*#__PURE__*/ _interop_require_default._(__turbopack_context__.r("[project]/node_modules/.pnpm/next@16.4.0_@types+node@22.20.5_babel-plugin-macros@3.1.0_react-dom@19.2.1_react@19.2.1__react@19.2.1_sass@1.77.4/node_modules/next/dist/shared/lib/lazy-dynamic/loadable.js [app-ssr] (ecmascript)"));
function dynamic(dynamicOptions, options) {
    const loadableOptions = {};
    if (typeof dynamicOptions === 'function') {
        loadableOptions.loader = dynamicOptions;
    }
    const mergedOptions = {
        ...loadableOptions,
        ...options
    };
    return (0, _loadable.default)({
        ...mergedOptions,
        modules: mergedOptions.loadableGenerated?.modules
    });
}
if ((typeof exports.default === 'function' || typeof exports.default === 'object' && exports.default !== null) && typeof exports.default.__esModule === 'undefined') {
    Object.defineProperty(exports.default, '__esModule', {
        value: true
    });
    Object.assign(exports.default, exports);
    module.exports = exports.default;
}
}),
"[project]/node_modules/.pnpm/next@16.4.0_@types+node@22.20.5_babel-plugin-macros@3.1.0_react-dom@19.2.1_react@19.2.1__react@19.2.1_sass@1.77.4/node_modules/next/dist/shared/lib/deployment-id.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    getAssetToken: null,
    getAssetTokenQuery: null,
    getDeploymentId: null,
    getDeploymentIdQuery: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    getAssetToken: function() {
        return getAssetToken;
    },
    getAssetTokenQuery: function() {
        return getAssetTokenQuery;
    },
    getDeploymentId: function() {
        return getDeploymentId;
    },
    getDeploymentIdQuery: function() {
        return getDeploymentIdQuery;
    }
});
let deploymentId;
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else {
    // Client side: replaced with globalThis.NEXT_DEPLOYMENT_ID
    // Server side: left as is or replaced with a string or replaced with false
    deploymentId = ("TURBOPACK compile-time value", false) || undefined;
}
function getDeploymentId() {
    return deploymentId;
}
function getDeploymentIdQuery(ampersand = false) {
    let id = getDeploymentId();
    if (id) {
        return `${ampersand ? '&' : '?'}dpl=${id}`;
    }
    return '';
}
function getAssetToken() {
    return ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : ("TURBOPACK compile-time value", false);
}
function getAssetTokenQuery(ampersand = false) {
    let id = getAssetToken();
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return '';
}
}),
"[project]/node_modules/.pnpm/next@16.4.0_@types+node@22.20.5_babel-plugin-macros@3.1.0_react-dom@19.2.1_react@19.2.1__react@19.2.1_sass@1.77.4/node_modules/next/dist/shared/lib/encode-uri-path.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "encodeURIPath", {
    enumerable: true,
    get: function() {
        return encodeURIPath;
    }
});
function encodeURIPath(file) {
    return file.split('/').map((p)=>encodeURIComponent(p)).join('/');
}
}),
"[project]/node_modules/.pnpm/next@16.4.0_@types+node@22.20.5_babel-plugin-macros@3.1.0_react-dom@19.2.1_react@19.2.1__react@19.2.1_sass@1.77.4/node_modules/next/dist/shared/lib/lazy-dynamic/bailout-to-csr.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

// This has to be a shared module which is shared between client component error boundary and dynamic component
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    BailoutToCSRError: null,
    isBailoutToCSRError: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    BailoutToCSRError: function() {
        return BailoutToCSRError;
    },
    isBailoutToCSRError: function() {
        return isBailoutToCSRError;
    }
});
const BAILOUT_TO_CSR = 'BAILOUT_TO_CLIENT_SIDE_RENDERING';
class BailoutToCSRError extends Error {
    constructor(reason){
        super(`Bail out to client-side rendering: ${reason}`), this.reason = reason, this.digest = BAILOUT_TO_CSR;
    }
}
function isBailoutToCSRError(err) {
    if (typeof err !== 'object' || err === null || !('digest' in err)) {
        return false;
    }
    return err.digest === BAILOUT_TO_CSR;
}
}),
"[project]/node_modules/.pnpm/next@16.4.0_@types+node@22.20.5_babel-plugin-macros@3.1.0_react-dom@19.2.1_react@19.2.1__react@19.2.1_sass@1.77.4/node_modules/next/dist/shared/lib/lazy-dynamic/dynamic-bailout-to-csr.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "BailoutToCSRForNextDynamic", {
    enumerable: true,
    get: function() {
        return BailoutToCSRForNextDynamic;
    }
});
const _react = __turbopack_context__.r("[project]/node_modules/.pnpm/next@16.4.0_@types+node@22.20.5_babel-plugin-macros@3.1.0_react-dom@19.2.1_react@19.2.1__react@19.2.1_sass@1.77.4/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
const _reactdom = __turbopack_context__.r("[project]/node_modules/.pnpm/next@16.4.0_@types+node@22.20.5_babel-plugin-macros@3.1.0_react-dom@19.2.1_react@19.2.1__react@19.2.1_sass@1.77.4/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-dom.js [app-ssr] (ecmascript)");
const _bailouttocsr = __turbopack_context__.r("[project]/node_modules/.pnpm/next@16.4.0_@types+node@22.20.5_babel-plugin-macros@3.1.0_react-dom@19.2.1_react@19.2.1__react@19.2.1_sass@1.77.4/node_modules/next/dist/shared/lib/lazy-dynamic/bailout-to-csr.js [app-ssr] (ecmascript)");
const _reactbrowserbailout = __turbopack_context__.r("[project]/node_modules/.pnpm/next@16.4.0_@types+node@22.20.5_babel-plugin-macros@3.1.0_react-dom@19.2.1_react@19.2.1__react@19.2.1_sass@1.77.4/node_modules/next/dist/shared/lib/lazy-dynamic/react-browser-bailout.js [app-ssr] (ecmascript)");
const NEXT_DYNAMIC_BAILOUT_REASON = 'next/dynamic';
const getNextDynamicBailoutReason = _reactbrowserbailout.createReactBrowserBailoutReason.bind(null, NEXT_DYNAMIC_BAILOUT_REASON);
function BailoutToCSRForNextDynamic({ children }) {
    if ("TURBOPACK compile-time truthy", 1) {
        // @ts-expect-error TODO: Update @types/react-dom to include the reason argument.
        (0, _react.use)((0, _reactdom.browser)(getNextDynamicBailoutReason));
        return children;
    }
    //TURBOPACK unreachable
    ;
}
}),
"[project]/node_modules/.pnpm/next@16.4.0_@types+node@22.20.5_babel-plugin-macros@3.1.0_react-dom@19.2.1_react@19.2.1__react@19.2.1_sass@1.77.4/node_modules/next/dist/shared/lib/lazy-dynamic/loadable.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _jsxruntime = __turbopack_context__.r("[project]/node_modules/.pnpm/next@16.4.0_@types+node@22.20.5_babel-plugin-macros@3.1.0_react-dom@19.2.1_react@19.2.1__react@19.2.1_sass@1.77.4/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-runtime.js [app-ssr] (ecmascript)");
const _react = __turbopack_context__.r("[project]/node_modules/.pnpm/next@16.4.0_@types+node@22.20.5_babel-plugin-macros@3.1.0_react-dom@19.2.1_react@19.2.1__react@19.2.1_sass@1.77.4/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
const _dynamicbailouttocsr = __turbopack_context__.r("[project]/node_modules/.pnpm/next@16.4.0_@types+node@22.20.5_babel-plugin-macros@3.1.0_react-dom@19.2.1_react@19.2.1__react@19.2.1_sass@1.77.4/node_modules/next/dist/shared/lib/lazy-dynamic/dynamic-bailout-to-csr.js [app-ssr] (ecmascript)");
const _preloadchunks = __turbopack_context__.r("[project]/node_modules/.pnpm/next@16.4.0_@types+node@22.20.5_babel-plugin-macros@3.1.0_react-dom@19.2.1_react@19.2.1__react@19.2.1_sass@1.77.4/node_modules/next/dist/shared/lib/lazy-dynamic/preload-chunks.js [app-ssr] (ecmascript)");
// Normalize loader to return the module as form { default: Component } for `React.lazy`.
// Also for backward compatible since next/dynamic allows to resolve a component directly with loader
// Client component reference proxy need to be converted to a module.
function convertModule(mod) {
    // Check "default" prop before accessing it, as it could be client reference proxy that could break it reference.
    // Cases:
    // mod: { default: Component }
    // mod: Component
    // mod: { default: proxy(Component) }
    // mod: proxy(Component)
    const hasDefault = mod && 'default' in mod;
    return {
        default: hasDefault ? mod.default : mod
    };
}
const defaultOptions = {
    loader: ()=>Promise.resolve(convertModule(()=>null)),
    loading: null,
    ssr: true
};
function Loadable(options) {
    const opts = {
        ...defaultOptions,
        ...options
    };
    const Lazy = /*#__PURE__*/ (0, _react.lazy)(()=>opts.loader().then(convertModule));
    const Loading = opts.loading;
    function LoadableComponent(props) {
        const fallbackElement = Loading ? /*#__PURE__*/ (0, _jsxruntime.jsx)(Loading, {
            isLoading: true,
            pastDelay: true,
            error: null
        }) : null;
        // If it's non-SSR or provided a loading component, wrap it in a suspense boundary
        const hasSuspenseBoundary = !opts.ssr || !!opts.loading;
        const Wrap = hasSuspenseBoundary ? _react.Suspense : _react.Fragment;
        const wrapProps = hasSuspenseBoundary ? {
            fallback: fallbackElement
        } : {};
        const children = opts.ssr ? /*#__PURE__*/ (0, _jsxruntime.jsxs)(_jsxruntime.Fragment, {
            children: [
                ("TURBOPACK compile-time truthy", 1) ? /*#__PURE__*/ (0, _jsxruntime.jsx)(_preloadchunks.PreloadChunks, {
                    moduleIds: opts.modules
                }) : "TURBOPACK unreachable",
                /*#__PURE__*/ (0, _jsxruntime.jsx)(Lazy, {
                    ...props
                })
            ]
        }) : /*#__PURE__*/ (0, _jsxruntime.jsx)(_dynamicbailouttocsr.BailoutToCSRForNextDynamic, {
            children: /*#__PURE__*/ (0, _jsxruntime.jsx)(Lazy, {
                ...props
            })
        });
        return /*#__PURE__*/ (0, _jsxruntime.jsx)(Wrap, {
            ...wrapProps,
            children: children
        });
    }
    LoadableComponent.displayName = 'LoadableComponent';
    return LoadableComponent;
}
const _default = Loadable;
}),
"[project]/node_modules/.pnpm/next@16.4.0_@types+node@22.20.5_babel-plugin-macros@3.1.0_react-dom@19.2.1_react@19.2.1__react@19.2.1_sass@1.77.4/node_modules/next/dist/shared/lib/lazy-dynamic/preload-chunks.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PreloadChunks", {
    enumerable: true,
    get: function() {
        return PreloadChunks;
    }
});
const _jsxruntime = __turbopack_context__.r("[project]/node_modules/.pnpm/next@16.4.0_@types+node@22.20.5_babel-plugin-macros@3.1.0_react-dom@19.2.1_react@19.2.1__react@19.2.1_sass@1.77.4/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-runtime.js [app-ssr] (ecmascript)");
const _reactdom = __turbopack_context__.r("[project]/node_modules/.pnpm/next@16.4.0_@types+node@22.20.5_babel-plugin-macros@3.1.0_react-dom@19.2.1_react@19.2.1__react@19.2.1_sass@1.77.4/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-dom.js [app-ssr] (ecmascript)");
const _workasyncstorageexternal = __turbopack_context__.r("[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)");
const _encodeuripath = __turbopack_context__.r("[project]/node_modules/.pnpm/next@16.4.0_@types+node@22.20.5_babel-plugin-macros@3.1.0_react-dom@19.2.1_react@19.2.1__react@19.2.1_sass@1.77.4/node_modules/next/dist/shared/lib/encode-uri-path.js [app-ssr] (ecmascript)");
const _deploymentid = __turbopack_context__.r("[project]/node_modules/.pnpm/next@16.4.0_@types+node@22.20.5_babel-plugin-macros@3.1.0_react-dom@19.2.1_react@19.2.1__react@19.2.1_sass@1.77.4/node_modules/next/dist/shared/lib/deployment-id.js [app-ssr] (ecmascript)");
function PreloadChunks({ moduleIds }) {
    // Early return in client compilation and only load requestStore on server side
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const workStore = _workasyncstorageexternal.workAsyncStorage.getStore();
    if (workStore === undefined) {
        return null;
    }
    const allFiles = [];
    // Search the current dynamic call unique key id in react loadable manifest,
    // and find the corresponding CSS files to preload
    if (workStore.reactLoadableManifest && moduleIds) {
        const manifest = workStore.reactLoadableManifest;
        for (const key of moduleIds){
            if (!manifest[key]) continue;
            const chunks = manifest[key].files;
            allFiles.push(...chunks);
        }
    }
    if (allFiles.length === 0) {
        return null;
    }
    const query = (0, _deploymentid.getAssetTokenQuery)();
    return /*#__PURE__*/ (0, _jsxruntime.jsx)(_jsxruntime.Fragment, {
        children: allFiles.map((chunk)=>{
            const href = `${workStore.assetPrefix}/_next/${(0, _encodeuripath.encodeURIPath)(chunk)}${query}`;
            const isCss = chunk.endsWith('.css');
            // If it's stylesheet we use `precedence` o help hoist with React Float.
            // For stylesheets we actually need to render the CSS because nothing else is going to do it so it needs to be part of the component tree.
            // The `preload` for stylesheet is not optional.
            if (isCss) {
                return /*#__PURE__*/ (0, _jsxruntime.jsx)("link", {
                    // @ts-ignore
                    precedence: "dynamic",
                    href: href,
                    rel: "stylesheet",
                    as: "style",
                    nonce: workStore.nonce
                }, chunk);
            } else {
                // If it's script we use ReactDOM.preload to preload the resources
                (0, _reactdom.preload)(href, {
                    as: 'script',
                    fetchPriority: 'low',
                    nonce: workStore.nonce
                });
                return null;
            }
        })
    });
}
}),
"[project]/node_modules/.pnpm/next@16.4.0_@types+node@22.20.5_babel-plugin-macros@3.1.0_react-dom@19.2.1_react@19.2.1__react@19.2.1_sass@1.77.4/node_modules/next/dist/shared/lib/lazy-dynamic/react-browser-bailout.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

// This module is bundled separately into user code and the precompiled App
// Router runtime. Use the global symbol registry so both copies recognize the
// same browser bailout reason.
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    createReactBrowserBailoutReason: null,
    getReactBrowserBailoutReason: null,
    isNextBrowserBailoutError: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    createReactBrowserBailoutReason: function() {
        return createReactBrowserBailoutReason;
    },
    getReactBrowserBailoutReason: function() {
        return getReactBrowserBailoutReason;
    },
    isNextBrowserBailoutError: function() {
        return isNextBrowserBailoutError;
    }
});
const REACT_BROWSER_BAILOUT_REASON = Symbol.for('next.browser-bailout-reason');
function createReactBrowserBailoutReason(reason) {
    return {
        $$typeof: REACT_BROWSER_BAILOUT_REASON,
        reason
    };
}
function getReactBrowserBailoutReason(error) {
    const cause = error?.cause;
    return cause?.$$typeof === REACT_BROWSER_BAILOUT_REASON ? cause.reason : undefined;
}
function isNextBrowserBailoutError(error) {
    return getReactBrowserBailoutReason(error) !== undefined;
}
}),
"[project]/src/app/(frontend)/UniGagClient.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>UniGagClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$4$2e$0_$40$types$2b$node$40$22$2e$20$2e$5_babel$2d$plugin$2d$macros$40$3$2e$1$2e$0_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1_sass$40$1$2e$77$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.4.0_@types+node@22.20.5_babel-plugin-macros@3.1.0_react-dom@19.2.1_react@19.2.1__react@19.2.1_sass@1.77.4/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$4$2e$0_$40$types$2b$node$40$22$2e$20$2e$5_babel$2d$plugin$2d$macros$40$3$2e$1$2e$0_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1_sass$40$1$2e$77$2e$4$2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.4.0_@types+node@22.20.5_babel-plugin-macros@3.1.0_react-dom@19.2.1_react@19.2.1__react@19.2.1_sass@1.77.4/node_modules/next/dist/shared/lib/app-dynamic.js [app-ssr] (ecmascript)");
;
'use client';
;
;
const UniGagApp = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$4$2e$0_$40$types$2b$node$40$22$2e$20$2e$5_babel$2d$plugin$2d$macros$40$3$2e$1$2e$0_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1_sass$40$1$2e$77$2e$4$2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(async ()=>{}, {
    loadableGenerated: {
        modules: [
            "[project]/src/app/(frontend)/UniGagApp.tsx [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
function UniGagClient({ squadProfiles, currentStudent, initialCourses, nextEvent }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$4$2e$0_$40$types$2b$node$40$22$2e$20$2e$5_babel$2d$plugin$2d$macros$40$3$2e$1$2e$0_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1_sass$40$1$2e$77$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(UniGagApp, {
        squadProfiles: squadProfiles,
        currentStudent: currentStudent,
        dbCourses: initialCourses,
        dbNextEvent: nextEvent
    }, void 0, false, {
        fileName: "[project]/src/app/(frontend)/UniGagClient.tsx",
        lineNumber: 22,
        columnNumber: 5
    }, this);
}
}),
]})(),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__04vc4idqimk_6._.js.map