/**
 * Map state store using Svelte 5 Runes.
 * Manages all map-related reactive state: features, drawing, projection, visibility.
 */

import GeoJSON from 'ol/format/GeoJSON.js';
import type { Feature } from 'ol';
import type { Geometry } from 'ol/geom';
import type { DrawType, ProjectionCode, BasemapId } from '$lib/types/map.types';
import { DEFAULT_GEOJSON_STRING } from '$lib/config/constants';

const format = new GeoJSON({
	featureProjection: 'EPSG:3857',
	dataProjection: 'EPSG:4326'
});

function createMapStore() {
	let features = $state<Feature<Geometry>[]>([]);
	let selectedFeature = $state<Feature<Geometry> | null>(null);
	let drawType = $state<DrawType | null>(null);
	let projection = $state<ProjectionCode>('EPSG:3857');
	let vectorOpacity = $state(1);
	let vectorVisible = $state(true);
	let basemapOpacity = $state(1);
	let isParsing = $state(false);
	let zoomToId = $state<string | number | null>(null);
	let is3d = $state(false);
	let activeBasemap = $state<BasemapId>('osm');

	/** Flag to skip bi-directional sync loops */
	let skipFeaturesSync = false;

	const featuresCount = $derived(features.length);

	const geojsonString = $derived.by(() => {
		try {
			if (features.length === 0) return DEFAULT_GEOJSON_STRING;
			const fc = format.writeFeaturesObject(features);
			return JSON.stringify(fc, null, 2);
		} catch {
			return DEFAULT_GEOJSON_STRING;
		}
	});

	function setFeatures(newFeatures: Feature<Geometry>[]) {
		features = newFeatures;
	}

	function addFeature(feature: Feature<Geometry>) {
		features = [...features, feature];
	}

	function removeFeature(featureId: string | number | undefined) {
		if (!featureId) return;
		features = features.filter((f) => f.getId() !== featureId);
		if (selectedFeature?.getId() === featureId) {
			selectedFeature = null;
		}
	}

	function clearFeatures() {
		features = [];
		selectedFeature = null;
	}

	function updateFeatureProperty(featureId: string | number, key: string, value: unknown) {
		const feature = features.find((f) => f.getId() === featureId);
		if (!feature) return;
		if (value === null || value === undefined) {
			feature.unset(key);
		} else {
			feature.set(key, value);
		}
		features = [...features];
	}

	function selectFeature(feature: Feature<Geometry> | null) {
		selectedFeature = feature;
	}

	function setDrawType(type: DrawType | null) {
		drawType = type;
	}

	function setProjection(proj: ProjectionCode) {
		projection = proj;
	}

	function syncFeaturesFromString(str: string) {
		try {
			if (!str || str === DEFAULT_GEOJSON_STRING) {
				features = [];
				return;
			}
			const obj: unknown = JSON.parse(str);
			const parsed = format.readFeatures(obj) as Feature<Geometry>[];
			parsed.forEach((f, i) => {
				if (!f.getId()) f.setId(`f_sync_${Date.now()}_${i}`);
			});
			skipFeaturesSync = true;
			features = parsed;
		} catch {
			/* ignore parse errors */
		}
	}

	function setGeojsonFromEditor(value: string) {
		if (!value.trim() || value.trim() === DEFAULT_GEOJSON_STRING) {
			skipFeaturesSync = true;
			features = [];
			return;
		}

		try {
			const obj: unknown = JSON.parse(value);
			const parsed = format.readFeatures(obj) as Feature<Geometry>[];
			parsed.forEach((f, i) => {
				if (!f.getId()) f.setId(`feature_editor_${Date.now()}_${i}`);
			});
			skipFeaturesSync = true;
			features = parsed;
		} catch {
			/* ignore parse errors */
		}
	}

	function triggerZoomTo(id: string | number) {
		zoomToId = id;
		setTimeout(() => (zoomToId = null), 100);
	}

	return {
		get features() { return features; },
		get selectedFeature() { return selectedFeature; },
		get drawType() { return drawType; },
		get projection() { return projection; },
		get vectorOpacity() { return vectorOpacity; },
		set vectorOpacity(v: number) { vectorOpacity = v; },
		get vectorVisible() { return vectorVisible; },
		set vectorVisible(v: boolean) { vectorVisible = v; },
		get basemapOpacity() { return basemapOpacity; },
		set basemapOpacity(v: number) { basemapOpacity = v; },
		get isParsing() { return isParsing; },
		set isParsing(v: boolean) { isParsing = v; },
		get zoomToId() { return zoomToId; },
		get is3d() { return is3d; },
		set is3d(v: boolean) { is3d = v; },
		get activeBasemap() { return activeBasemap; },
		set activeBasemap(v: BasemapId) { activeBasemap = v; },
		get featuresCount() { return featuresCount; },
		get geojsonString() { return geojsonString; },
		get skipFeaturesSync() { return skipFeaturesSync; },
		set skipFeaturesSync(v: boolean) { skipFeaturesSync = v; },

		setFeatures,
		addFeature,
		removeFeature,
		clearFeatures,
		updateFeatureProperty,
		selectFeature,
		setDrawType,
		setProjection,
		syncFeaturesFromString,
		setGeojsonFromEditor,
		triggerZoomTo,
		featuresToGeoJSON: () => {
			try {
				return format.writeFeaturesObject(features);
			} catch {
				return JSON.parse(DEFAULT_GEOJSON_STRING);
			}
		}
	};
}

export const mapStore = createMapStore();
