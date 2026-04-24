import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async () => {
	return {};
};

export const prerender = true;
export const trailingSlash = 'always';
