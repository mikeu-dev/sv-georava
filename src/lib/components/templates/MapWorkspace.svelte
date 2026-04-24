<script lang="ts">
	import Sidebar from '../organisms/sidebar/Sidebar.svelte';
	import JsonEditorPanel from '../organisms/sidebar/JsonEditorPanel.svelte';
	import MapCanvas from '../organisms/map/MapCanvas.svelte';
	import DrawingToolbar from '../organisms/map/DrawingToolbar.svelte';
	import StatusBar from '../organisms/map/StatusBar.svelte';
	import { uiStore } from '$lib/stores/ui.store.svelte';
	import { mapStore } from '$lib/stores/map.store.svelte';
	import { onMount } from 'svelte';

	onMount(() => {
		uiStore.initTheme();
	});
</script>

<div class="flex h-screen w-full overflow-hidden bg-background selection:bg-primary/20">
	<!-- Sidebar Area -->
	<Sidebar>
		{#if uiStore.activeTab === 'json'}
			<JsonEditorPanel />
		{:else if uiStore.activeTab === 'features'}
			<div class="p-8 text-center text-muted-foreground animate-fade-in">
				<p class="text-xs font-bold uppercase tracking-widest">Features List</p>
				<p class="mt-2 text-[10px]">Work in progress...</p>
			</div>
		{:else if uiStore.activeTab === 'layers'}
			<div class="p-8 text-center text-muted-foreground animate-fade-in">
				<p class="text-xs font-bold uppercase tracking-widest">Layers Manager</p>
				<p class="mt-2 text-[10px]">Work in progress...</p>
			</div>
		{:else if uiStore.activeTab === 'help'}
			<div class="p-8 text-center text-muted-foreground animate-fade-in">
				<p class="text-xs font-bold uppercase tracking-widest">Documentation</p>
				<p class="mt-2 text-[10px]">Work in progress...</p>
			</div>
		{/if}
	</Sidebar>

	<!-- Map Area -->
	<main class="relative flex-1 h-full overflow-hidden">
		<MapCanvas>
			<DrawingToolbar />
			<StatusBar />
		</MapCanvas>

		<!-- Notifications / Overlays -->
		{#if uiStore.isCopied}
			<div class="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-full text-xs font-bold shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
				GeoJSON Copied to Clipboard
			</div>
		{/if}
	</main>
</div>
