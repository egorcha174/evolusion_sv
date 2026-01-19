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
		client: {start:"_app/immutable/entry/start.DfZPu2H8.js",app:"_app/immutable/entry/app.DO2G9Bhu.js",imports:["_app/immutable/entry/start.DfZPu2H8.js","_app/immutable/chunks/C6jqP78O.js","_app/immutable/chunks/D78c_VIb.js","_app/immutable/chunks/ixup1LBQ.js","_app/immutable/chunks/DnxiJAd4.js","_app/immutable/entry/app.DO2G9Bhu.js","_app/immutable/chunks/D78c_VIb.js","_app/immutable/chunks/Bgs4iDMG.js","_app/immutable/chunks/DnxiJAd4.js","_app/immutable/chunks/DcjxvNrN.js","_app/immutable/chunks/CSca0pXz.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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
