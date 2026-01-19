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
		client: {start:"_app/immutable/entry/start.CQoZRWYA.js",app:"_app/immutable/entry/app.EQEtM0Xj.js",imports:["_app/immutable/entry/start.CQoZRWYA.js","_app/immutable/chunks/CpStgHip.js","_app/immutable/chunks/ckSiSke7.js","_app/immutable/chunks/DIUvlOIK.js","_app/immutable/entry/app.EQEtM0Xj.js","_app/immutable/chunks/ckSiSke7.js","_app/immutable/chunks/BB0mxiVI.js","_app/immutable/chunks/DIUvlOIK.js","_app/immutable/chunks/DVoR1FOb.js","_app/immutable/chunks/BJ9MF19F.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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
