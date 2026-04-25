// @ts-nocheck
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { loginSchema } from './schema';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load = async ({ locals }: Parameters<PageServerLoad>[0]) => {
	if (locals.session) {
		throw redirect(303, '/');
	}
	const form = await superValidate(zod(loginSchema));
	return { form };
};
