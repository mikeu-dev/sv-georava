export * from '@geovara/core';

export interface WorkerParseResult {
	readonly success: boolean;
	readonly data?: unknown;
	readonly error?: string;
}
