<script lang="ts">
	import { onMount } from 'svelte';
	import { Home } from 'lucide-svelte';
	import type Map from 'ol/Map.js';
	import Control from 'ol/control/Control';
	import Button from '$lib/components/atoms/Button.svelte';
	import Tooltip from '$lib/components/atoms/Tooltip.svelte';
	import { fromLonLat } from 'ol/proj.js';
	import { DEFAULT_CENTER, DEFAULT_ZOOM } from '$lib/config/constants';

	let { map } = $props<{ map: Map | undefined }>();

	let element = $state<HTMLElement>();

	onMount(() => {
		if (map && element) {
			const homeControl = new Control({
				element: element
			});
			map.addControl(homeControl);
			return () => map.removeControl(homeControl);
		}
	});

	function handleGoHome() {
		if (!map) return;
		map.getView().animate({
			center: fromLonLat(DEFAULT_CENTER),
			zoom: DEFAULT_ZOOM,
			duration: 1000
		});
	}
</script>

<div bind:this={element} class="ol-home-button ol-unselectable ol-control">
	<Tooltip content="Reset View" side="right">
		<Button
			variant="secondary"
			size="icon"
			class="premium-control"
			onclick={handleGoHome}
		>
			<Home class="h-4 w-4" />
		</Button>
	</Tooltip>
</div>
