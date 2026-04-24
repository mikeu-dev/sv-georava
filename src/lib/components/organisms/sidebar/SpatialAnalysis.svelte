<script lang="ts">
	import { mapStore } from '$lib/stores/map.store.svelte';
	import { uiStore } from '$lib/stores/ui.store.svelte';
	import Button from '../../atoms/Button.svelte';
	import { Wand2, Info } from 'lucide-svelte';
	import * as turf from '@turf/turf';
	import GeoJSON from 'ol/format/GeoJSON.js';
	import type { Feature } from 'ol';
	import type { Geometry } from 'ol/geom';

	let bufferDistance = $state(100);
	let bufferUnit = $state<'meters' | 'kilometers' | 'miles'>('meters');

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
			
			// Apply Turf Buffer
			const buffered = turf.buffer(geojson as any, bufferDistance, { units: bufferUnit });
			
			// Convert back to OL feature
			const newFeatures = geojsonFormat.readFeatures(buffered);
			
			if (newFeatures.length > 0) {
				const feature = newFeatures[0] as Feature<Geometry>;
				feature.setId(`buffer_${Date.now()}`);
				feature.set('name', `Buffer ${bufferDistance}${bufferUnit === 'meters' ? 'm' : 'km'}`);
				
				mapStore.addFeatures([feature]);
				uiStore.setValidation('success', 'Buffer created successfully');
			}
		} catch (e: unknown) {
			uiStore.setValidation('error', e instanceof Error ? e.message : 'Analysis failed');
		}
	}
</script>

<div class="flex h-full flex-col bg-background">
	<div class="border-b px-4 py-2">
		<h3 class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
			<Wand2 class="h-3.5 w-3.5" />
			Spatial Analysis
		</h3>
	</div>

	<div class="p-4 space-y-6">
		<!-- Selected Feature Info -->
		<div class="rounded-lg border bg-muted/20 p-3">
			<div class="mb-2 flex items-center gap-2 text-xs font-medium">
				<Info class="h-3.5 w-3.5 text-primary" />
				Selected Feature
			</div>
			{#if mapStore.selectedFeature}
				<p class="text-[10px] text-muted-foreground">
					ID: {mapStore.selectedFeature.getId()}<br/>
					Type: {mapStore.selectedFeature.getGeometry()?.getType()}
				</p>
			{:else}
				<p class="text-[10px] text-destructive italic">No feature selected</p>
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
					class="w-full rounded-md border bg-background px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary"
				/>
				<select 
					bind:value={bufferUnit}
					class="rounded-md border bg-background px-2 py-1.5 text-xs outline-none"
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

		<div class="rounded-md bg-accent/10 p-3 text-[10px] text-muted-foreground">
			<p>💡 Select a feature on the map, set the distance, and click Generate to create a surrounding buffer zone.</p>
		</div>
	</div>
</div>
