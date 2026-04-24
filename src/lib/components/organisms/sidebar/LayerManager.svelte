<script lang="ts">
	import { mapStore } from '$lib/stores/map.store.svelte';
	import { cn } from '$lib/utils/cn';
	import { Map as MapIcon, Layers, Eye, EyeOff } from 'lucide-svelte';
	import type { BasemapId } from '$lib/types/map.types';

	const basemaps: { id: BasemapId; name: string; thumbnail?: string }[] = [
		{ id: 'osm', name: 'OpenStreetMap' },
		{ id: 'satellite', name: 'Satellite' },
		{ id: 'topo', name: 'Topographic' },
		{ id: 'dark', name: 'Dark Matter' }
	];

	function setBasemap(id: BasemapId) {
		// In a real app, you'd update the map layer here
		// For now we just update the store
		console.log('Setting basemap to:', id);
	}
</script>

<div class="flex h-full flex-col bg-background">
	<div class="border-b px-4 py-2">
		<h3 class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
			<MapIcon class="h-3.5 w-3.5" />
			Basemaps
		</h3>
	</div>

	<div class="grid grid-cols-2 gap-2 p-4">
		{#each basemaps as basemap (basemap.id)}
			<button
				onclick={() => setBasemap(basemap.id)}
				class={cn(
					'flex flex-col items-center gap-2 rounded-lg border p-3 transition-all hover:bg-muted/50',
					'border-border bg-background'
				)}
			>
				<div class="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
					<MapIcon class="h-5 w-5 text-muted-foreground" />
				</div>
				<span class="text-[10px] font-medium">{basemap.name}</span>
			</button>
		{/each}
	</div>

	<div class="border-y px-4 py-2 bg-muted/20">
		<h3 class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
			<Layers class="h-3.5 w-3.5" />
			Vector Layers
		</h3>
	</div>

	<div class="p-4 space-y-4">
		<div class="flex items-center justify-between">
			<div class="flex flex-col gap-0.5">
				<span class="text-xs font-medium">Drawing Layer</span>
				<span class="text-[10px] text-muted-foreground">Your custom drawings</span>
			</div>
			<button 
				onclick={() => mapStore.vectorVisible = !mapStore.vectorVisible}
				class="rounded-md p-1.5 hover:bg-muted transition-colors"
			>
				{#if mapStore.vectorVisible}
					<Eye class="h-4 w-4 text-primary" />
				{:else}
					<EyeOff class="h-4 w-4 text-muted-foreground" />
				{/if}
			</button>
		</div>

		<div class="space-y-2">
			<div class="flex justify-between text-[10px] text-muted-foreground">
				<span>Opacity</span>
				<span>{Math.round(mapStore.vectorOpacity * 100)}%</span>
			</div>
			<input 
				type="range" 
				min="0" 
				max="1" 
				step="0.01" 
				bind:value={mapStore.vectorOpacity}
				class="w-full accent-primary"
			/>
		</div>
	</div>
</div>
