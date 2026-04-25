import { transformImportedData } from '@geovara/core';
import { PARSE_WORKER_THRESHOLD } from '$lib/config/constants';
import type { WorkerParseResult } from '$lib/types/geojson.types';

/**
 * Determines if the GeoJSON string is large enough to warrant worker parsing.
 */
export function shouldParseInWorker(sourceLength: number): boolean {
	return typeof Worker !== 'undefined' && sourceLength >= PARSE_WORKER_THRESHOLD;
}

/**
 * Offloads JSON.parse to a Web Worker for large GeoJSON strings.
 */
export function parseGeoJsonInWorker(geojsonString: string): Promise<unknown> {
	return new Promise((resolve, reject) => {
		const worker = new Worker(new URL('../../workers/geojson.worker.ts', import.meta.url));
		const done = (fn: () => void) => {
			worker.terminate();
			fn();
		};

		worker.onmessage = (e: MessageEvent<WorkerParseResult>) => {
			const msg = e.data;
			if (msg?.success && 'data' in msg) {
				done(() => resolve(msg.data));
			} else if (msg && !msg.success && msg.error) {
				done(() => reject(new Error(msg.error)));
			} else {
				done(() => reject(new Error('Worker parse failed')));
			}
		};

		worker.onerror = (err) => {
			done(() => reject(err));
		};

		worker.postMessage(geojsonString);
	});
}

/**
 * Imports a file and returns its GeoJSON string representation.
 */
export async function importFile(content: string, filename: string): Promise<string> {
	const lower = filename.toLowerCase();
	const isKml = lower.endsWith('.kml');
	const isTopo = lower.endsWith('.topojson');
	const canTryWorker = !isKml && !isTopo && shouldParseInWorker(content.length);

	if (isKml || isTopo) {
		return transformImportedData(content, filename);
	}

	if (canTryWorker) {
		const parsed = await parseGeoJsonInWorker(content);
		return JSON.stringify(parsed, null, 2);
	}

	return content;
}
