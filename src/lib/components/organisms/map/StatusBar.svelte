<script lang="ts">
	import { mapStore } from '$lib/stores/map.store.svelte';
	import type Map from 'ol/Map.js';
	import { toLonLat } from 'ol/proj.js';
	import type { ProjectionCode } from '$lib/types/map.types';

	let { map, projection } = $props<{ 
		map: Map | undefined, 
		projection: ProjectionCode 
	}>();

	let coords = $state({ lon: '0.0000', lat: '0.0000' });
	let zoom = $state('0.0');

	$effect(() => {
		if (!map) return;

		const updateStatus = () => {
			const view = map.getView();
			const center = view.getCenter();
			const currentZoom = view.getZoom();
			
			if (center) {
				const lonLat = toLonLat(center, projection);
				coords = {
					lon: lonLat[0].toFixed(4),
					lat: lonLat[1].toFixed(4)
				};
			}
			
			if (currentZoom !== undefined) {
				zoom = currentZoom.toFixed(1);
			}
		};

		map.on('moveend', updateStatus);
		updateStatus(); // Initial call

		return () => map.un('moveend', updateStatus);
	});
</script>

<div class="status-bar ol-unselectable ol-control pointer-events-auto">
	<div class="flex items-center gap-6 justify-center w-full px-2">
		<div class="flex items-center gap-1.5">
			<span class="text-muted-foreground uppercase text-[9px] font-bold tracking-wider">Lon</span>
			<span class="min-w-[60px] text-foreground font-semibold font-mono text-xs">{coords.lon}</span>
		</div>
		<div class="flex items-center gap-1.5">
			<span class="text-muted-foreground uppercase text-[9px] font-bold tracking-wider">Lat</span>
			<span class="min-w-[60px] text-foreground font-semibold font-mono text-xs">{coords.lat}</span>
		</div>
		<div class="h-3 w-px bg-border/40 mx-1"></div>
		<div class="flex items-center gap-1.5">
			<span class="text-muted-foreground uppercase text-[9px] font-bold tracking-wider">Zoom</span>
			<span class="text-foreground font-semibold font-mono text-xs">{zoom}</span>
		</div>
		<div class="flex items-center gap-1.5">
			<span class="text-muted-foreground uppercase text-[9px] font-bold tracking-wider">Features</span>
			<span class="text-accent font-bold font-mono text-xs">{mapStore.featuresCount}</span>
		</div>
		<div class="flex items-center gap-1.5">
			<span class="text-muted-foreground uppercase text-[9px] font-bold tracking-wider">Proj</span>
			<span class="text-foreground font-semibold font-mono text-[10px]">{projection}</span>
		</div>
	</div>
</div>
