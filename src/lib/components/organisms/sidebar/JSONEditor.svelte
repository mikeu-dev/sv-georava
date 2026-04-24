<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { EditorView, basicSetup } from 'codemirror';
	import { json } from '@codemirror/lang-json';
	import { oneDark } from '@codemirror/theme-one-dark';
	import { mapStore } from '$lib/stores/map.store.svelte';
	import { uiStore } from '$lib/stores/ui.store.svelte';
	import GeoJSON from 'ol/format/GeoJSON.js';

	let editorElement = $state<HTMLElement>();
	let view = $state<EditorView>();
	let isInternalUpdate = false;

	const geojsonFormat = new GeoJSON();

	onMount(() => {
		if (!editorElement) return;

		const startState = mapStore.featuresToGeoJSON();

		view = new EditorView({
			doc: JSON.stringify(startState, null, 2),
			extensions: [
				basicSetup,
				json(),
				uiStore.theme === 'dark' ? oneDark : [],
				EditorView.updateListener.of((update) => {
					if (update.docChanged && !isInternalUpdate) {
						handleDocChange(update.state.doc.toString());
					}
				}),
				EditorView.theme({
					'&': { height: '100%' },
					'.cm-scroller': { overflow: 'auto' }
				})
			],
			parent: editorElement
		});
	});

	function handleDocChange(content: string) {
		try {
			const parsed = JSON.parse(content);
			const features = geojsonFormat.readFeatures(parsed);
			
			// Update store with features from editor
			mapStore.skipFeaturesSync = true;
			mapStore.setFeatures(features as any);
			uiStore.setValidation('success', 'GeoJSON valid');
		} catch (e: unknown) {
			uiStore.setValidation('error', e instanceof Error ? e.message : 'Invalid JSON');
		}
	}

	// Sync editor when map features change
	$effect(() => {
		const geojson = mapStore.featuresToGeoJSON();
		const currentDoc = view?.state.doc.toString();
		const newDoc = JSON.stringify(geojson, null, 2);

		if (view && newDoc !== currentDoc) {
			isInternalUpdate = true;
			view.dispatch({
				changes: { from: 0, to: view.state.doc.length, insert: newDoc }
			});
			isInternalUpdate = false;
		}
	});

	onDestroy(() => {
		view?.destroy();
	});
</script>

<div class="flex h-full flex-col overflow-hidden bg-background">
	<div bind:this={editorElement} class="flex-1 overflow-hidden text-sm"></div>
	
	{#if uiStore.validationFeedback}
		<div 
			class="border-t px-4 py-2 text-xs font-mono transition-colors"
			class:bg-destructive/10={uiStore.validationStatus === 'error'}
			class:text-destructive={uiStore.validationStatus === 'error'}
			class:bg-success/10={uiStore.validationStatus === 'success'}
			class:text-success={uiStore.validationStatus === 'success'}
		>
			{uiStore.validationFeedback}
		</div>
	{/if}
</div>

<style>
	:global(.cm-editor) {
		height: 100% !important;
	}
</style>
