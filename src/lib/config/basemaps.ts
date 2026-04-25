import type { BasemapDefinition } from '$lib/types/map.types';

export const BASEMAPS: BasemapDefinition[] = [
	{
		id: 'osm',
		name: 'OpenStreetMap',
		url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
		maxZoom: 19,
		attributions: '© OpenStreetMap contributors',
		isXYZ: false
	},
	{
		id: 'satellite',
		name: 'Satellite (Esri)',
		url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
		maxZoom: 19,
		attributions:
			'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EBP, and the GIS User Community',
		isXYZ: true
	},
	{
		id: 'topo',
		name: 'Topographic',
		url: 'https://{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png',
		maxZoom: 17,
		attributions:
			'Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)',
		isXYZ: true
	},
	{
		id: 'dark',
		name: 'Dark (CartoDB)',
		url: 'https://{a-d}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
		maxZoom: 20,
		attributions: '© OpenStreetMap contributors, © CARTO',
		isXYZ: true
	}
];
