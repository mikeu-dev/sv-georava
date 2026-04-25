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
	import { BASEMAPS } from '$lib/config/basemaps';
	import { topoJsonDragFormat } from '$lib/services/ol-topojson-format';
	import { updateUrlHash, getFromHash, parseMapHash } from '$lib/services/url-state.service';

	import Compass from './Compass.svelte';
	import BasemapSwitcher from './BasemapSwitcher.svelte';
	import LocationSearch from './LocationSearch.svelte';
	import MeasurementController from './MeasurementController.svelte';
	import MapScreenshot from './MapScreenshot.svelte';
	import FeaturePropertiesPopup from './FeaturePropertiesPopup.svelte';
	import CesiumController from './CesiumController.svelte';
	import StatusBar from './StatusBar.svelte';
	import SceneViewSwitcher from './SceneViewSwitcher.svelte';
	import UserMenu from '../auth/UserMenu.svelte';

	let { children, user } = $props<{
		children?: import('svelte').Snippet;
		user: { name: string; email: string; image?: string | null } | null;
	}>();

	let mapElement = $state<HTMLElement>();
	let map = $state<Map>();
	let vectorSource = $state<VectorSource<Feature<Geometry>>>();
	let vectorLayer = $state<VectorLayer<VectorSource<Feature<Geometry>>>>();
	let basemapLayer = $state<TileLayer<OSM | XYZ>>();

	let isPopupOpen = $state(false);
	let isLoading = $state(true);

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
			formatConstructors: [
				GeoJSON as unknown as typeof GeoJSON,
				topoJsonDragFormat as unknown as typeof GeoJSON
			]
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
				if (e && typeof e === 'object' && 'originalEvent' in e) {
					const event = e as MapBrowserEvent<PointerEvent>;
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

		// Initial View State from URL
		const initialMapHash = getFromHash('map');
		if (initialMapHash) {
			const parsed = parseMapHash(initialMapHash);
			if (parsed) {
				map.getView().setCenter(fromLonLat([parsed.lon, parsed.lat]));
				map.getView().setZoom(parsed.zoom);
			}
		}

		// Sync Map -> URL on moveend
		map.on('moveend', () => {
			if (!map) return;
			const view = map.getView();
			const center = toLonLat(view.getCenter() || [0, 0]);
			const zoom = view.getZoom() || DEFAULT_ZOOM;
			const mapHash = `${zoom.toFixed(2)}/${center[1].toFixed(4)}/${center[0].toFixed(4)}`;
			updateUrlHash({ map: mapHash });
		});

		// Sync URL -> Map on hashchange
		const handleHashChange = () => {
			if (!map) return;
			const mapHash = getFromHash('map');
			if (mapHash) {
				const parsed = parseMapHash(mapHash);
				if (parsed) {
					map.getView().setCenter(fromLonLat([parsed.lon, parsed.lat]));
					map.getView().setZoom(parsed.zoom);
				}
			}
		};
		window.addEventListener('hashchange', handleHashChange);

		setTimeout(() => {
			isLoading = false;
		}, 800);

		return () => {
			window.removeEventListener('hashchange', handleHashChange);
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
		if (!type || type === 'Edit' || type === 'Delete' || type.startsWith('Measure')) return;

		const olType = type as import('ol/geom/Geometry').Type;
		const draw = new Draw({
			source: vectorSource,
			type: olType
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
		if (basemapLayer) {
			basemapLayer.setOpacity(mapStore.basemapOpacity);
		}
	});

	// Effect: Basemap Switcher
	$effect(() => {
		if (!basemapLayer) return;
		const def = BASEMAPS.find((b) => b.id === mapStore.activeBasemap);
		if (def) {
			const source = def.isXYZ
				? new XYZ({ url: def.url, attributions: def.attributions, maxZoom: def.maxZoom })
				: new OSM();
			basemapLayer.setSource(source);
		}
	});

	// Effect: Zoom To ID
	$effect(() => {
		if (!map || !vectorSource || !mapStore.zoomToId) return;
		const feature = vectorSource.getFeatureById(mapStore.zoomToId);
		if (feature) {
			const geom = feature.getGeometry();
			if (geom) {
				map.getView().fit(geom.getExtent(), {
					duration: 1000,
					padding: [50, 50, 50, 50],
					maxZoom: 18
				});
				mapStore.selectFeature(feature as Feature<Geometry>);
			}
		}
	});

	// Effect: Popup State
	$effect(() => {
		if (mapStore.selectedFeature) {
			setTimeout(() => (isPopupOpen = true), 50);
		} else {
			isPopupOpen = false;
		}
	});

	function syncStoreFromMap() {
		if (!vectorSource) return;
		const features = vectorSource.getFeatures();
		mapStore.skipFeaturesSync = true;
		mapStore.setFeatures(features as Feature<Geometry>[]);
	}
</script>

<div class="relative h-full w-full overflow-hidden">
	<div bind:this={mapElement} class="bg-muted/20 h-full w-full outline-none"></div>

	{#if isLoading}
		<div
			class="loading-overlay absolute inset-0 flex flex-col items-center justify-center gap-4 transition-opacity duration-500"
		>
			<div class="loading-spinner h-10 w-10 rounded-full border-4 border-muted/30"></div>
			<div class="animate-pulse-subtle flex flex-col items-center gap-1">
				<span class="text-xs font-bold tracking-widest uppercase opacity-70">Georava</span>
				<span class="text-muted-foreground text-[10px]">Initializing Engine...</span>
			</div>
		</div>
	{/if}

	<!-- Map Overlay Components -->
	<div class="pointer-events-none absolute inset-0 z-20">
		<LocationSearch {map} />

		<div class="absolute top-3 right-3 flex flex-col items-end gap-3">
			<UserMenu {user} />
			<Compass {map} />
			<SceneViewSwitcher />
			{@render children?.()}
		</div>

		<div class="absolute right-3 bottom-12 flex flex-col items-end gap-2">
			<BasemapSwitcher />
			<MapScreenshot {map} />
		</div>

		<MeasurementController
			{map}
			activeType={mapStore.drawType as 'MeasureDistance' | 'MeasureArea' | null}
		/>
		<CesiumController {map} enabled={mapStore.is3d} />

		<StatusBar {map} projection={mapStore.projection} />

		{#if isPopupOpen && mapStore.selectedFeature}
			<FeaturePropertiesPopup
				feature={mapStore.selectedFeature}
				onOpenChange={(open) => {
					if (!open) mapStore.selectFeature(null);
				}}
			/>
		{/if}
	</div>
</div>

<style>
	:global(.ol-viewport) {
		outline: none !important;
	}
</style>
