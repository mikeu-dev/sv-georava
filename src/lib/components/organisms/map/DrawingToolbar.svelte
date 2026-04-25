<script lang="ts">
	import IconButton from '../../molecules/IconButton.svelte';
	import { onMount } from 'svelte';
	import type Map from 'ol/Map.js';
	import Control from 'ol/control/Control';
	import {
		MousePointer2,
		MapPin,
		Spline,
		Square,
		Circle,
		Pencil,
		Trash2,
		Type,
		Pentagon,
		Ruler,
		Maximize
	} from 'lucide-svelte';
	import { mapStore } from '$lib/stores/map.store.svelte';
	import type { DrawType } from '$lib/types/map.types';
	import type { Component, ComponentProps } from 'svelte';
	import type { Icon } from 'lucide-svelte';

	type LucideIcon = Component<ComponentProps<Icon>>;

	let { map } = $props<{ map: Map | undefined }>();

	let element = $state<HTMLElement>();

	onMount(() => {
		if (map && element) {
			const drawControl = new Control({
				element: element
			});
			map.addControl(drawControl);
			return () => map.removeControl(drawControl);
		}
	});

	interface ToolItem {
		type: DrawType | null;
		icon: LucideIcon;
		label: string;
		shortcut?: string;
	}

	const tools: ToolItem[] = [
		{ type: null, icon: MousePointer2 as unknown as LucideIcon, label: 'Select' },
		{ type: 'Point', icon: MapPin as unknown as LucideIcon, label: 'Point' },
		{ type: 'LineString', icon: Spline as unknown as LucideIcon, label: 'Line' },
		{ type: 'Polygon', icon: Pentagon as unknown as LucideIcon, label: 'Polygon' },
		{ type: 'Rectangle', icon: Square as unknown as LucideIcon, label: 'Rectangle' },
		{ type: 'Circle', icon: Circle as unknown as LucideIcon, label: 'Circle' },
		{ type: 'Freehand', icon: Pencil as unknown as LucideIcon, label: 'Freehand' },
		{ type: 'Text', icon: Type as unknown as LucideIcon, label: 'Text' },
		{ type: 'MeasureDistance', icon: Ruler as unknown as LucideIcon, label: 'Measure Distance' },
		{ type: 'MeasureArea', icon: Maximize as unknown as LucideIcon, label: 'Measure Area' },
		{ type: 'Delete', icon: Trash2 as unknown as LucideIcon, label: 'Delete' }
	];

	function handleToolSelect(type: DrawType | null) {
		mapStore.setDrawType(type);
	}
</script>

<div bind:this={element} class="ol-drawing-tools ol-unselectable ol-control">
	<div class="ol-panel flex flex-row gap-0.5 items-center">
		{#each tools as tool (tool.type || 'select')}
			<IconButton
				icon={tool.icon}
				label={tool.label}
				onclick={() => handleToolSelect(tool.type)}
				active={mapStore.drawType === tool.type}
				variant={mapStore.drawType === tool.type ? 'accent' : 'ghost'}
				class="h-8 w-8"
				side="bottom"
			/>
			{#if tool.type === 'Text' || tool.type === 'MeasureArea'}
				<div class="bg-border/40 mx-0.5 w-px h-6"></div>
			{/if}
		{/each}
	</div>
</div>


