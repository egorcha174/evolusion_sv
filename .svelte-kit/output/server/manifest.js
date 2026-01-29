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
		client: {start:"_app/immutable/entry/start.3pHL5T3X.js",app:"_app/immutable/entry/app.CeobTA0Y.js",imports:["_app/immutable/entry/start.3pHL5T3X.js","_app/immutable/chunks/onraWh8D.js","_app/immutable/chunks/DrE23S9z.js","_app/immutable/entry/app.CeobTA0Y.js","_app/immutable/chunks/C1FmrZbK.js","_app/immutable/chunks/DrE23S9z.js","_app/immutable/chunks/Dx6vUp0w.js","_app/immutable/chunks/CYiN1Ptg.js","_app/immutable/chunks/d16_jLoQ.js","_app/immutable/chunks/lSMfcQqK.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js'))
		],
		remotes: {
			
		},
		routes: [
			
		],
		prerendered_routes: new Set(["/","/entities/","/settings/"]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
