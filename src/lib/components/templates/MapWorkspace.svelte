<script lang="ts">
	import Sidebar from '../organisms/sidebar/Sidebar.svelte';
	import JsonEditorPanel from '../organisms/sidebar/JsonEditorPanel.svelte';
	import MapCanvas from '../organisms/map/MapCanvas.svelte';
	import DrawingToolbar from '../organisms/map/DrawingToolbar.svelte';
	import { uiStore } from '$lib/stores/ui.store.svelte';
	import { onMount } from 'svelte';

	let { user } = $props<{ user: { name: string; email: string; image?: string | null } | null }>();

	onMount(() => {
		uiStore.initTheme();
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
		<MapCanvas {user}>
			<DrawingToolbar />
		</MapCanvas>

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
