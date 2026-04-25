import { json } from '@sveltejs/kit';
import { ProjectService } from '$lib/server/services/project.service';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}

	const projects = await ProjectService.getProjects(locals.user.id);
	return json(projects);
};

export const POST: RequestHandler = async ({ locals, request }) => {
	if (!locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}

	const { name, data, description } = await request.json();
	if (!name || !data) {
		return new Response('Missing required fields', { status: 400 });
	}

	const project = await ProjectService.createProject(locals.user.id, name, data, description);
	return json(project);
};
