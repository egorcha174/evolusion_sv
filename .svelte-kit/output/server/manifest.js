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
		client: {start:"_app/immutable/entry/start.C0yn7ibB.js",app:"_app/immutable/entry/app.Dy2UTwk_.js",imports:["_app/immutable/entry/start.C0yn7ibB.js","_app/immutable/chunks/68wnSCnB.js","_app/immutable/chunks/CXj4HnGG.js","_app/immutable/chunks/DSj6Q0Zp.js","_app/immutable/entry/app.Dy2UTwk_.js","_app/immutable/chunks/CXj4HnGG.js","_app/immutable/chunks/Y60M5pzQ.js","_app/immutable/chunks/DSj6Q0Zp.js","_app/immutable/chunks/BAi1BYcP.js","_app/immutable/chunks/CVyURxy9.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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
