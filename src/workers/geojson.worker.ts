/**
 * Web Worker for parsing GeoJSON strings.
 * Keeps the main thread responsive during heavy parsing operations.
 */
self.onmessage = (event: MessageEvent<string>) => {
	const geojsonString = event.data;

	if (!geojsonString) {
		self.postMessage({ success: false, error: 'Empty GeoJSON string' });
		return;
	}

	try {
		const parsed: unknown = JSON.parse(geojsonString);

		if (
			!parsed ||
			typeof parsed !== 'object' ||
			!('type' in (parsed as Record<string, unknown>))
		) {
			throw new Error('Invalid GeoJSON structure');
		}

		const obj = parsed as Record<string, unknown>;
		if (obj.type !== 'FeatureCollection' && obj.type !== 'Feature') {
			throw new Error('Invalid GeoJSON structure');
		}

		self.postMessage({ success: true, data: parsed });
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : 'Unknown parsing error';
		self.postMessage({ success: false, error: message });
	}
};
