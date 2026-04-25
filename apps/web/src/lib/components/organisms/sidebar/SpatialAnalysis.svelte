<script lang="ts">
	import { mapStore } from '$lib/stores/map.store.svelte';
	import { uiStore } from '$lib/stores/ui.store.svelte';
	import Button from '../../atoms/Button.svelte';
	import { Wand2, Info } from 'lucide-svelte';
	import { SpatialService, type BufferUnit } from '@geovara/core';
	import GeoJSON from 'ol/format/GeoJSON.js';
	import type { Feature } from 'ol';
	import type { Geometry } from 'ol/geom';

	let bufferDistance = $state(100);
	let bufferUnit = $state<BufferUnit>('meters');

	const geojsonFormat = new GeoJSON();

	function applyBuffer() {
		const selectedFeature = mapStore.selectedFeature;
		if (!selectedFeature) {
			uiStore.setValidation('error', 'Select a feature first');
			return;
		}

		try {
			// Convert OL feature to GeoJSON
			const geojson = geojsonFormat.writeFeatureObject(selectedFeature);

			// Apply Core SpatialService Buffer
			const buffered = SpatialService.createBuffer(geojson as any, bufferDistance, bufferUnit);

			// Convert back to OL feature
			const newFeatures = geojsonFormat.readFeatures(buffered);

			if (newFeatures.length > 0) {
				const feature = newFeatures[0] as Feature<Geometry>;
				feature.setId(`buffer_${Date.now()}`);
				feature.set('name', `Buffer ${bufferDistance}${bufferUnit === 'meters' ? 'm' : 'km'}`);

				mapStore.addFeature(feature);
				uiStore.setValidation('success', 'Buffer created successfully');
			}
		} catch (e: unknown) {
			uiStore.setValidation('error', e instanceof Error ? e.message : 'Analysis failed');
		}
	}
</script>

<div class="bg-background flex h-full flex-col">
	<div class="border-b px-4 py-2">
		<h3
			class="text-muted-foreground flex items-center gap-2 text-xs font-semibold tracking-wider uppercase"
		>
			<Wand2 class="h-3.5 w-3.5" />
			Spatial Analysis
		</h3>
	</div>

	<div class="space-y-6 p-4">
		<!-- Selected Feature Info -->
		<div class="bg-muted/20 rounded-lg border p-3">
			<div class="mb-2 flex items-center gap-2 text-xs font-medium">
				<Info class="text-primary h-3.5 w-3.5" />
				Selected Feature
			</div>
			{#if mapStore.selectedFeature}
				<p class="text-muted-foreground text-[10px]">
					ID: {mapStore.selectedFeature.getId()}<br />
					Type: {mapStore.selectedFeature.getGeometry()?.getType()}
				</p>
			{:else}
				<p class="text-destructive text-[10px] italic">No feature selected</p>
			{/if}
		</div>

		<!-- Buffer Tool -->
		<div class="space-y-3">
			<label for="distance" class="text-xs font-medium">Buffer Distance</label>
			<div class="flex gap-2">
				<input
					id="distance"
					type="number"
					bind:value={bufferDistance}
					class="bg-background focus:ring-primary w-full rounded-md border px-3 py-1.5 text-xs outline-none focus:ring-1"
				/>
				<select
					bind:value={bufferUnit}
					class="bg-background rounded-md border px-2 py-1.5 text-xs outline-none"
				>
					<option value="meters">Meters</option>
					<option value="kilometers">Kilometers</option>
				</select>
			</div>

			<Button
				variant="accent"
				class="w-full gap-2"
				onclick={applyBuffer}
				disabled={!mapStore.selectedFeature}
			>
				<Wand2 class="h-3.5 w-3.5" />
				Generate Buffer
			</Button>
		</div>

		<div class="bg-accent/10 text-muted-foreground rounded-md p-3 text-[10px]">
			<p>
				💡 Select a feature on the map, set the distance, and click Generate to create a surrounding
				buffer zone.
			</p>
		</div>
	</div>
</div>
