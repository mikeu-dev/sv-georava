<script lang="ts">
	import { onMount } from 'svelte';
	import 'ol/ol.css';
	import Map from 'ol/Map.js';
	import View from 'ol/View.js';
	import TileLayer from 'ol/layer/Tile.js';
	import VectorLayer from 'ol/layer/Vector.js';
	import ImageLayer from 'ol/layer/Image.js';
	import LayerGroup from 'ol/layer/Group.js';
	import Layer from 'ol/layer/Layer.js';
	import VectorSource from 'ol/source/Vector.js';
	import OSM from 'ol/source/OSM.js';
	import XYZ from 'ol/source/XYZ.js';
	import TileSource from 'ol/source/Tile.js';
	import ImageSource from 'ol/source/Image.js';
	import Tile from 'ol/Tile.js';
	import ImageCanvasSource from 'ol/source/ImageCanvas.js';
	import Feature from 'ol/Feature.js';
	import Collection from 'ol/Collection.js';
	import Overlay from 'ol/Overlay.js';
	import BaseObject from 'ol/Object.js';
	import * as proj from 'ol/proj.js';
	import { Style, Fill, Stroke, Icon, Circle as CircleStyle, Text, RegularShape, Image as ImageStyle } from 'ol/style.js';
	import { defaults as defaultControls, ScaleLine } from 'ol/control.js';
	import Control from 'ol/control/Control.js';
	import { Draw, Modify, Select, DragAndDrop } from 'ol/interaction.js';
	import { createBox } from 'ol/interaction/Draw.js';
	import { shiftKeyOnly } from 'ol/events/condition.js';
	import GeoJSON from 'ol/format/GeoJSON.js';
