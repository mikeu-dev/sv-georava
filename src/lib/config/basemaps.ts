import type { BasemapDefinition } from '$lib/types/map.types';

/**
 * Available basemap configurations for the map viewer.
 */
export const BASEMAPS: readonly BasemapDefinition[] = [
	{
		id: 'osm',
		name: 'OpenStreetMap',
		url: '',
		maxZoom: 19,
		attributions: '© OpenStreetMap contributors',
		isXYZ: false
	},
	{
		id: 'satellite',
		name: 'Satellite (Esri)',
		url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
		maxZoom: 19,
		attributions: 'Tiles © Esri',
		isXYZ: true
	},
	{
		id: 'topo',
		name: 'Topographic',
		url: 'https://{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png',
		maxZoom: 17,
		attributions: '© OpenTopoMap',
		isXYZ: true
	},
	{
		id: 'dark',
		name: 'Dark (CartoDB)',
		url: 'https://{a-d}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
		maxZoom: 20,
		attributions: '© CARTO',
		isXYZ: true
	}
] as const;
