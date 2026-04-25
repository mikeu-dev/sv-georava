/**
 * Application-wide constants.
 */

export const APP_NAME = 'Georava';
export const APP_VERSION = '0.1.0';
export const APP_DESCRIPTION = 'Professional geospatial analysis toolkit';

/** Worker will be used for GeoJSON strings larger than this threshold (bytes). */
export const PARSE_WORKER_THRESHOLD = 256 * 1024;

/** Nominatim rate limiting (ms between requests). */
export const NOMINATIM_MIN_INTERVAL_MS = 1100;

/** Maximum number of undo history entries. */
export const UNDO_HISTORY_LIMIT = 50;

/** Default GeoJSON FeatureCollection string. */
export const DEFAULT_GEOJSON_STRING = JSON.stringify(
	{ type: 'FeatureCollection', features: [] },
	null,
	2
);

/** Default map view center [lon, lat]. */
export const DEFAULT_CENTER: [number, number] = [0, 0];

/** Default map zoom level. */
export const DEFAULT_ZOOM = 2;
