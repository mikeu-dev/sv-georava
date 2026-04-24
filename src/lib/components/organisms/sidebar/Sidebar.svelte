<script lang="ts">
	import { uiStore } from '$lib/stores/ui.store.svelte';
	import { mapStore } from '$lib/stores/map.store.svelte';
	import { cn } from '$lib/utils/cn';
	import IconButton from '../../molecules/IconButton.svelte';
	import ThemeToggle from '../../molecules/ThemeToggle.svelte';
	import {
		Code2,
		ListFilter,
		Layers,
		HelpCircle,
		Download,
		Undo2,
		Redo2,
		Copy,
		Share2,
		Settings2,
		LayoutDashboard
	} from 'lucide-svelte';
	import type { SidebarTab } from '$lib/types/ui.types';

	const tabs: { id: SidebarTab; icon: any; label: string }[] = [
		{ id: 'json', icon: Code2, label: 'JSON Editor' },
		{ id: 'features', icon: ListFilter, label: 'Features' },
		{ id: 'layers', icon: Layers, label: 'Layers' },
		{ id: 'help', icon: HelpCircle, label: 'Help' }
	];
</script>

<aside
	class="flex flex-col w-[400px] border-r bg-card shadow-2xl z-20 transition-all duration-300 animate-slide-in-left"
>
	<!-- Header -->
	<header class="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
		<div class="flex items-center gap-2.5">
			<div class="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
				<LayoutDashboard class="w-5 h-5 text-primary" />
			</div>
			<div>
				<h1 class="text-sm font-bold tracking-tight">GEORAVA</h1>
				<p class="text-[10px] text-muted-foreground font-medium uppercase tracking-widest leading-none mt-0.5">Professional GIS</p>
			</div>
		</div>
		<div class="flex items-center gap-1">
			<ThemeToggle />
			<IconButton icon={Settings2} label="Settings" />
		</div>
	</header>

	<!-- Toolbar -->
	<div class="flex items-center justify-between px-2 py-1.5 border-b bg-card">
		<div class="flex items-center gap-0.5">
			<IconButton icon={Undo2} label="Undo (Ctrl+Z)" disabled={true} />
			<IconButton icon={Redo2} label="Redo (Ctrl+Y)" disabled={true} />
			<div class="w-px h-4 bg-border mx-1"></div>
			<IconButton icon={Copy} label="Copy GeoJSON" onclick={() => uiStore.flashCopied()} />
			<IconButton icon={Share2} label="Share Map" onclick={() => uiStore.flashLinkCopied()} />
		</div>
		<IconButton
			icon={Download}
			label="Export Data"
			variant="secondary"
			class="h-8 px-3 w-auto gap-2 text-xs font-semibold"
		>
			<span slot="default">Export</span>
		</IconButton>
	</div>

	<!-- Tabs Nav -->
	<nav class="flex border-b bg-muted/10 p-1 gap-1">
		{#each tabs as tab}
			<button
				onclick={() => uiStore.setActiveTab(tab.id)}
				class={cn(
					'flex-1 flex items-center justify-center gap-2 py-2 px-1 rounded-md text-xs font-bold transition-all',
					uiStore.activeTab === tab.id
						? 'bg-card text-primary shadow-sm border border-border/50'
						: 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
				)}
			>
				<tab.icon class="w-3.5 h-3.5" />
				{tab.label}
			</button>
		{/each}
	</nav>

	<!-- Content Area -->
	<main class="flex-1 overflow-hidden relative">
		<slot />
	</main>

	<!-- Footer -->
	<footer class="px-4 py-2 border-t bg-muted/20 flex items-center justify-between">
		<span class="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">v0.1.0 Beta</span>
		<div class="flex items-center gap-2">
			<div class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
			<span class="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">System Ready</span>
		</div>
	</footer>
</aside>
