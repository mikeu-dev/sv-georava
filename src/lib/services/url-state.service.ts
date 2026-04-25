/**
 * URL state service for sharing map state via URL hash.
 * Uses LZ-String compression for compact URLs.
 */

import LZString from 'lz-string';

/**
 * Compresses a GeoJSON string into a URL-safe encoded string.
 */
export function encodeGeoJSON(geojson: string): string {
	try {
		return LZString.compressToEncodedURIComponent(geojson);
	} catch (error) {
		console.error('Failed to encode GeoJSON:', error);
		return '';
	}
}

/**
 * Decompresses an encoded string back into a GeoJSON string.
 */
export function decodeGeoJSON(encoded: string): string {
	try {
		const decompressed = LZString.decompressFromEncodedURIComponent(encoded);
		return decompressed || '';
	} catch (error) {
		console.error('Failed to decode GeoJSON from URL:', error);
		return '';
	}
}

function hashQuerySegments(): string[] {
	if (typeof window === 'undefined') return [];
	const raw = window.location.hash.replace(/^#/, '');
	return raw ? raw.split('&').filter(Boolean) : [];
}

/**
 * Merges state into the URL hash without dropping other segments.
 */
export function updateUrlHash(params: Record<string, string | null>): void {
	if (typeof window === 'undefined') return;

	let segments = hashQuerySegments();

	Object.entries(params).forEach(([key, value]) => {
		segments = segments.filter((p) => !p.startsWith(`${key}=`));
		if (value) {
			segments.push(`${key}=${value}`);
		}
	});

	const url = new URL(window.location.href);
	url.hash = segments.length > 0 ? segments.join('&') : '';
	window.history.replaceState(null, '', url.toString());
}

/**
 * Reads a specific key from the URL hash.
 */
export function getFromHash(key: string): string | null {
	if (typeof window === 'undefined') return null;

	const segment = hashQuerySegments().find((p) => p.startsWith(`${key}=`));
	if (!segment) return null;
	return segment.slice(key.length + 1);
}

/**
 * Helper to parse map=z/lat/lon from hash
 */
export function parseMapHash(hash: string): { zoom: number; lat: number; lon: number } | null {
	const parts = hash.split('/');
	if (parts.length !== 3) return null;
	const zoom = parseFloat(parts[0] || '');
	const lat = parseFloat(parts[1] || '');
	const lon = parseFloat(parts[2] || '');
	if (isNaN(zoom) || isNaN(lat) || isNaN(lon)) return null;
	return { zoom, lat, lon };
}
