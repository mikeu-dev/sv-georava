<script lang="ts">
	import { Check, Globe, Map as MapIcon } from 'lucide-svelte';
	import { DropdownMenu as BitsDropdown } from 'bits-ui';
	import { mapStore } from '$lib/stores/map.store.svelte';
	import Button from '$lib/components/atoms/Button.svelte';
	import Tooltip from '$lib/components/atoms/Tooltip.svelte';
	import type { ProjectionCode } from '$lib/types/map.types';

	let is3d = $derived(mapStore.is3d);
	let projection = $derived(mapStore.projection);

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

<div class="z-10 flex flex-col gap-2 pointer-events-auto">
	<Tooltip content="Map View & Projection" side="left">
		<BitsDropdown.Root>
			<BitsDropdown.Trigger class="outline-none">
				<Button
					variant="secondary"
					size="icon"
					class="flex h-10 w-10 flex-col items-center justify-center gap-0.5 rounded-full border border-border/50 bg-background/80 shadow-lg backdrop-blur-md transition-all duration-300 hover:bg-background"
				>
					{#if is3d}
						<Globe class="h-4 w-4 text-primary" />
					{:else}
						<MapIcon class="h-4 w-4 text-primary" />
					{/if}
					<span class="text-[8px] font-bold leading-none opacity-70">{activeLabel}</span>
				</Button>
			</BitsDropdown.Trigger>

			<BitsDropdown.Content
				side="left"
				align="start"
				class="z-50 w-56 rounded-xl border bg-popover p-2 shadow-xl backdrop-blur-xl animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
				sideOffset={8}
			>
				<div class="px-2 py-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
					2D Flat Mode
				</div>

				<BitsDropdown.Item
					class="flex w-full cursor-pointer items-center justify-between rounded-lg px-2 py-2 text-sm outline-none transition-colors hover:bg-accent focus:bg-accent"
					onclick={() => handleSelectMode('3857')}
				>
					<div class="flex items-center gap-2">
						<MapIcon class="h-3.5 w-3.5 text-muted-foreground" />
						<span>Web Mercator (3857)</span>
					</div>
					{#if !is3d && projection === 'EPSG:3857'}
						<Check class="h-3.5 w-3.5 text-accent-foreground" />
					{/if}
				</BitsDropdown.Item>

				<BitsDropdown.Item
					class="flex w-full cursor-pointer items-center justify-between rounded-lg px-2 py-2 text-sm outline-none transition-colors hover:bg-accent focus:bg-accent"
					onclick={() => handleSelectMode('4326')}
				>
					<div class="flex items-center gap-2">
						<MapIcon class="h-3.5 w-3.5 text-muted-foreground" />
						<span>WGS 84 (4326)</span>
					</div>
					{#if !is3d && projection === 'EPSG:4326'}
						<Check class="h-3.5 w-3.5 text-accent-foreground" />
					{/if}
				</BitsDropdown.Item>

				<div class="my-1 h-px bg-border"></div>
				<div class="px-2 py-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
					3D Globe Mode
				</div>

				<BitsDropdown.Item
					class="flex w-full cursor-pointer items-center justify-between rounded-lg px-2 py-2 text-sm outline-none transition-colors hover:bg-accent focus:bg-accent"
					onclick={() => handleSelectMode('3d')}
				>
					<div class="flex items-center gap-2 text-cyan-600 font-medium">
						<Globe class="h-3.5 w-3.5" />
						<span>Cesium 3D Globe</span>
					</div>
					{#if is3d}
						<Check class="h-3.5 w-3.5 text-accent-foreground" />
					{/if}
				</BitsDropdown.Item>
			</BitsDropdown.Content>
		</BitsDropdown.Root>
	</Tooltip>
</div>
