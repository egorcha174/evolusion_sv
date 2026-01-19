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
		client: {start:"_app/immutable/entry/start.DFPfR138.js",app:"_app/immutable/entry/app.DGDr4EHv.js",imports:["_app/immutable/entry/start.DFPfR138.js","_app/immutable/chunks/YLO7xDSn.js","_app/immutable/chunks/DSgXCWLr.js","_app/immutable/chunks/iDUEHbbE.js","_app/immutable/entry/app.DGDr4EHv.js","_app/immutable/chunks/DSgXCWLr.js","_app/immutable/chunks/DnPsic_2.js","_app/immutable/chunks/iDUEHbbE.js","_app/immutable/chunks/BmkM1kkP.js","_app/immutable/chunks/D4tnr7Gc.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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
