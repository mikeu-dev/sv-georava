<script lang="ts">
	import { onMount } from 'svelte';
	import 'ol/ol.css';
	import Map from 'ol/Map.js';
	import View from 'ol/View.js';
	import TileLayer from 'ol/layer/Tile.js';
	import VectorLayer from 'ol/layer/Vector.js';
	import VectorSource from 'ol/source/Vector.js';
	import OSM from 'ol/source/OSM.js';
	import XYZ from 'ol/source/XYZ.js';
	import { fromLonLat, toLonLat } from 'ol/proj.js';
	import { defaults as defaultControls, ScaleLine } from 'ol/control.js';
	import { Draw, Modify, Select, Snap, DragAndDrop } from 'ol/interaction.js';
	import { shiftKeyOnly } from 'ol/events/condition.js';
	import GeoJSON from 'ol/format/GeoJSON.js';

	import { mapStore } from '$lib/stores/map.store.svelte';
	import { BASEMAPS } from '$lib/config/basemaps';
	import { DEFAULT_CENTER, DEFAULT_ZOOM } from '$lib/config/constants';
	import { topoJsonDragFormat } from '$lib/services/ol-topojson-format';

	let mapElement = $state<HTMLElement>();
	let map = $state<Map>();
	let vectorSource = $state<VectorSource>();
	let vectorLayer = $state<VectorLayer>();
	let basemapLayer = $state<TileLayer>();

	const geojsonFormat = new GeoJSON({
		featureProjection: 'EPSG:3857',
		dataProjection: 'EPSG:4326'
	});

	// Initialize Map
	onMount(() => {
		if (!mapElement) return;

		vectorSource = new VectorSource({ wrapX: false });
		vectorLayer = new VectorLayer({
			source: vectorSource,
			zIndex: 10
		});

		basemapLayer = new TileLayer({
			source: new OSM(),
			zIndex: 0
		});

		map = new Map({
			target: mapElement,
			layers: [basemapLayer, vectorLayer],
			view: new View({
				center: fromLonLat(DEFAULT_CENTER),
				zoom: DEFAULT_ZOOM,
				multiWorld: true
			}),
			controls: defaultControls({ attribution: true, rotate: true, zoom: true }).extend([
				new ScaleLine({ units: 'metric' })
			])
		});

		// Interaction: Select
		const select = new Select({
			style: null, // use default or custom style
			hitTolerance: 5
		});
		map.addInteraction(select);
		select.on('select', (e) => {
			const selected = e.selected[0] || null;
			mapStore.selectFeature(selected as any);
		});

		// Interaction: DragAndDrop
		const dragAndDrop = new DragAndDrop({
			formatConstructors: [GeoJSON as any, topoJsonDragFormat as any]
		});
		map.addInteraction(dragAndDrop);
		dragAndDrop.on('addfeatures', (e) => {
			if (e.features) {
				vectorSource?.addFeatures(e.features as any);
				syncStoreFromMap();
			}
		});

		// Interaction: Modify
		const modify = new Modify({
			source: vectorSource,
			condition: (e) => shiftKeyOnly(e) || e.type === 'pointerdown'
		});
		map.addInteraction(modify);
		modify.on('modifyend', () => syncStoreFromMap());

		// Sync store initial state
		if (mapStore.features.length > 0) {
			vectorSource.addFeatures(mapStore.features as any);
		}

		return () => {
			map?.setTarget(undefined);
		};
	});

	// Effect: Sync Map Features from Store (External updates like JSON Editor)
	$effect(() => {
		if (!vectorSource || !mapStore.features || mapStore.skipFeaturesSync) {
			mapStore.skipFeaturesSync = false;
			return;
		}
		vectorSource.clear();
		vectorSource.addFeatures(mapStore.features as any);
	});

	// Effect: Handle Drawing Tools
	let activeDraw = $state<Draw | null>(null);
	$effect(() => {
		if (!map || !vectorSource) return;

		if (activeDraw) {
			map.removeInteraction(activeDraw);
			activeDraw = null;
		}

		const type = mapStore.drawType;
		if (!type || type === 'Edit' || type === 'Delete') return;

		let olType: any = type;
		let geometryFunction: any;

		if (type === 'Rectangle') {
			olType = 'Circle';
			// geometryFunction = createBox(); // Need to import or implement
		}

		const draw = new Draw({
			source: vectorSource,
			type: olType,
			geometryFunction
		});

		draw.on('drawend', (e) => {
			const feature = e.feature;
			if (!feature.getId()) {
				feature.setId(`f_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
			}
			// Small delay to ensure geometry is finalized
			setTimeout(() => syncStoreFromMap(), 10);
		});

		map.addInteraction(draw);
		activeDraw = draw;
	});

	// Effect: Layer Opacity & Visibility
	$effect(() => {
		if (vectorLayer) {
			vectorLayer.setOpacity(mapStore.vectorOpacity);
			vectorLayer.setVisible(mapStore.vectorVisible);
		}
	});

	function syncStoreFromMap() {
		if (!vectorSource) return;
		const features = vectorSource.getFeatures();
		mapStore.skipFeaturesSync = true;
		mapStore.setFeatures(features as any);
	}
</script>

<div bind:this={mapElement} class="relative h-full w-full outline-none bg-muted/20">
	<slot />
</div>

<style>
	:global(.ol-viewport) {
		outline: none !important;
	}
</style>
