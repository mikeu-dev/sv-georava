<script lang="ts">
	import { uiStore } from '$lib/stores/ui.store.svelte';
	import IconButton from '../../molecules/IconButton.svelte';
	import ThemeToggle from '../../molecules/ThemeToggle.svelte';
	import JSONEditor from './JSONEditor.svelte';
	import FeatureList from './FeatureList.svelte';
	import LayerManager from './LayerManager.svelte';
	import SpatialAnalysis from './SpatialAnalysis.svelte';
	import { authClient } from '$lib/auth-client';
	import {
		Undo2,
		Redo2
	} from 'lucide-svelte';
	import type { Icon } from 'lucide-svelte';
	import type { Component, ComponentProps } from 'svelte';

	type LucideIcon = Component<ComponentProps<Icon>>;

	const session = authClient.useSession();

	import ProjectPanel from './ProjectPanel.svelte';

	let { children } = $props<{ children?: import('svelte').Snippet }>();
</script>

<aside
	class="bg-card flex h-screen w-80 flex-col border-r transition-all duration-300"
>
	<!-- Panel Toolbar (Compact) -->
	<div class="flex items-center justify-between border-b px-2 py-1.5">
		<div class="flex items-center gap-1.5">
			<div class="bg-primary size-2 rounded-full"></div>
			<span class="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
				{uiStore.activeTab} Inspector
			</span>
		</div>
		<div class="flex items-center gap-0.5">
			<IconButton icon={Undo2 as unknown as LucideIcon} label="Undo" size="xs" />
			<IconButton icon={Redo2 as unknown as LucideIcon} label="Redo" size="xs" />
		</div>
	</div>

	<!-- Tab Content -->
	<main class="relative flex-1 overflow-hidden">
		{#if uiStore.activeTab === 'json'}
			<JSONEditor />
		{:else if uiStore.activeTab === 'features'}
			<FeatureList />
		{:else if uiStore.activeTab === 'layers'}
			<LayerManager />
		{:else if uiStore.activeTab === 'projects'}
			<ProjectPanel />
		{:else if uiStore.activeTab === 'spatial'}
			<SpatialAnalysis />
		{:else}
			<div class="flex h-full flex-col items-center justify-center p-8 text-center">
				<p class="text-muted-foreground text-xs italic">
					Module {uiStore.activeTab} is under construction...
				</p>
			</div>
		{/if}
		{@render children?.()}
	</main>

	<!-- Footer / Context Stats (Ultra Compact) -->
	<footer class="flex flex-col border-t bg-muted/10">
		<div class="flex items-center justify-between p-2 px-3">
			<div class="flex items-center gap-2">
				{#if $session.data}
					<div class="size-5 rounded-full bg-primary/20 flex items-center justify-center text-[8px] font-bold">
						{($session.data.user.name || 'U').charAt(0)}
					</div>
					<span class="text-[9px] font-medium truncate max-w-[100px]">{$session.data.user.name}</span>
				{:else}
					<span class="text-[9px] text-muted-foreground uppercase tracking-wider font-bold">Guest Mode</span>
				{/if}
			</div>
			<div class="flex items-center gap-2">
				<ThemeToggle />
				<div class="text-muted-foreground text-[9px] font-mono">v2.0</div>
			</div>
		</div>
	</footer>
</aside>


