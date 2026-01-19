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
		client: {start:"_app/immutable/entry/start.DSvhndt5.js",app:"_app/immutable/entry/app.B492-kgC.js",imports:["_app/immutable/entry/start.DSvhndt5.js","_app/immutable/chunks/Ca-iAISo.js","_app/immutable/chunks/BWA2oz35.js","_app/immutable/chunks/C55cz5NW.js","_app/immutable/chunks/D-CHyDKf.js","_app/immutable/entry/app.B492-kgC.js","_app/immutable/chunks/BWA2oz35.js","_app/immutable/chunks/8JZ3AmGw.js","_app/immutable/chunks/DYWGbwQD.js","_app/immutable/chunks/D-CHyDKf.js","_app/immutable/chunks/MLiwW76i.js","_app/immutable/chunks/C55cz5NW.js","_app/immutable/chunks/Dj_5IFaj.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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
