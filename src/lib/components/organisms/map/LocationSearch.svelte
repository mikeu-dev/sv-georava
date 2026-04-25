<script lang="ts">
	import { Search, MapPin, Loader2, X } from 'lucide-svelte';
	import { nominatimSearchUrl, nominatimSearchResults } from '$lib/services/nominatim.service';
	import type { NominatimHit } from '$lib/types/spatial.types';
	import type Map from 'ol/Map.js';
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
		const handleClickOutside = (e: MouseEvent) => {
			if (containerElement && !containerElement.contains(e.target as Node)) {
				isOpen = false;
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
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

<div bind:this={containerElement} class="absolute left-12 top-3 z-40 w-72 pointer-events-auto">
	<div
		class={cn(
			'flex items-center gap-2 rounded-lg bg-background/80 px-3 py-2 backdrop-blur-md transition-all duration-200 border border-border/50',
			isFocused ? 'ring-2 ring-accent/40 shadow-lg' : 'shadow-sm'
		)}
	>
		<Search class="h-4 w-4 shrink-0 text-muted-foreground" />
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
			class="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
		/>
		{#if isLoading}
			<Loader2 class="h-3.5 w-3.5 animate-spin text-muted-foreground" />
		{:else if query}
			<button
				onclick={handleClear}
				class="text-muted-foreground transition-colors hover:text-foreground"
			>
				<X class="h-3.5 w-3.5" />
			</button>
		{/if}
	</div>

	{#if isOpen && results.length > 0}
		<div
			class="mt-1.5 overflow-hidden rounded-lg border border-border/50 bg-background/90 shadow-xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2"
		>
			{#each results as result (result.place_id)}
				<button
					onclick={() => handleSelect(result)}
					class="flex w-full items-start gap-2.5 border-b border-border/30 px-3 py-2.5 text-left transition-colors hover:bg-accent/10 last:border-0"
				>
					<MapPin class="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
					<span class="line-clamp-2 text-xs leading-tight text-foreground">
						{result.display_name}
					</span>
				</button>
			{/each}
		</div>
	{/if}
</div>
