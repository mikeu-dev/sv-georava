import { db } from '$lib/server/db';
import { project } from '$lib/server/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export const ProjectService = {
	async createProject(userId: string, name: string, data: string, description?: string) {
		const newProject = {
			id: crypto.randomUUID(),
			userId,
			name,
			data,
			description,
			createdAt: new Date(),
			updatedAt: new Date()
		};
		const result = await db.insert(project).values(newProject).returning();
		return result[0];
	},

	async getProjects(userId: string) {
		return await db
			.select()
			.from(project)
			.where(eq(project.userId, userId))
			.orderBy(desc(project.updatedAt));
	},

	async getProjectById(id: string, userId: string) {
		const result = await db
			.select()
			.from(project)
			.where(and(eq(project.id, id), eq(project.userId, userId)));
		return result[0] || null;
	},

	async updateProject(
		id: string,
		userId: string,
		updates: Partial<{ name: string; description: string; data: string }>
	) {
		const result = await db
			.update(project)
			.set({ ...updates, updatedAt: new Date() })
			.where(and(eq(project.id, id), eq(project.userId, userId)))
			.returning();
		return result[0] || null;
	},

	async deleteProject(id: string, userId: string) {
		await db.delete(project).where(and(eq(project.id, id), eq(project.userId, userId)));
		return true;
	}
};
