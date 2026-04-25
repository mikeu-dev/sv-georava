<script lang="ts">
	import { onMount } from 'svelte';
	import { Check, Globe, Map as MapIcon } from 'lucide-svelte';
	import { DropdownMenu as BitsDropdown } from 'bits-ui';
	import type Map from 'ol/Map.js';
	import Control from 'ol/control/Control';
	import { mapStore } from '$lib/stores/map.store.svelte';
	import Button from '$lib/components/atoms/Button.svelte';
	import Tooltip from '$lib/components/atoms/Tooltip.svelte';
	import type { ProjectionCode } from '$lib/types/map.types';

	let { map } = $props<{ map: Map | undefined }>();

	let element = $state<HTMLElement>();
	let is3d = $derived(mapStore.is3d);
	let projection = $derived(mapStore.projection);

	onMount(() => {
		if (map && element) {
			const sceneControl = new Control({
				element: element
			});
			map.addControl(sceneControl);
			return () => map.removeControl(sceneControl);
		}
	});

	function handleSelectMode(mode: '3d' | '3857' | '4326') {
		if (mode === '3d') {
			mapStore.is3d = true;
		} else {
			mapStore.is3d = false;
			const fullProj: ProjectionCode = mode === '3857' ? 'EPSG:3857' : 'EPSG:4326';
			mapStore.setProjection(fullProj);
		}
	}

	let activeLabel = $derived.by(() => {
		if (is3d) return '3D';
		return projection.split(':')[1];
	});
</script>

<div bind:this={element} class="ol-scene-view-switcher ol-unselectable ol-control">
	<Tooltip content="Map View & Projection" side="left">
		<BitsDropdown.Root>
			<BitsDropdown.Trigger class="outline-none">
				<Button
					tag="span"
					variant="secondary"
					size="icon"
					class="premium-control flex h-9 w-9 flex-col items-center justify-center gap-0.5 rounded-full transition-all duration-300"
				>
					{#if is3d}
						<Globe class="text-primary h-4 w-4" />
					{:else}
						<MapIcon class="text-primary h-4 w-4" />
					{/if}
					<span class="text-[8px] leading-none font-bold opacity-70">{activeLabel}</span>
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
					2D Flat Mode
				</div>

				<BitsDropdown.Item
					class="hover:bg-accent focus:bg-accent flex w-full cursor-pointer items-center justify-between rounded-lg px-2 py-2 text-sm transition-colors outline-none"
					onclick={() => handleSelectMode('3857')}
				>
					<div class="flex items-center gap-2">
						<MapIcon class="text-muted-foreground h-3.5 w-3.5" />
						<span>Web Mercator (3857)</span>
					</div>
					{#if !is3d && projection === 'EPSG:3857'}
						<Check class="text-accent-foreground h-3.5 w-3.5" />
					{/if}
				</BitsDropdown.Item>

				<BitsDropdown.Item
					class="hover:bg-accent focus:bg-accent flex w-full cursor-pointer items-center justify-between rounded-lg px-2 py-2 text-sm transition-colors outline-none"
					onclick={() => handleSelectMode('4326')}
				>
					<div class="flex items-center gap-2">
						<MapIcon class="text-muted-foreground h-3.5 w-3.5" />
						<span>WGS 84 (4326)</span>
					</div>
					{#if !is3d && projection === 'EPSG:4326'}
						<Check class="text-accent-foreground h-3.5 w-3.5" />
					{/if}
				</BitsDropdown.Item>

				<div class="bg-border my-1 h-px"></div>
				<div
					class="text-muted-foreground px-2 py-1.5 text-[10px] font-medium tracking-wider uppercase"
				>
					3D Globe Mode
				</div>

				<BitsDropdown.Item
					class="hover:bg-accent focus:bg-accent flex w-full cursor-pointer items-center justify-between rounded-lg px-2 py-2 text-sm transition-colors outline-none"
					onclick={() => handleSelectMode('3d')}
				>
					<div class="flex items-center gap-2 font-medium text-cyan-600">
						<Globe class="h-3.5 w-3.5" />
						<span>Cesium 3D Globe</span>
					</div>
					{#if is3d}
						<Check class="text-accent-foreground h-3.5 w-3.5" />
					{/if}
				</BitsDropdown.Item>
			</BitsDropdown.Content>
		</BitsDropdown.Root>
	</Tooltip>
</div>


