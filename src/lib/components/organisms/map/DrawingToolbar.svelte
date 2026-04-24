<script lang="ts">
	import { mapStore } from '$lib/stores/map.store.svelte';
	import IconButton from '../../molecules/IconButton.svelte';
	import {
		MousePointer2,
		Type,
		Spline,
		Pentagon,
		Square,
		Circle as CircleIcon,
		Pencil,
		Trash2,
		Ruler,
		BoxSelect
	} from 'lucide-svelte';
	import type { DrawType } from '$lib/types/map.types';

	const tools: { type: DrawType; icon: any; label: string; shortcut?: string }[] = [
		{ type: 'Point', icon: MousePointer2, label: 'Point', shortcut: 'P' },
		{ type: 'LineString', icon: Spline, label: 'LineString', shortcut: 'L' },
		{ type: 'Polygon', icon: Pentagon, label: 'Polygon', shortcut: 'G' },
		{ type: 'Rectangle', icon: Square, label: 'Rectangle', shortcut: 'R' },
		{ type: 'Circle', icon: CircleIcon, label: 'Circle', shortcut: 'C' },
		{ type: 'Edit', icon: Pencil, label: 'Edit Mode', shortcut: 'E' },
		{ type: 'MeasureDistance', icon: Ruler, label: 'Measure Distance', shortcut: 'M' },
		{ type: 'MeasureArea', icon: BoxSelect, label: 'Measure Area', shortcut: 'A' }
	];

	function toggleTool(type: DrawType) {
		if (mapStore.drawType === type) {
			mapStore.setDrawType(null);
		} else {
			mapStore.setDrawType(type);
		}
	}
</script>

<div class="drawing-tools ol-unselectable ol-control">
	<div class="drawing-controls">
		{#each tools as tool}
			<IconButton
				icon={tool.icon}
				label={`${tool.label} (${tool.shortcut})`}
				active={mapStore.drawType === tool.type}
				onclick={() => toggleTool(tool.type)}
				side="left"
				iconClass="h-[18px] w-[18px]"
			/>
		{each}

		<div class="my-1 h-px bg-border/50 mx-1"></div>

		<IconButton
			icon={Trash2}
			label="Clear All"
			onclick={() => {
				if (confirm('Clear all features?')) mapStore.clearFeatures();
			}}
			variant="ghost"
			side="left"
			class="text-destructive hover:bg-destructive/10 hover:text-destructive"
			iconClass="h-[18px] w-[18px]"
		/>
	</div>
</div>
