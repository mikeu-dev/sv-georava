<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { EditorView, basicSetup } from 'codemirror';
	import { json } from '@codemirror/lang-json';
	import { oneDark } from '@codemirror/theme-one-dark';
	import { mapStore } from '$lib/stores/map.store.svelte';
	import { uiStore } from '$lib/stores/ui.store.svelte';

	let editorElement = $state<HTMLElement>();
	let view = $state<EditorView>();

	onMount(() => {
		if (!editorElement) return;

		const updateListener = EditorView.updateListener.of((update) => {
			if (update.docChanged && !mapStore.skipFeaturesSync) {
				const value = update.state.doc.toString();
				mapStore.setGeojsonFromEditor(value);
			}
		});

		view = new EditorView({
			doc: mapStore.geojsonString,
			extensions: [
				basicSetup,
				json(),
				uiStore.theme === 'dark' ? oneDark : [],
				updateListener,
				EditorView.lineWrapping,
				EditorView.theme({
					'&': { height: '100%' },
					'.cm-scroller': { overflow: 'auto' }
				})
			],
			parent: editorElement
		});
	});

	onDestroy(() => {
		view?.destroy();
	});

	// Sync from store to editor
	$effect(() => {
		if (view && mapStore.geojsonString !== view.state.doc.toString()) {
			const transaction = view.state.update({
				changes: { from: 0, to: view.state.doc.length, insert: mapStore.geojsonString }
			});
			view.dispatch(transaction);
		}
	});

	// Sync theme
	$effect(() => {
		if (view) {
			// This is a bit simplified, ideally re-configure extensions
		}
	});
</script>

<div class="bg-card flex h-full flex-col overflow-hidden">
	<div bind:this={editorElement} class="min-h-0 flex-1 font-mono text-sm"></div>
</div>

<style>
	:global(.cm-editor) {
		height: 100% !important;
	}
	:global(.cm-focused) {
		outline: none !important;
	}
</style>
