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
	import DrawingToolbar from './DrawingToolbar.svelte';
	import HomeButton from './HomeButton.svelte';
	import ZoomExtent from './ZoomExtent.svelte';
	import GeolocationTool from './GeolocationTool.svelte';

	let { children, user } = $props<{
		children?: import('svelte').Snippet;
		user: { name: string; email: string; image?: string | null } | null;
	}>();

	let mapElement = $state<HTMLElement>();
	let map = $state<Map>();
	let vectorSource = $state<VectorSource<Feature<BaseGeometry>>>();
	let vectorLayer = $state<VectorLayer<VectorSource<Feature<BaseGeometry>>>>();
	let basemapLayer = $state<TileLayer<OSM | XYZ>>();

	let isPopupOpen = $state(false);
	let isLoading = $state(true);

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
				center: proj.fromLonLat(DEFAULT_CENTER),
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
			mapStore.selectFeature(selected as Feature<BaseGeometry> | null);
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
				vectorSource?.addFeatures(e.features as Feature<BaseGeometry>[]);
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

		// Sync Map -> URL on moveend
		map.on('moveend', () => {
			if (!map) return;
			const view = map.getView();
			const center = proj.toLonLat(view.getCenter() || [0, 0]);
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
		const draw = new Draw(drawOptions);

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

	<!-- Map Overlay Components (Internal Controls) -->
	<LocationSearch {map} />
	<UserMenu {user} {map} />
	<Compass {map} />
	<HomeButton {map} />
	<ZoomExtent {map} />
	<GeolocationTool {map} />

	<SceneViewSwitcher {map} />
	<DrawingToolbar {map} />
	<BasemapSwitcher {map} />
	<MapScreenshot {map} />

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
	{@render children?.()}
</div>

<style>
	:global(.ol-viewport) {
		outline: none !important;
	}
</style>
