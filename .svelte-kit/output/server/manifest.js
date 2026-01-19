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
		client: {start:"_app/immutable/entry/start.BaDuQIuP.js",app:"_app/immutable/entry/app.BHzk68zD.js",imports:["_app/immutable/entry/start.BaDuQIuP.js","_app/immutable/chunks/Br-PRzRI.js","_app/immutable/chunks/CHWeQpjd.js","_app/immutable/chunks/BgYVG1et.js","_app/immutable/entry/app.BHzk68zD.js","_app/immutable/chunks/CHWeQpjd.js","_app/immutable/chunks/BxIVbMkZ.js","_app/immutable/chunks/Ce9YDZfT.js","_app/immutable/chunks/BgYVG1et.js","_app/immutable/chunks/D3jBc4OI.js","_app/immutable/chunks/BPcN3Ab7.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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
