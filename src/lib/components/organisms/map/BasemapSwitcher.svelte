<script lang="ts">
	import { onMount } from 'svelte';
	import { Layers, Check } from 'lucide-svelte';
	import { DropdownMenu as BitsDropdown } from 'bits-ui';
	import type Map from 'ol/Map.js';
	import Control from 'ol/control/Control';
	import { mapStore } from '$lib/stores/map.store.svelte';
	import { BASEMAPS } from '$lib/config/basemaps';
	import Button from '$lib/components/atoms/Button.svelte';
	import { cn } from '$lib/utils/cn';

	let { map } = $props<{ map: Map | undefined }>();

	let element = $state<HTMLElement>();
	let activeBasemap = $derived(mapStore.activeBasemap);
	let opacity = $state(mapStore.basemapOpacity);

	onMount(() => {
		if (map && element) {
			const basemapControl = new Control({
				element: element
			});
			map.addControl(basemapControl);
			return () => map.removeControl(basemapControl);
		}
	});

	function handleBasemapChange(id: string) {
		mapStore.activeBasemap = id as import('$lib/types/map.types').BasemapId;
	}

	function handleOpacityChange(e: Event) {
		const val = parseFloat((e.target as HTMLInputElement).value);
		opacity = val;
		mapStore.basemapOpacity = val;
	}
</script>

<div bind:this={element} class="ol-basemap-switcher ol-unselectable ol-control">
	<BitsDropdown.Root>
		<BitsDropdown.Trigger class="outline-none">
			<Button
				variant="secondary"
				size="icon"
				class="border-border/50 bg-background/80 hover:bg-background h-10 w-10 rounded-full border shadow-lg backdrop-blur-md transition-all duration-300"
			>
				<Layers class="text-primary h-5 w-5" />
			</Button>
		</BitsDropdown.Trigger>

		<BitsDropdown.Content
			side="left"
			align="start"
			class="bg-popover animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-56 rounded-xl border p-2 shadow-xl backdrop-blur-xl"
			sideOffset={8}
		>
			<div
				class="text-muted-foreground px-2 py-1.5 text-[10px] font-medium tracking-wider uppercase"
			>
				Basemap
			</div>

			{#each BASEMAPS as basemap (basemap.id)}
				<BitsDropdown.Item
					class="hover:bg-accent focus:bg-accent flex w-full cursor-pointer items-center rounded-lg px-2 py-2 text-sm transition-colors outline-none"
					onclick={() => handleBasemapChange(basemap.id)}
				>
					<div
						class={cn(
							'mr-3 h-8 w-12 shrink-0 rounded-md border shadow-sm transition-transform group-hover:scale-105',
							basemap.id === 'osm' && 'bg-blue-400/20',
							basemap.id === 'satellite' && 'bg-emerald-900/40',
							basemap.id === 'dark' && 'bg-slate-900',
							basemap.id === 'topo' && 'bg-orange-200/30'
						)}
					>
						{#if activeBasemap === basemap.id}
							<div class="bg-primary/90 flex h-full w-full items-center justify-center rounded-[inherit]">
								<Check class="h-4 w-4 text-white" />
							</div>
						{/if}
					</div>
					<div class="flex flex-col">
						<span class="text-foreground text-[11px] font-bold leading-none">{basemap.name}</span>
						<span class="text-muted-foreground mt-1 text-[9px]">Standard tiles</span>
					</div>
				</BitsDropdown.Item>
			{/each}

			<div class="bg-border my-1 h-px"></div>

			<div class="px-2 py-2">
				<div class="mb-1.5 flex items-center justify-between">
					<span class="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
						Opacity
					</span>
					<span class="text-muted-foreground font-mono text-[10px]">
						{Math.round(opacity * 100)}%
					</span>
				</div>
				<input
					type="range"
					min="0"
					max="1"
					step="0.05"
					value={opacity}
					oninput={handleOpacityChange}
					class="accent-accent bg-muted h-1.5 w-full cursor-pointer appearance-none rounded-full"
					onclick={(e) => e.stopPropagation()}
				/>
			</div>
		</BitsDropdown.Content>
	</BitsDropdown.Root>
</div>

<style>
	.ol-basemap-switcher {
		right: 0.75rem;
		bottom: 4.5rem;
	}
</style>
