<script lang="ts">
	import { Search, MapPin, Loader2, X } from 'lucide-svelte';
	import { nominatimSearchUrl, nominatimSearchResults } from '$lib/services/nominatim.service';
	import type { NominatimHit } from '$lib/types/spatial.types';
	import type { Map } from '@geovara/core';
	import Control from 'ol/control/Control';
	import { fromLonLat } from 'ol/proj.js';
	import { onMount } from 'svelte';
	import { cn } from '$lib/utils/cn';

	let { map } = $props<{ map: Map | undefined }>();

	let query = $state('');
	let results = $state<NominatimHit[]>([]);
	let isLoading = $state(false);
	let isOpen = $state(false);
	let isFocused = $state(false);
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;
	let containerElement = $state<HTMLDivElement>();

	onMount(() => {
		if (map && containerElement) {
			const searchControl = new Control({
				element: containerElement
			});
			map.addControl(searchControl);

			const handleClickOutside = (e: MouseEvent) => {
				if (containerElement && !containerElement.contains(e.target as Node)) {
					isOpen = false;
				}
			};
			document.addEventListener('mousedown', handleClickOutside);

			return () => {
				map.removeControl(searchControl);
				document.removeEventListener('mousedown', handleClickOutside);
			};
		}
	});

	async function searchLocation(q: string) {
		if (q.length < 3) {
			results = [];
			isOpen = false;
			return;
		}

		isLoading = true;
		try {
			const url = nominatimSearchUrl({
				format: 'json',
				q,
				limit: 5,
				addressdetails: 0
			});
			const data = await nominatimSearchResults(url);
			results = data;
			isOpen = data.length > 0;
		} catch (err) {
			console.error('Geocoding error:', err);
			results = [];
		} finally {
			isLoading = false;
		}
	}

	function handleInput(e: Event) {
		const val = (e.target as HTMLInputElement).value;
		query = val;
		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => searchLocation(val), 400);
	}

	function handleSelect(result: NominatimHit) {
		if (!map || !result.lon || !result.lat) return;

		const lon = parseFloat(result.lon);
		const lat = parseFloat(result.lat);
		const center = fromLonLat([lon, lat]);

		if (result.boundingbox) {
			const [south, north, west, east] = result.boundingbox.map(Number);
			const extent = [...fromLonLat([west, south]), ...fromLonLat([east, north])];
			map.getView().fit(extent as [number, number, number, number], {
				padding: [50, 50, 50, 50],
				duration: 1200,
				maxZoom: 18
			});
		} else {
			map.getView().animate({
				center,
				zoom: 14,
				duration: 1200
			});
		}

		query = result.display_name?.split(',')[0] || '';
		isOpen = false;
	}

	function handleClear() {
		query = '';
		results = [];
		isOpen = false;
	}
</script>

<div bind:this={containerElement} class="ol-location-search relative">
	<div
		class={cn(
			'bg-background/80 border-border/50 flex items-center gap-2 rounded-lg border px-3 py-2 backdrop-blur-md transition-all duration-200',
			isFocused ? 'ring-accent/40 shadow-lg ring-2' : 'shadow-sm'
		)}
	>
		<Search class="text-muted-foreground h-4 w-4 shrink-0" />
		<input
			type="text"
			placeholder="Search location..."
			value={query}
			oninput={handleInput}
			onfocus={() => (isFocused = true)}
			onblur={() => (isFocused = false)}
			onkeydown={(e) => {
				if (e.key === 'Escape') {
					handleClear();
					(e.target as HTMLInputElement).blur();
				}
			}}
			class="text-foreground placeholder:text-muted-foreground flex-1 bg-transparent text-sm outline-none"
		/>
		{#if isLoading}
			<Loader2 class="text-muted-foreground h-3.5 w-3.5 animate-spin" />
		{:else if query}
			<button
				onclick={handleClear}
				class="text-muted-foreground hover:text-foreground transition-colors"
			>
				<X class="h-3.5 w-3.5" />
			</button>
		{/if}
	</div>

	{#if isOpen && results.length > 0}
		<div
			class="border-border/50 bg-background/90 animate-in fade-in slide-in-from-top-2 mt-1.5 overflow-hidden rounded-lg border shadow-xl backdrop-blur-xl"
		>
			{#each results as result (result.place_id)}
				<button
					onclick={() => handleSelect(result)}
					class="border-border/30 hover:bg-accent/10 flex w-full items-start gap-2.5 border-b px-3 py-2.5 text-left transition-colors last:border-0"
				>
					<MapPin class="text-accent mt-0.5 h-3.5 w-3.5 shrink-0" />
					<span class="text-foreground line-clamp-2 text-xs leading-tight">
						{result.display_name}
					</span>
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.ol-location-search {
		width: 18rem;
	}
</style>