import MVT from 'ol/format/MVT.js';
import WKT from 'ol/format/WKT.js';
import LRUCache from 'ol/structs/LRUCache.js';
import Observable from 'ol/Observable.js';
import * as events from 'ol/events.js';
import RenderFeature from 'ol/render/Feature.js';
import * as extent from 'ol/extent.js';
import * as sphere from 'ol/sphere.js';

	import type { SelectEvent } from 'ol/interaction/Select';
	import type { DragAndDropEvent } from 'ol/interaction/DragAndDrop';
	import type { DrawEvent } from 'ol/interaction/Draw';
	import type MapBrowserEvent from 'ol/MapBrowserEvent';
	import Point from 'ol/geom/Point.js';
	import LineString from 'ol/geom/LineString.js';
	import Polygon from 'ol/geom/Polygon.js';
	import Circle from 'ol/geom/Circle.js';
	import MultiPoint from 'ol/geom/MultiPoint.js';
	import MultiLineString from 'ol/geom/MultiLineString.js';
	import MultiPolygon from 'ol/geom/MultiPolygon.js';
	import BaseGeometry from 'ol/geom/Geometry.js';
	import GeometryCollection from 'ol/geom/GeometryCollection.js';
	import VectorTileLayer from 'ol/layer/VectorTile.js';
	import BaseLayer from 'ol/layer/Base.js';
	import VectorTileSource from 'ol/source/VectorTile.js';
	import Source from 'ol/source/Source.js';
	import { createMap, onMapEvent, getMapState, addSelectInteraction, addModifyInteraction, addDragAndDropInteraction, addDrawInteraction, setBasemap, setLayerOpacity, setLayerVisibility } from '@geovara/core';
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
	import DrawingToolbar from './DrawingToolbar.svelte';
	import HomeButton from './HomeButton.svelte';
	import ZoomExtent from './ZoomExtent.svelte';
	import GeolocationTool from './GeolocationTool.svelte';
	import { Plus, Minus } from 'lucide-svelte';
	import IconButton from '../../molecules/IconButton.svelte';

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const PlusIcon = Plus as any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const MinusIcon = Minus as any;

	let { children } = $props<{
		children?: import('svelte').Snippet;
	}>();

	let mapElement = $state<HTMLElement>();
	let map = $state<Map>();
	let vectorSource = $state<VectorSource<Feature<BaseGeometry>>>();
	let vectorLayer = $state<VectorLayer<VectorSource<Feature<BaseGeometry>>>>();
	let basemapLayer = $state<TileLayer<OSM | XYZ>>();

	let isPopupOpen = $state(false);
	let isLoading = $state(true);

	let leftStackElement = $state<HTMLElement>();

	// Initialize Map
	onMount(() => {
		if (!mapElement) return;

		// Expose ol globally for ol-cesium CDN compatibility
		const DummyClass = class {};
		const createProxy = (obj: Record<string, unknown>) => new Proxy(obj, {
			get: (target, prop) => {
				if (typeof prop === 'string') {
					return prop in target ? target[prop] : DummyClass;
				}
				return Reflect.get(target, prop);
			}
		});

		// @ts-expect-error - ol is not defined on window
		window.ol = {
			Map,
			View,
			Tile,
			Observable,
			Overlay,
			Feature,
			Collection,
			Object: BaseObject,
			events,
			layer: createProxy({
				Tile: TileLayer,
				Vector: VectorLayer,
				Group: LayerGroup,
				Layer,
				Image: ImageLayer,
				VectorTile: VectorTileLayer,
				Base: BaseLayer
			}),
			source: createProxy({
				Vector: VectorSource,
				OSM,
				XYZ,
				Tile: TileSource,
				Image: ImageSource,
				ImageCanvas: ImageCanvasSource,
				VectorTile: VectorTileSource,
				Source: Source
			}),
			format: createProxy({ GeoJSON, MVT, WKT }),
			style: createProxy({ Style, Fill, Stroke, Icon, Circle: CircleStyle, Text, RegularShape, Image: ImageStyle }),
			structs: createProxy({ LRUCache }),
			render: createProxy({ Feature: RenderFeature }),
			extent,
			sphere,
			proj,
			geom: createProxy({
				Point,
				LineString,
				Polygon,
				Circle,
				MultiPoint,
				MultiLineString,
				MultiPolygon,
				Geometry: BaseGeometry,
				GeometryCollection
			}),
			interaction: createProxy({ Draw, Modify, Select, DragAndDrop, createBox })
		};

		// Add left stack as a single control
		if (leftStackElement && map) {
			const leftStackControl = new Control({
				element: leftStackElement
			});
			map.addControl(leftStackControl);
		}

		map = createMap({
			target: mapElement,
			center: DEFAULT_CENTER,
			zoom: DEFAULT_ZOOM
		});

		// Extract basemapLayer from the map created by core
		basemapLayer = map.getLayers().getArray()[0] as TileLayer<OSM | XYZ>;
		
		vectorSource = new VectorSource({ wrapX: false });
		vectorLayer = new VectorLayer({
			source: vectorSource,
			zIndex: 10
		});
		map.addLayer(vectorLayer);

		// Sync Map -> URL on moveend using core function wrapper
		onMapEvent(map, 'moveend', () => {
			if (!map) return;
			const state = getMapState(map);
			const mapHash = `${state.zoom.toFixed(2)}/${state.center[1].toFixed(4)}/${state.center[0].toFixed(4)}`;
			updateUrlHash({ map: mapHash });
		});

		// Interaction: Select
		const select = addSelectInteraction(map, {
			style: undefined,
			hitTolerance: 5
		});
		select.on('select', (e: SelectEvent) => {
			const selected = e.selected[0] || null;
			mapStore.selectFeature(selected as Feature<BaseGeometry> | null);
		});

		// Interaction: DragAndDrop
		const dragAndDrop = addDragAndDropInteraction(map, {
			formatConstructors: [
				GeoJSON as unknown as typeof GeoJSON,
				topoJsonDragFormat as unknown as typeof GeoJSON
			]
		});
		dragAndDrop.on('addfeatures', (e: DragAndDropEvent) => {
			if (e.features) {
				vectorSource?.addFeatures(e.features as Feature<BaseGeometry>[]);
				syncStoreFromMap();
			}
		});

		// Interaction: Modify
		const modify = addModifyInteraction(map, {
			source: vectorSource,
			condition: (e: unknown) => {
				if (e && typeof e === 'object' && 'originalEvent' in e) {
					const event = e as MapBrowserEvent<PointerEvent>;
					return shiftKeyOnly(event) || event.type === 'pointerdown';
				}
				return false;
			}
		});
		modify.on('modifyend', () => syncStoreFromMap());

		// Sync store initial state
		if (mapStore.features.length > 0) {
			vectorSource.addFeatures(mapStore.features as Feature<BaseGeometry>[]);
		}

		// Initial View State from URL
		const initialMapHash = getFromHash('map');
		if (initialMapHash) {
			const parsed = parseMapHash(initialMapHash);
			if (parsed) {
				map.getView().setCenter(proj.fromLonLat([parsed.lon, parsed.lat]));
				map.getView().setZoom(parsed.zoom);
			}
		}


		// Sync URL -> Map on hashchange
		const handleHashChange = () => {
			if (!map) return;
			const mapHash = getFromHash('map');
			if (mapHash) {
				const parsed = parseMapHash(mapHash);
				if (parsed) {
					map.getView().setCenter(proj.fromLonLat([parsed.lon, parsed.lat]));
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
		vectorSource.addFeatures(mapStore.features as Feature<BaseGeometry>[]);
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

		let olType: import('ol/geom/Geometry').Type;
		let drawOptions: import('ol/interaction/Draw').Options = {
			source: vectorSource,
			type: 'Point' // fallback
		};

		if (type === 'Rectangle') {
			olType = 'Circle';
			drawOptions.geometryFunction = createBox();
		} else if (type === 'Freehand') {
			olType = 'LineString';
			drawOptions.freehand = true;
		} else if (type === 'Text') {
			olType = 'Point';
		} else {
			olType = type as import('ol/geom/Geometry').Type;
		}

		drawOptions.type = olType;
		const draw = addDrawInteraction(map, drawOptions);

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
			setLayerOpacity(vectorLayer, mapStore.vectorOpacity);
			setLayerVisibility(vectorLayer, mapStore.vectorVisible);
		}
		if (basemapLayer) {
			setLayerOpacity(basemapLayer, mapStore.basemapOpacity);
		}
	});

	// Effect: Basemap Switcher
	$effect(() => {
		if (!basemapLayer) return;
		const def = BASEMAPS.find((b) => b.id === mapStore.activeBasemap);
		if (def) {
			setBasemap(basemapLayer, def);
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
				mapStore.selectFeature(feature as Feature<BaseGeometry>);
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
		mapStore.setFeatures(features as Feature<BaseGeometry>[]);
	}

	function handleZoom(delta: number) {
		if (!map) return;
		const view = map.getView();
		const currentZoom = view.getZoom();
		if (currentZoom !== undefined) {
			view.animate({
				zoom: currentZoom + delta,
				duration: 250
			});
		}
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

	<!-- 🛸 Floating Islands -->
	
	<!-- Top-Left: Discovery & Navigation -->
	<div class="absolute left-4 top-4 z-40 flex flex-col gap-2">
		<LocationSearch {map} />
		
		<div class="ol-panel flex flex-col gap-1 w-fit">
			<IconButton
				icon={PlusIcon}
				label="Zoom In"
				onclick={() => handleZoom(1)}
				variant="secondary"
				class="h-9 w-9"
			/>
			<IconButton
				icon={MinusIcon}
				label="Zoom Out"
				onclick={() => handleZoom(-1)}
				variant="secondary"
				class="h-9 w-9"
			/>
			<div class="bg-border/40 mx-auto my-0.5 h-px w-6"></div>
			<Compass {map} standalone={false} />
			<HomeButton {map} standalone={false} />
			<ZoomExtent {map} standalone={false} />
			<GeolocationTool {map} standalone={false} />
		</div>
	</div>

	<!-- Top-Right: Engine & View Mode -->
	<div class="absolute right-4 top-4 z-40 flex flex-col gap-2 items-end">
		<SceneViewSwitcher {map} />
	</div>

	<!-- Top-Center: Global Tools & Analysis -->
	<div class="absolute left-1/2 top-4 z-40 -translate-x-1/2 flex flex-row gap-2 items-start">
		<DrawingToolbar {map} />
		<MeasurementController
			{map}
			activeType={mapStore.drawType as 'MeasureDistance' | 'MeasureArea' | null}
		/>
	</div>

	<!-- Right-Center: Contextual Tools (Empty for now) -->
	<div class="absolute right-4 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2 items-end">
	</div>

	<!-- Bottom-Right: Map Config -->
	<div class="absolute right-4 bottom-12 z-40 flex flex-col gap-2 items-end">
		<BasemapSwitcher {map} />
		<MapScreenshot {map} />
	</div>

	<!-- Bottom-Center: Instrumentation -->
	<StatusBar {map} projection={mapStore.projection} />

	<CesiumController {map} enabled={mapStore.is3d} />

	{#if isPopupOpen && mapStore.selectedFeature}
		<FeaturePropertiesPopup
			feature={mapStore.selectedFeature}
			onOpenChange={(open) => {
				if (!open) mapStore.selectFeature(null);
			}}
		/>
	{/if}
	{@render children?.()}
</div>

<style>
	:global(.ol-viewport) {
		outline: none !important;
	}
</style>
