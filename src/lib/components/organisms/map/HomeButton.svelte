<script lang="ts">
	import { onMount } from 'svelte';
	import { Home } from 'lucide-svelte';
	import type Map from 'ol/Map.js';
	import Control from 'ol/control/Control';
	import Button from '$lib/components/atoms/Button.svelte';
	import Tooltip from '$lib/components/atoms/Tooltip.svelte';
	import { fromLonLat } from 'ol/proj.js';
	import { DEFAULT_CENTER, DEFAULT_ZOOM } from '$lib/config/constants';

	let { map, standalone = true } = $props<{ map: Map | undefined; standalone?: boolean }>();

	let element = $state<HTMLElement>();

	onMount(() => {
		if (map && element) {
			const homeControl = standalone ? new Control({ element }) : null;
			if (homeControl) map.addControl(homeControl);
			
			return () => {
				if (homeControl) map.removeControl(homeControl);
			};
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

<div bind:this={element} class={standalone ? "ol-home-button ol-unselectable ol-control" : "ol-unselectable"}>
	<Tooltip content="Reset View" side="right">
		<Button
			tag="span"
			variant="secondary"
			size="icon"
			class="premium-control h-9 w-9 rounded-full transition-all duration-300"
			onclick={handleGoHome}
		>
			<Home class="h-4 w-4" />
		</Button>
	</Tooltip>
</div>
