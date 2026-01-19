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
		client: {start:"_app/immutable/entry/start.BcD_YYrq.js",app:"_app/immutable/entry/app.BS0s7rN0.js",imports:["_app/immutable/entry/start.BcD_YYrq.js","_app/immutable/chunks/DogpAllB.js","_app/immutable/chunks/MIkDUfiV.js","_app/immutable/chunks/DIAKFJvl.js","_app/immutable/chunks/CYBnsN0N.js","_app/immutable/entry/app.BS0s7rN0.js","_app/immutable/chunks/MIkDUfiV.js","_app/immutable/chunks/DvnUWzw8.js","_app/immutable/chunks/CYBnsN0N.js","_app/immutable/chunks/D5ZglsIW.js","_app/immutable/chunks/Cn2xEhi2.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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
