<script lang="ts">
	import { mapStore } from '$lib/stores/map.store.svelte';
	import type Map from 'ol/Map.js';
	import { toLonLat } from 'ol/proj.js';
	import type { ProjectionCode } from '$lib/types/map.types';

	let { map, projection } = $props<{
		map: Map | undefined;
		projection: ProjectionCode;
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
	<div class="flex w-full items-center justify-center gap-6 px-2">
		<div class="flex items-center gap-1.5">
			<span class="text-muted-foreground text-[9px] font-bold tracking-wider uppercase">Lon</span>
			<span class="text-foreground min-w-[60px] font-mono text-xs font-semibold">{coords.lon}</span>
		</div>
		<div class="flex items-center gap-1.5">
			<span class="text-muted-foreground text-[9px] font-bold tracking-wider uppercase">Lat</span>
			<span class="text-foreground min-w-[60px] font-mono text-xs font-semibold">{coords.lat}</span>
		</div>
		<div class="bg-border/40 mx-1 h-3 w-px"></div>
		<div class="flex items-center gap-1.5">
			<span class="text-muted-foreground text-[9px] font-bold tracking-wider uppercase">Zoom</span>
			<span class="text-foreground font-mono text-xs font-semibold">{zoom}</span>
		</div>
		<div class="flex items-center gap-1.5">
			<span class="text-muted-foreground text-[9px] font-bold tracking-wider uppercase"
				>Features</span
			>
			<span class="text-accent font-mono text-xs font-bold">{mapStore.featuresCount}</span>
		</div>
		<div class="flex items-center gap-1.5">
			<span class="text-muted-foreground text-[9px] font-bold tracking-wider uppercase">Proj</span>
			<span class="text-foreground font-mono text-[10px] font-semibold">{projection}</span>
		</div>
	</div>
</div>
