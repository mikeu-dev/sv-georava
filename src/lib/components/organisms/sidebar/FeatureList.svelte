<script lang="ts">
	import { mapStore } from '$lib/stores/map.store.svelte';
	import IconButton from '../../molecules/IconButton.svelte';
	import { Trash2, Focus, Box, LineChart, MapPin } from 'lucide-svelte';
	import type { Feature } from 'ol';
	import type { Geometry } from 'ol/geom';
	import type { Component, ComponentProps } from 'svelte';
	import type { Icon } from 'lucide-svelte';

	type LucideIcon = Component<ComponentProps<Icon>>;

	function getFeatureIcon(feature: Feature<Geometry>): LucideIcon {
		const type = feature.getGeometry()?.getType();
		switch (type) {
			case 'Point': return MapPin as unknown as LucideIcon;
			case 'LineString': return LineChart as unknown as LucideIcon;
			case 'Polygon':
			case 'Circle': return Box as unknown as LucideIcon;
			default: return Box as unknown as LucideIcon;
		}
	}

	function deleteFeature(id: string | number | undefined) {
		if (id === undefined) return;
		mapStore.deleteFeature(id);
	}
</script>

<div class="flex h-full flex-col bg-background">
	<div class="flex items-center justify-between border-b px-4 py-2">
		<h3 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
			Features ({mapStore.features.length})
		</h3>
	</div>

	<div class="flex-1 overflow-y-auto">
		{#if mapStore.features.length === 0}
			<div class="flex h-40 flex-col items-center justify-center p-4 text-center">
				<Box class="mb-2 h-8 w-8 text-muted/20" />
				<p class="text-xs text-muted-foreground">No features drawn yet</p>
			</div>
		{:else}
			<ul class="divide-y border-b">
				{#each mapStore.features as feature (feature.getId())}
					<li 
						class="group flex items-center justify-between px-4 py-2 hover:bg-muted/50 transition-colors"
						class:bg-primary/5={mapStore.selectedFeature === feature}
					>
						<div class="flex items-center gap-3 overflow-hidden">
							{@const Icon = getFeatureIcon(feature)}
							<Icon class="h-4 w-4 shrink-0 text-muted-foreground" />
							<div class="flex flex-col overflow-hidden">
								<span class="truncate text-xs font-medium">
									{feature.get('name') || `Feature ${feature.getId()?.toString().slice(-4)}`}
								</span>
								<span class="text-[10px] text-muted-foreground">
									{feature.getGeometry()?.getType()}
								</span>
							</div>
						</div>

						<div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
							<IconButton 
								icon={Focus as unknown as LucideIcon} 
								label="Zoom to" 
								size="xs" 
								variant="ghost" 
							/>
							<IconButton 
								icon={Trash2 as unknown as LucideIcon} 
								label="Delete" 
								size="xs" 
								variant="ghost" 
								class="text-destructive hover:bg-destructive/10"
								onclick={() => deleteFeature(feature.getId())}
							/>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>
