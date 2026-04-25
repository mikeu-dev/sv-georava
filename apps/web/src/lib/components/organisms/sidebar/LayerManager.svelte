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
		mapStore.activeBasemap = id;
	}
</script>

<div class="bg-background flex h-full flex-col">
	<div class="border-b px-4 py-2">
		<h3
			class="text-muted-foreground flex items-center gap-2 text-xs font-semibold tracking-wider uppercase"
		>
			<MapIcon class="h-3.5 w-3.5" />
			Basemaps
		</h3>
	</div>

	<div class="grid grid-cols-2 gap-2 p-4">
		{#each basemaps as basemap (basemap.id)}
			<button
				onclick={() => setBasemap(basemap.id)}
				class={cn(
					'hover:bg-muted/50 flex flex-col items-center gap-2 rounded-lg border p-3 transition-all',
					'border-border bg-background'
				)}
			>
				<div class="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
					<MapIcon class="text-muted-foreground h-5 w-5" />
				</div>
				<span class="text-[10px] font-medium">{basemap.name}</span>
			</button>
		{/each}
	</div>

	<div class="bg-muted/20 border-y px-4 py-2">
		<h3
			class="text-muted-foreground flex items-center gap-2 text-xs font-semibold tracking-wider uppercase"
		>
			<Layers class="h-3.5 w-3.5" />
			Vector Layers
		</h3>
	</div>

	<div class="space-y-4 p-4">
		<div class="flex items-center justify-between">
			<div class="flex flex-col gap-0.5">
				<span class="text-xs font-medium">Drawing Layer</span>
				<span class="text-muted-foreground text-[10px]">Your custom drawings</span>
			</div>
			<button
				onclick={() => (mapStore.vectorVisible = !mapStore.vectorVisible)}
				class="hover:bg-muted rounded-md p-1.5 transition-colors"
			>
				{#if mapStore.vectorVisible}
					<Eye class="text-primary h-4 w-4" />
				{:else}
					<EyeOff class="text-muted-foreground h-4 w-4" />
				{/if}
			</button>
		</div>

		<div class="space-y-2">
			<div class="text-muted-foreground flex justify-between text-[10px]">
				<span>Opacity</span>
				<span>{Math.round(mapStore.vectorOpacity * 100)}%</span>
			</div>
			<input
				type="range"
				min="0"
				max="1"
				step="0.01"
				bind:value={mapStore.vectorOpacity}
				class="accent-primary w-full"
			/>
		</div>
	</div>
</div>
