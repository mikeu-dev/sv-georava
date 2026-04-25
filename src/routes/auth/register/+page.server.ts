import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { registerSchema } from './schema';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.session) {
		throw redirect(303, '/');
	}
	const form = await superValidate(zod(registerSchema as unknown as Parameters<typeof zod>[0]));
	return { form };
};
