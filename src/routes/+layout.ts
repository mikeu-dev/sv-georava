import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ data }) => {
	return {
		...data
	};
};

export const trailingSlash = 'always';
export const ssr = false;
