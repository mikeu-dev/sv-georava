<script lang="ts">
	import Sidebar from '../organisms/sidebar/Sidebar.svelte';
	import JsonEditorPanel from '../organisms/sidebar/JsonEditorPanel.svelte';
	import MapCanvas from '../organisms/map/MapCanvas.svelte';
	import { uiStore } from '$lib/stores/ui.store.svelte';
	import { mapStore } from '$lib/stores/map.store.svelte';
	import { onMount } from 'svelte';
	import { getFromHash, decodeGeoJSON, encodeGeoJSON, updateUrlHash } from '$lib/services/url-state.service';
	import type { BasemapId } from '$lib/types/map.types';

	let { user } = $props<{ user: { name: string; email: string; image?: string | null } | null }>();

	onMount(() => {
		uiStore.initTheme();

		// Load initial state from URL
		const encodedData = getFromHash('data');
		if (encodedData) {
			const decoded = decodeGeoJSON(encodedData);
			if (decoded) {
				mapStore.syncFeaturesFromString(decoded);
			}
		}

		const basemap = getFromHash('basemap');
		if (basemap) {
			mapStore.activeBasemap = basemap as BasemapId;
		}

		const is3d = getFromHash('3d');
		if (is3d === 'true') {
			mapStore.is3d = true;
		}

		const handleHashChange = () => {
			const encoded = getFromHash('data');
			if (encoded) {
				const decoded = decodeGeoJSON(encoded);
				if (decoded) {
					if (decoded !== mapStore.geojsonString) {
						mapStore.syncFeaturesFromString(decoded);
					}
				}
			}

			const basemap = getFromHash('basemap');
			if (basemap && basemap !== mapStore.activeBasemap) {
				mapStore.activeBasemap = basemap as BasemapId;
			}

			const is3d = getFromHash('3d');
			const shouldBe3d = is3d === 'true';
			if (shouldBe3d !== mapStore.is3d) {
				mapStore.is3d = shouldBe3d;
			}
		};

		window.addEventListener('hashchange', handleHashChange);
		return () => window.removeEventListener('hashchange', handleHashChange);
	});

	// Reactive Sync Store -> URL
	$effect(() => {
		const json = mapStore.geojsonString;
		const encoded = json ? encodeGeoJSON(json) : null;

		updateUrlHash({
			data: encoded,
			basemap: mapStore.activeBasemap,
			'3d': mapStore.is3d ? 'true' : null
		});
	});
</script>

<div class="bg-background selection:bg-primary/20 flex h-screen w-full overflow-hidden">
	<!-- Sidebar Area -->
	<Sidebar>
		{#if uiStore.activeTab === 'json'}
			<JsonEditorPanel />
		{:else if uiStore.activeTab === 'features'}
			<div class="text-muted-foreground animate-fade-in p-8 text-center">
				<p class="text-xs font-bold tracking-widest uppercase">Features List</p>
				<p class="mt-2 text-[10px]">Work in progress...</p>
			</div>
		{:else if uiStore.activeTab === 'layers'}
			<div class="text-muted-foreground animate-fade-in p-8 text-center">
				<p class="text-xs font-bold tracking-widest uppercase">Layers Manager</p>
				<p class="mt-2 text-[10px]">Work in progress...</p>
			</div>
		{:else if uiStore.activeTab === 'help'}
			<div class="text-muted-foreground animate-fade-in p-8 text-center">
				<p class="text-xs font-bold tracking-widest uppercase">Documentation</p>
				<p class="mt-2 text-[10px]">Work in progress...</p>
			</div>
		{/if}
	</Sidebar>

	<!-- Map Area -->
	<main class="relative h-full flex-1 overflow-hidden">
		<MapCanvas {user} />

		<!-- Notifications / Overlays -->
		{#if uiStore.isCopied}
			<div
				class="bg-primary text-primary-foreground animate-in slide-in-from-bottom-4 fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-full px-4 py-2 text-xs font-bold shadow-2xl duration-300"
			>
				GeoJSON Copied to Clipboard
			</div>
		{/if}
	</main>
</div>
