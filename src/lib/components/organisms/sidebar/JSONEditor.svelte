<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { EditorView, basicSetup } from 'codemirror';
	import { json } from '@codemirror/lang-json';
	import { oneDark } from '@codemirror/theme-one-dark';
	import { mapStore } from '$lib/stores/map.store.svelte';
	import { uiStore } from '$lib/stores/ui.store.svelte';
	import { cn } from '$lib/utils/cn';
	import GeoJSON from 'ol/format/GeoJSON.js';
	import type { Feature } from 'ol';
	import type { Geometry } from 'ol/geom';
	import { Braces } from 'lucide-svelte';
	import type { Icon } from 'lucide-svelte';
	import type { Component, ComponentProps } from 'svelte';
	import IconButton from '../../molecules/IconButton.svelte';

	type LucideIcon = Component<ComponentProps<Icon>>;

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
			mapStore.setFeatures(features as Feature<Geometry>[]);
			uiStore.setValidation('success', 'GeoJSON valid');
		} catch (e: unknown) {
			uiStore.setValidation('error', e instanceof Error ? e.message : 'Invalid JSON');
		}
	}

	function formatJson() {
		if (!view) return;
		try {
			const current = view.state.doc.toString();
			const formatted = JSON.stringify(JSON.parse(current), null, 2);
			view.dispatch({
				changes: { from: 0, to: view.state.doc.length, insert: formatted }
			});
			uiStore.setValidation('success', 'Formatted successfully');
		} catch {
			uiStore.setValidation('error', 'Cannot format invalid JSON');
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

<div class="bg-background flex h-full flex-col overflow-hidden">
	<div bind:this={editorElement} class="flex-1 overflow-hidden text-sm"></div>

	{#if uiStore.validationFeedback}
		<div
			class={cn(
				'flex items-center justify-between border-t px-4 py-2 font-mono text-[10px] transition-all duration-300',
				uiStore.validationStatus === 'error' && 'bg-destructive/10 text-destructive',
				uiStore.validationStatus === 'success' && 'bg-success/10 text-success'
			)}
		>
			<span class="truncate">{uiStore.validationFeedback}</span>
			<div class="flex gap-1">
				<IconButton
					icon={Braces as unknown as LucideIcon}
					label="Format JSON"
					size="xs"
					variant="ghost"
					class="h-5 w-5 p-0"
					onclick={formatJson}
				/>
			</div>
		</div>
	{/if}
</div>

<style>
	:global(.cm-editor) {
		height: 100% !important;
	}
</style>
