/**
 * Map domain types for the geospatial workspace.
 */

export type DrawType =
	| 'Point'
	| 'LineString'
	| 'Polygon'
	| 'Rectangle'
	| 'Circle'
	| 'Edit'
	| 'Delete'
	| 'MeasureDistance'
	| 'MeasureArea'
	| 'Freehand'
	| 'Text';

export type ProjectionCode = 'EPSG:4326' | 'EPSG:3857';

export type BasemapId = 'osm' | 'satellite' | 'topo' | 'dark';

export interface BasemapDefinition {
	readonly id: BasemapId;
	readonly name: string;
	readonly url: string;
	readonly maxZoom: number;
	readonly attributions: string;
	readonly isXYZ: boolean;
}

export interface MapViewState {
	readonly center: [number, number];
	readonly zoom: number;
	readonly rotation: number;
}

export interface CoordinateDisplay {
	readonly lat: string;
	readonly lon: string;
}
