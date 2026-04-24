<script lang="ts">
	import IconButton from '../../molecules/IconButton.svelte';
	import {
		MousePointer2,
		Square,
		Circle,
		Pencil,
		Minus,
		Trash2,
		Type,
		Pentagon
	} from 'lucide-svelte';
	import { mapStore } from '$lib/stores/map.store.svelte';
	import type { DrawType } from '$lib/types/map.types';
	import type { Icon } from 'lucide-svelte';
	import type { Component, ComponentProps } from 'svelte';

	type LucideIcon = Component<ComponentProps<Icon>>;

	interface ToolItem {
		type: DrawType;
		icon: LucideIcon;
		label: string;
		shortcut?: string;
	}

	const tools: ToolItem[] = [
		{ type: 'Point', icon: MousePointer2 as unknown as LucideIcon, label: 'Select (V)', shortcut: 'V' },
		{ type: 'LineString', icon: Minus as unknown as LucideIcon, label: 'Line (L)', shortcut: 'L' },
		{ type: 'Polygon', icon: Pentagon as unknown as LucideIcon, label: 'Polygon (P)', shortcut: 'P' },
		{ type: 'Circle', icon: Circle as unknown as LucideIcon, label: 'Circle (C)', shortcut: 'C' },
		{ type: 'Rectangle', icon: Square as unknown as LucideIcon, label: 'Rectangle (R)', shortcut: 'R' },
		{ type: 'Freehand', icon: Pencil as unknown as LucideIcon, label: 'Freehand (F)', shortcut: 'F' },
		{ type: 'Text', icon: Type as unknown as LucideIcon, label: 'Text (T)', shortcut: 'T' },
		{ type: 'Delete', icon: Trash2 as unknown as LucideIcon, label: 'Delete (Del)', shortcut: 'Del' }
	];
</script>

<div class="drawing-tools ol-unselectable ol-control pointer-events-auto">
	<div class="drawing-controls">
		{#each tools as tool (tool.type)}
			<IconButton
				icon={tool.icon}
				label={tool.label}
				onclick={() => mapStore.setDrawType(tool.type)}
				active={mapStore.drawType === tool.type}
				variant={mapStore.drawType === tool.type ? 'accent' : 'ghost'}
				class="h-8 w-8"
				side="left"
			/>
		{/each}
	</div>
</div>
