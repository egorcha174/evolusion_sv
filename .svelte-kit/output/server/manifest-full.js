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
		client: {start:"_app/immutable/entry/start.B3fRAyne.js",app:"_app/immutable/entry/app.DW7mw6r6.js",imports:["_app/immutable/entry/start.B3fRAyne.js","_app/immutable/chunks/CwxqHwCF.js","_app/immutable/chunks/BA3XBSiu.js","_app/immutable/chunks/BoWhb0nM.js","_app/immutable/entry/app.DW7mw6r6.js","_app/immutable/chunks/BA3XBSiu.js","_app/immutable/chunks/Gpl8Tn-c.js","_app/immutable/chunks/BoWhb0nM.js","_app/immutable/chunks/Hguoowj-.js","_app/immutable/chunks/UtaNBNqr.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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
