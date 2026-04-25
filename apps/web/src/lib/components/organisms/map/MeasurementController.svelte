<script lang="ts">
	import type { Map } from 'ol';
	import { createMeasurement } from '@geovara/core';

	let { map, activeType } = $props<{
		map: Map | undefined;
		activeType: 'MeasureDistance' | 'MeasureArea' | null;
	}>();

	let measurementApi = $state<ReturnType<typeof createMeasurement>>();

	$effect(() => {
		if (!map || !activeType) {
			measurementApi?.dispose();
			measurementApi = undefined;
			return;
		}

		const type = activeType === 'MeasureArea' ? 'Polygon' : 'LineString';
		measurementApi = createMeasurement(map, { type });

		return () => {
			measurementApi?.dispose();
		};
	});
</script>

<style>
	:global(.ol-tooltip) {
		position: relative;
		background: rgba(0, 0, 0, 0.7);
		border-radius: 4px;
		color: white;
		padding: 4px 8px;
		opacity: 0.7;
		white-space: nowrap;
		font-size: 12px;
		cursor: default;
		user-select: none;
		pointer-events: none;
	}
	:global(.ol-tooltip-measure) {
		opacity: 1;
		font-weight: bold;
	}
	:global(.ol-tooltip-static) {
		background-color: #ffcc33;
		color: black;
		border: 1px solid white;
	}
	:global(.ol-tooltip-measure:before),
	:global(.ol-tooltip-static:before) {
		border-top: 6px solid rgba(0, 0, 0, 0.7);
		border-right: 6px solid transparent;
		border-left: 6px solid transparent;
		content: '';
		position: absolute;
		bottom: -6px;
		left: 50%;
		margin-left: -6px;
	}
	:global(.ol-tooltip-static:before) {
		border-top-color: #ffcc33;
	}
</style>
