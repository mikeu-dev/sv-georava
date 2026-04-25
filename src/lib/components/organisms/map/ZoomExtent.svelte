<script lang="ts">
	import { onMount } from 'svelte';
	import { Maximize } from 'lucide-svelte';
	import type Map from 'ol/Map.js';
	import Control from 'ol/control/Control';
	import Button from '$lib/components/atoms/Button.svelte';
	import Tooltip from '$lib/components/atoms/Tooltip.svelte';

	let { map } = $props<{ map: Map | undefined }>();

	let element = $state<HTMLElement>();

	onMount(() => {
		if (map && element) {
			const zoomExtentControl = new Control({
				element: element
			});
			map.addControl(zoomExtentControl);
			return () => map.removeControl(zoomExtentControl);
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

<div bind:this={element} class="ol-zoom-extent ol-unselectable ol-control">
	<Tooltip content="Zoom to Data Extent" side="right">
		<Button
			variant="secondary"
			size="icon"
			class="premium-control"
			onclick={handleZoomToExtent}
		>
			<Maximize class="h-4 w-4" />
		</Button>
	</Tooltip>
</div>
