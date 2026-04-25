<script lang="ts">
	import { Popover as BitsPopover } from 'bits-ui';
	import { Trash2, Plus, GripVertical } from 'lucide-svelte';
	import type { Feature as OlFeature } from 'ol';
	import type { Geometry as OlGeometry } from 'ol/geom';
	import { GisService } from '$lib/services/spatial.service';
	import Button from '$lib/components/atoms/Button.svelte';
	import Input from '$lib/components/atoms/Input.svelte';
	import { mapStore } from '$lib/stores/map.store.svelte';
	import GeoJSON from 'ol/format/GeoJSON.js';
	import type { Feature as GeoJSONFeature, Geometry as GeoJSONGeometry } from 'geojson';

	const geojsonFormat = new GeoJSON();

	interface Props {
		feature: OlFeature<OlGeometry>;
		onOpenChange: (open: boolean) => void;
	}

	let { feature, onOpenChange }: Props = $props();

	let properties = $state<[string, unknown][]>([]);
	let position = $state({ x: 0, y: 0 });
	let isDragging = $state(false);
	let dragStart = { x: 0, y: 0 };

	$effect(() => {
		const props = { ...feature.getProperties() };
		delete props.geometry;
		properties = Object.entries(props).filter(
			([, value]) =>
				typeof value === 'string' ||
				typeof value === 'number' ||
				typeof value === 'boolean' ||
				value === null ||
				(typeof value === 'object' && value !== null && !Array.isArray(value))
		);
		position = { x: 0, y: 0 };
	});

	function handleDragStart(e: MouseEvent) {
		isDragging = true;
		dragStart = {
			x: e.clientX - position.x,
			y: e.clientY - position.y
		};
		document.body.style.cursor = 'move';
		document.body.style.userSelect = 'none';

		const handleMouseMove = (me: MouseEvent) => {
			if (!isDragging) return;
			position = {
				x: me.clientX - dragStart.x,
				y: me.clientY - dragStart.y
			};
		};

		const handleMouseUp = () => {
			isDragging = false;
			document.body.style.cursor = '';
			document.body.style.userSelect = '';
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mouseup', handleMouseUp);
		};

		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseup', handleMouseUp);
	}

	function handlePropertyKeyChange(oldKey: string, newKey: string) {
		if (!newKey.trim()) return;
		const val = feature.get(oldKey);
		mapStore.updateFeatureProperty(feature.getId() as string | number, oldKey, undefined);
		mapStore.updateFeatureProperty(feature.getId() as string | number, newKey, val);
		properties = properties.map(([k, v]) => (k === oldKey ? [newKey, v] : [k, v]));
	}

	function handlePropertyValueChange(key: string, value: unknown) {
		mapStore.updateFeatureProperty(feature.getId() as string | number, key, value);
		properties = properties.map(([k, v]) => (k === key ? [k, value] : [k, v]));
	}

	function handleAddProperty() {
		let newKey = 'new_property';
		let i = 1;
		const keys = properties.map(([k]) => k);
		while (keys.includes(newKey)) {
			newKey = `new_property_${i++}`;
		}
		handlePropertyValueChange(newKey, '');
	}

	function handleRemoveProperty(key: string) {
		mapStore.updateFeatureProperty(feature.getId() as string | number, key, undefined);
		properties = properties.filter(([k]) => k !== key);
	}

	const calculatedAnalysis = $derived.by(() => {
		try {
			const geometry = feature.getGeometry();
			if (!geometry) return null;

			const type = geometry.getType();
			const geojson = geojsonFormat.writeFeatureObject(feature) as unknown as GeoJSONFeature<GeoJSONGeometry>;

			if (type === 'Polygon' || type === 'MultiPolygon') {
				const area = GisService.calculateArea(geojson);
				return {
					label: 'Area',
					value: area > 1000000 ? `${(area / 1000000).toFixed(4)} km²` : `${area.toFixed(2)} m²`
				};
			} else if (type === 'LineString' || type === 'MultiLineString') {
				const length = GisService.calculateLength(geojson);
				return {
					label: 'Length',
					value: length > 1000 ? `${(length / 1000).toFixed(4)} km` : `${length.toFixed(2)} m`
				};
			}
			return null;
		} catch {
			return null;
		}
	});

	function isColorProperty(key: string) {
		return ['fill', 'stroke'].includes(key.toLowerCase());
	}
