<script lang="ts">
	import { onMount } from 'svelte';
	import 'ol/ol.css';
	import Map from 'ol/Map.js';
	import View from 'ol/View.js';
	import TileLayer from 'ol/layer/Tile.js';
	import VectorLayer from 'ol/layer/Vector.js';
	import VectorSource from 'ol/source/Vector.js';
	import OSM from 'ol/source/OSM.js';
	import { fromLonLat } from 'ol/proj.js';
	import { defaults as defaultControls, ScaleLine } from 'ol/control.js';
	import { Draw, Modify, Select, DragAndDrop } from 'ol/interaction.js';
	import { shiftKeyOnly } from 'ol/events/condition.js';
	import GeoJSON from 'ol/format/GeoJSON.js';
	import type { Feature } from 'ol';
	import type { Geometry } from 'ol/geom';
	import type { SelectEvent } from 'ol/interaction/Select';
	import type { DragAndDropEvent } from 'ol/interaction/DragAndDrop';
	import type { DrawEvent } from 'ol/interaction/Draw';
	import type MapBrowserEvent from 'ol/MapBrowserEvent';

	import { mapStore } from '$lib/stores/map.store.svelte';
	import { DEFAULT_CENTER, DEFAULT_ZOOM } from '$lib/config/constants';
	import { topoJsonDragFormat } from '$lib/services/ol-topojson-format';

	let { children } = $props();

	let mapElement = $state<HTMLElement>();
	let map = $state<Map>();
	let vectorSource = $state<VectorSource<Feature<Geometry>>>();
	let vectorLayer = $state<VectorLayer<VectorSource<Feature<Geometry>>>>();
	let basemapLayer = $state<TileLayer<OSM>>();

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
			style: undefined,
			hitTolerance: 5
		});
		map.addInteraction(select);
		select.on('select', (e: SelectEvent) => {
			const selected = e.selected[0] || null;
			mapStore.selectFeature(selected as Feature<Geometry> | null);
		});

		// Interaction: DragAndDrop
		const dragAndDrop = new DragAndDrop({
			formatConstructors: [GeoJSON as unknown as typeof GeoJSON, topoJsonDragFormat as unknown as typeof GeoJSON]
		});
		map.addInteraction(dragAndDrop);
		dragAndDrop.on('addfeatures', (e: DragAndDropEvent) => {
			if (e.features) {
				vectorSource?.addFeatures(e.features as Feature<Geometry>[]);
				syncStoreFromMap();
			}
		});

		// Interaction: Modify
		const modify = new Modify({
			source: vectorSource,
			condition: (e: unknown) => {
				// Type refinement for OpenLayers MapBrowserEvent
				if (e && typeof e === 'object' && 'originalEvent' in e) {
					const event = e as MapBrowserEvent<PointerEvent | KeyboardEvent | WheelEvent>;
					return shiftKeyOnly(event) || event.type === 'pointerdown';
				}
				return false;
			}
		});
		map.addInteraction(modify);
		modify.on('modifyend', () => syncStoreFromMap());

		// Sync store initial state
		if (mapStore.features.length > 0) {
			vectorSource.addFeatures(mapStore.features as Feature<Geometry>[]);
		}

		return () => {
			map?.setTarget(undefined);
		};
	});

	// Effect: Sync Map Features from Store
	$effect(() => {
		if (!vectorSource || !mapStore.features || mapStore.skipFeaturesSync) {
			mapStore.skipFeaturesSync = false;
			return;
		}
		vectorSource.clear();
		vectorSource.addFeatures(mapStore.features as Feature<Geometry>[]);
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

		// We cast to unknown then to type because OL draw types are strict strings
		const olType = type as unknown as import('ol/geom/Geometry').Type;
		const geometryFunction = undefined;

		const draw = new Draw({
			source: vectorSource,
			type: olType,
			geometryFunction
		});

		draw.on('drawend', (e: DrawEvent) => {
			const feature = e.feature;
			if (!feature.getId()) {
				feature.setId(`f_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
			}
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
		mapStore.setFeatures(features as Feature<Geometry>[]);
	}
</script>

<div bind:this={mapElement} class="relative h-full w-full outline-none bg-muted/20">
	{@render children?.()}
</div>

<style>
	:global(.ol-viewport) {
		outline: none !important;
	}
</style>
