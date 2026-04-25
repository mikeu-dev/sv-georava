
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	type MatcherParam<M> = M extends (param : string) => param is (infer U extends string) ? U : string;

	export interface AppTypes {
		RouteId(): "/" | "/api" | "/api/ai" | "/api/ai/intent" | "/api/auth" | "/api/auth/[...auth]" | "/api/projects" | "/api/projects/[id]" | "/auth" | "/auth/login" | "/auth/register" | "/demo" | "/demo/better-auth" | "/demo/better-auth/login" | "/demo/paraglide" | "/demo/playwright";
		RouteParams(): {
			"/api/auth/[...auth]": { auth: string };
			"/api/projects/[id]": { id: string }
		};
		LayoutParams(): {
			"/": { auth?: string; id?: string };
			"/api": { auth?: string; id?: string };
			"/api/ai": Record<string, never>;
			"/api/ai/intent": Record<string, never>;
			"/api/auth": { auth?: string };
			"/api/auth/[...auth]": { auth: string };
			"/api/projects": { id?: string };
			"/api/projects/[id]": { id: string };
			"/auth": Record<string, never>;
			"/auth/login": Record<string, never>;
			"/auth/register": Record<string, never>;
			"/demo": Record<string, never>;
			"/demo/better-auth": Record<string, never>;
			"/demo/better-auth/login": Record<string, never>;
			"/demo/paraglide": Record<string, never>;
			"/demo/playwright": Record<string, never>
		};
		Pathname(): "/" | "/api/ai/intent" | `/api/auth/${string}` & {} | "/api/projects" | `/api/projects/${string}` & {} | "/auth/login/" | "/auth/register/" | "/demo/" | "/demo/better-auth/" | "/demo/better-auth/login/" | "/demo/paraglide/" | "/demo/playwright/";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/robots.txt" | string & {};
	}
}