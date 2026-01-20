export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([]),
	mimeTypes: {},
	_: {
		client: {start:"_app/immutable/entry/start.Cos55XfJ.js",app:"_app/immutable/entry/app.DVKtbAOT.js",imports:["_app/immutable/entry/start.Cos55XfJ.js","_app/immutable/chunks/CkREA0SI.js","_app/immutable/chunks/CM9YBULs.js","_app/immutable/chunks/M-PbikfX.js","_app/immutable/entry/app.DVKtbAOT.js","_app/immutable/chunks/C1FmrZbK.js","_app/immutable/chunks/CM9YBULs.js","_app/immutable/chunks/Ce4_kbAy.js","_app/immutable/chunks/M-PbikfX.js","_app/immutable/chunks/BlMTQ3nd.js","_app/immutable/chunks/86kbj1ft.js","_app/immutable/chunks/693m_8jx.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/entities",
				pattern: /^\/entities\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/settings",
				pattern: /^\/settings\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
