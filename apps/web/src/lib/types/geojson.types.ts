/**
 * GeoJSON-specific types extending the standard GeoJSON specification.
 */

import type { Feature, FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';

export type GeoJSONFeature = Feature<Geometry, GeoJsonProperties>;
export type GeoJSONFeatureCollection = FeatureCollection<Geometry, GeoJsonProperties>;

export type ExportFormat = 'geojson' | 'kml' | 'kmz' | 'topojson';

export interface ParsedFileResult {
	readonly content: string;
	readonly filename: string;
	readonly format: 'geojson' | 'kml' | 'topojson';
}

export interface WorkerParseResult {
	readonly success: boolean;
	readonly data?: unknown;
	readonly error?: string;
}