</script>

<BitsPopover.Root open={true} onOpenChange={onOpenChange}>
	<BitsPopover.Content
		class="z-50 w-80 rounded-xl border bg-background/95 p-4 shadow-2xl backdrop-blur-md animate-in fade-in-0 zoom-in-95 pointer-events-auto"
		style="transform: translate({position.x}px, {position.y}px)"
		onInteractOutside={(e) => {
			if (isDragging) e.preventDefault();
		}}
	>
		<div class="flex flex-col gap-4">
			<div
				role="button"
				tabindex="0"
				class="flex cursor-move items-center justify-center py-1 text-muted-foreground transition-colors hover:text-foreground outline-none"
				onmousedown={handleDragStart}
				onkeydown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						// Keyboard drag support
					}
				}}
			>
				<GripVertical class="h-5 w-5" />
			</div>

			<div class="space-y-1 text-center">
				<h4 class="text-sm font-semibold leading-none">Feature Properties</h4>
				<p class="text-xs text-muted-foreground">Manage attributes for this feature</p>
			</div>

			<div class="grid max-h-64 gap-2 overflow-y-auto pr-1 scrollbar-thin">
				{#each properties as [key, value] (key)}
					<div class="group flex items-center gap-2">
						<div class="flex flex-1 flex-col gap-1">
							<Input
								value={key}
								class="h-7 font-mono text-[10px]"
								onblur={(e) => {
									const newVal = (e.target as HTMLInputElement).value;
									if (newVal !== key) handlePropertyKeyChange(key, newVal);
								}}
							/>
							{#if isColorProperty(key)}
								<div class="relative flex h-7 items-center overflow-hidden rounded-md border border-input">
									<input
										type="color"
										value={String(value || '#000000')}
										oninput={(e) => handlePropertyValueChange(key, (e.target as HTMLInputElement).value)}
										class="absolute inset-0 h-full w-full cursor-pointer border-none p-0 opacity-0"
									/>
									<div class="flex w-full items-center px-2 text-[10px] font-mono">
										<div class="mr-2 h-3 w-3 rounded-full border border-border" style="background-color: {String(value || '#000000')}"></div>
										{String(value || '#000000')}
									</div>
								</div>
							{:else}
								<Input
									value={typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value ?? '')}
									class="h-7 text-xs"
									onblur={(e) => handlePropertyValueChange(key, (e.target as HTMLInputElement).value)}
								/>
							{/if}
						</div>
						<Button
							variant="ghost"
							size="icon"
							class="h-7 w-7 shrink-0 transition-opacity"
							onclick={() => handleRemoveProperty(key)}
						>
							<Trash2 class="h-3.5 w-3.5 text-destructive" />
						</Button>
					</div>
				{/each}
			</div>

			<Button variant="outline" size="sm" class="h-8 text-xs" onclick={handleAddProperty}>
				<Plus class="mr-2 h-3.5 w-3.5" /> Add Property
			</Button>

			{#if calculatedAnalysis}
				<div class="rounded-lg bg-muted/50 p-2 text-[10px] border border-border/50">
					<span class="font-semibold text-muted-foreground">{calculatedAnalysis.label}:</span>
					<span class="ml-1 font-mono">{calculatedAnalysis.value}</span>
				</div>
			{/if}

			<div class="flex justify-between gap-2 border-t pt-3">
				<Button
					variant="destructive"
					size="sm"
					class="h-8 text-xs"
					onclick={() => mapStore.removeFeature(feature.getId() as string | number)}
				>
					<Trash2 class="mr-2 h-3.5 w-3.5" /> Delete
				</Button>
				<Button size="sm" class="h-8 text-xs" onclick={() => onOpenChange(false)}>Done</Button>
			</div>
		</div>
	</BitsPopover.Content>
</BitsPopover.Root>
