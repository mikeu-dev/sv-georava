<script lang="ts">
	import { onMount } from 'svelte';
	import { Navigation } from 'lucide-svelte';
	import type { Map } from 'ol';
	import Control from 'ol/control/Control';
	import { createGeolocation } from '@geovara/core';
	import Button from '$lib/components/atoms/Button.svelte';
	import Tooltip from '$lib/components/atoms/Tooltip.svelte';

	let { map, standalone = true } = $props<{ map: Map | undefined; standalone?: boolean }>();

	let element = $state<HTMLElement>();
	let geolocationApi = $state<ReturnType<typeof createGeolocation>>();
	let isTracking = $state(false);

	onMount(() => {
		if (map && element) {
			const geoControl = standalone ? new Control({ element }) : null;
			if (geoControl) map.addControl(geoControl);

			geolocationApi = createGeolocation(map, {
				zoomToPosition: true
			});

			return () => {
				if (geoControl) map?.removeControl(geoControl);
				geolocationApi?.dispose();
			};
		}
	});

	function toggleTracking() {
		isTracking = !isTracking;
		geolocationApi?.setTracking(isTracking);
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
