// @ts-nocheck
import type { LayoutLoad } from './$types';

export const load = async ({ data }: Parameters<LayoutLoad>[0]) => {
	return {
		...data
	};
};

export const trailingSlash = 'always';
export const ssr = false;
