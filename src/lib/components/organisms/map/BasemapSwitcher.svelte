<script lang="ts">
	import { Layers, Check } from 'lucide-svelte';
	import { DropdownMenu as BitsDropdown } from 'bits-ui';
	import { mapStore } from '$lib/stores/map.store.svelte';
	import { BASEMAPS } from '$lib/config/basemaps';
	import Button from '$lib/components/atoms/Button.svelte';

	let activeBasemap = $derived(mapStore.activeBasemap);
	let opacity = $state(mapStore.basemapOpacity);

	function handleBasemapChange(id: string) {
		mapStore.activeBasemap = id as import('$lib/types/map.types').BasemapId;
	}

	function handleOpacityChange(e: Event) {
		const val = parseFloat((e.target as HTMLInputElement).value);
		opacity = val;
		mapStore.basemapOpacity = val;
	}
</script>

<div class="z-10 flex flex-col gap-2 pointer-events-auto">
	<BitsDropdown.Root>
		<BitsDropdown.Trigger class="outline-none">
			<Button
				variant="secondary"
				size="icon"
				class="h-10 w-10 rounded-full border border-border/50 bg-background/80 shadow-lg backdrop-blur-md transition-all duration-300 hover:bg-background"
			>
				<Layers class="h-5 w-5 text-primary" />
			</Button>
		</BitsDropdown.Trigger>

		<BitsDropdown.Content
			side="left"
			align="start"
			class="z-50 w-56 rounded-xl border bg-popover p-2 shadow-xl backdrop-blur-xl animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
			sideOffset={8}
		>
			<div class="px-2 py-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
				Basemap
			</div>
			
			{#each BASEMAPS as basemap (basemap.id)}
				<BitsDropdown.Item
					class="flex w-full cursor-pointer items-center rounded-lg px-2 py-2 text-sm outline-none transition-colors hover:bg-accent focus:bg-accent"
					onclick={() => handleBasemapChange(basemap.id)}
				>
					<div class="mr-2 flex h-4 w-4 shrink-0 items-center justify-center">
						{#if activeBasemap === basemap.id}
							<Check class="h-3.5 w-3.5 text-accent-foreground" />
						{/if}
					</div>
					<span class="flex-1 text-foreground">{basemap.name}</span>
				</BitsDropdown.Item>
			{/each}

			<div class="my-1 h-px bg-border"></div>

			<div class="px-2 py-2">
				<div class="mb-1.5 flex items-center justify-between">
					<span class="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
						Opacity
					</span>
					<span class="font-mono text-[10px] text-muted-foreground">
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
					class="accent-accent h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted"
					onclick={(e) => e.stopPropagation()}
				/>
			</div>
		</BitsDropdown.Content>
	</BitsDropdown.Root>
</div>
