import { json } from '@sveltejs/kit';
import { ProjectService } from '$lib/server/services/project.service';
import type { RequestHandler } from './$types';

export const DELETE: RequestHandler = async ({ locals, params }) => {
	if (!locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}

	const { id } = params;
	if (!id) {
		return new Response('Missing project ID', { status: 400 });
	}

	await ProjectService.deleteProject(id, locals.user.id);
	return json({ success: true });
};
