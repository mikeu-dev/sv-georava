<script lang="ts">
	import { mapStore } from '$lib/stores/map.store.svelte';

	let coords = $state({ lon: '0.0000', lat: '0.0000' });
	let zoom = $state('0.0');

	// Note: In a real app, this would be updated via an event from the map instance.
	// For now, we'll keep it as a placeholder that will be wired up in MapCanvas.
</script>

<div class="status-bar ol-unselectable ol-control pointer-events-auto">
	<div class="flex items-center gap-6 justify-center w-full">
		<div class="flex items-center gap-1.5">
			<span class="text-muted-foreground uppercase text-[9px] font-bold tracking-wider">Lon</span>
			<span class="min-w-[60px] text-foreground font-semibold">{coords.lon}</span>
		</div>
		<div class="flex items-center gap-1.5">
			<span class="text-muted-foreground uppercase text-[9px] font-bold tracking-wider">Lat</span>
			<span class="min-w-[60px] text-foreground font-semibold">{coords.lat}</span>
		</div>
		<div class="h-3 w-px bg-border/40 mx-1"></div>
		<div class="flex items-center gap-1.5">
			<span class="text-muted-foreground uppercase text-[9px] font-bold tracking-wider">Zoom</span>
			<span class="text-foreground font-semibold">{zoom}</span>
		</div>
		<div class="flex items-center gap-1.5">
			<span class="text-muted-foreground uppercase text-[9px] font-bold tracking-wider">Features</span>
			<span class="text-accent font-bold">{mapStore.featuresCount}</span>
		</div>
	</div>
</div>
