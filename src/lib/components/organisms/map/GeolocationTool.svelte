<script lang="ts">
	import { onMount } from 'svelte';
	import { Navigation } from 'lucide-svelte';
	import type { Map } from 'ol';
	import Control from 'ol/control/Control';
	import Geolocation from 'ol/Geolocation.js';
	import Feature from 'ol/Feature.js';
	import Point from 'ol/geom/Point.js';
	import { Vector as VectorSource } from 'ol/source.js';
	import { Vector as VectorLayer } from 'ol/layer.js';
	import { Style, Circle as CircleStyle, Fill, Stroke } from 'ol/style.js';
	import Button from '$lib/components/atoms/Button.svelte';
	import Tooltip from '$lib/components/atoms/Tooltip.svelte';

	let { map, standalone = true } = $props<{ map: Map | undefined; standalone?: boolean }>();

	let element = $state<HTMLElement>();
	let geolocation = $state<Geolocation>();
	let positionFeature = new Feature();
	let accuracyFeature = new Feature();
	let isTracking = $state(false);

	onMount(() => {
		if (map && element) {
			const geoControl = standalone ? new Control({ element }) : null;
			if (geoControl) map.addControl(geoControl);

			geolocation = new Geolocation({
				trackingOptions: {
					enableHighAccuracy: true
				},
				projection: map.getView().getProjection()
			});

			const vectorSource = new VectorSource({
				features: [accuracyFeature, positionFeature]
			});

			const vectorLayer = new VectorLayer({
				source: vectorSource,
				style: new Style({
					image: new CircleStyle({
						radius: 6,
						fill: new Fill({ color: '#3399CC' }),
						stroke: new Stroke({ color: '#fff', width: 2 })
					})
				}),
				zIndex: 999
			});
			map.addLayer(vectorLayer);

			geolocation.on('change:accuracyGeometry', () => {
				accuracyFeature.setGeometry(geolocation?.getAccuracyGeometry() || undefined);
			});

			geolocation.on('change:position', () => {
				const coordinates = geolocation?.getPosition();
				positionFeature.setGeometry(coordinates ? new Point(coordinates) : undefined);
				if (isTracking && coordinates) {
					map?.getView().animate({
						center: coordinates,
						zoom: 16,
						duration: 1000
					});
				}
			});

			return () => {
				if (geoControl) map?.removeControl(geoControl);
				map?.removeLayer(vectorLayer);
			};
		}
	});

	function toggleTracking() {
		isTracking = !isTracking;
		geolocation?.setTracking(isTracking);
	}
</script>

<div bind:this={element} class={standalone ? "ol-geolocation ol-unselectable ol-control" : "ol-unselectable"}>
	<Tooltip content="My Location" side="right">
		<Button
			tag="span"
			variant="secondary"
			size="icon"
			class="premium-control h-9 w-9 rounded-full transition-all duration-300 {isTracking ? 'text-primary' : ''}"
			onclick={toggleTracking}
		>
			<Navigation class="h-4 w-4" />
		</Button>
	</Tooltip>
</div>
