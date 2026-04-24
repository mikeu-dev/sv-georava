import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '$env/dynamic/private';
import * as schema from './schema';

/**
 * Drizzle Database Client.
 * Configured for Supabase Transaction Pool mode (no prefetch).
 */
const connectionString = env.DATABASE_URL;

if (!connectionString) {
	throw new Error('DATABASE_URL is not set in environment variables');
}

const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });
