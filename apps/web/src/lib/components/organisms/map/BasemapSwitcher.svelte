<script lang="ts">
	import { onMount } from 'svelte';
	import { Layers, Check } from 'lucide-svelte';
	import { DropdownMenu as BitsDropdown } from 'bits-ui';
	import type { Map } from '@geovara/core';
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
		<BitsDropdown.Trigger>
			{#snippet child({ props })}
				<Button
					{...props}
					tag="span"
					variant="secondary"
					size="icon"
					class="premium-control h-9 w-9"
				>
					<Layers class="text-primary h-5 w-5" />
				</Button>
			{/snippet}
		</BitsDropdown.Trigger>

		<BitsDropdown.Content
			side="left"
			align="start"
			class="bg-popover/90 animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-56 rounded-sm border p-1 shadow-2xl backdrop-blur-2xl"
			sideOffset={12}
		>
			<div
				class="text-muted-foreground px-2 py-1 text-[9px] font-bold tracking-widest uppercase opacity-70"
			>
				Basemap Engine
			</div>

			<div class="mt-1 space-y-0.5">
				{#each BASEMAPS as basemap (basemap.id)}
					<BitsDropdown.Item
						class="hover:bg-accent focus:bg-accent flex w-full cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm transition-colors outline-none"
						onclick={() => handleBasemapChange(basemap.id)}
					>
						<div
							class={cn(
								'mr-3 h-8 w-12 shrink-0 rounded-sm border bg-muted/50 shadow-inner overflow-hidden relative',
								basemap.id === 'osm' && 'bg-blue-400/10',
								basemap.id === 'satellite' && 'bg-emerald-900/20',
								basemap.id === 'dark' && 'bg-slate-900/40',
								basemap.id === 'topo' && 'bg-orange-200/20'
							)}
						>
							{#if activeBasemap === basemap.id}
								<div class="bg-primary absolute inset-0 flex items-center justify-center">
									<Check class="h-4 w-4 text-primary-foreground" />
								</div>
							{/if}
						</div>
						<div class="flex flex-col">
							<span class="text-foreground text-[11px] font-bold leading-tight">{basemap.name}</span>
							<span class="text-muted-foreground text-[9px] font-mono opacity-80 uppercase">Tileset</span>
						</div>
					</BitsDropdown.Item>
				{/each}
			</div>

			<div class="bg-border/60 my-1 h-px"></div>

			<div class="px-2 py-2">
				<div class="mb-1.5 flex items-center justify-between">
					<span class="text-muted-foreground text-[9px] font-bold tracking-widest uppercase opacity-70">
						Opacity
					</span>
					<span class="text-primary font-mono text-[10px] font-bold">
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
					class="accent-primary bg-muted h-1 w-full cursor-pointer appearance-none rounded-none"
					onclick={(e) => e.stopPropagation()}
				/>
			</div>
		</BitsDropdown.Content>
	</BitsDropdown.Root>
</div>


