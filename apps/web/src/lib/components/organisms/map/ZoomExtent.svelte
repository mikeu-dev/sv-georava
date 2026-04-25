<script lang="ts">
	import { onMount } from 'svelte';
	import { Maximize } from 'lucide-svelte';
	import type { Map } from '@geovara/core';
	import Control from 'ol/control/Control';
	import Button from '$lib/components/atoms/Button.svelte';
	import Tooltip from '$lib/components/atoms/Tooltip.svelte';

	let { map, standalone = true } = $props<{ map: Map | undefined; standalone?: boolean }>();

	let element = $state<HTMLElement>();

	onMount(() => {
		if (map && element) {
			const zoomExtentControl = standalone ? new Control({ element }) : null;
			if (zoomExtentControl) map.addControl(zoomExtentControl);
			
			return () => {
				if (zoomExtentControl) map.removeControl(zoomExtentControl);
			};
		}
	});

	function handleZoomToExtent() {
		if (!map) return;
		const layers = map.getLayers().getArray();
		const vectorLayer = layers.find((l: import('ol/layer/Base').default) => {
			const source = l.get('source');
			return l.get('name') === 'vectorLayer' || (source && typeof source.getFeatures === 'function');
		});
		
		if (vectorLayer) {
			const source = vectorLayer.get('source');
			if (source && source.getFeatures().length > 0) {
				map.getView().fit(source.getExtent(), {
					duration: 1000,
					padding: [50, 50, 50, 50]
				});
				return;
			}
		}
		
		// Fallback to all data extent
		map.getView().animate({ zoom: 2, duration: 800 });
	}
</script>

<div bind:this={element} class={standalone ? "ol-zoom-extent ol-unselectable ol-control" : "ol-unselectable"}>
	<Tooltip content="Zoom to Data Extent" side="right">
		<Button
			tag="span"
			variant="secondary"
			size="icon"
			class="premium-control h-9 w-9 rounded-full transition-all duration-300"
			onclick={handleZoomToExtent}
		>
			<Maximize class="h-4 w-4" />
		</Button>
	</Tooltip>
</div>
