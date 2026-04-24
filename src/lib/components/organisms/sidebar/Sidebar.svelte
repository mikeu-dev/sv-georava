<script lang="ts">
	import { uiStore } from '$lib/stores/ui.store.svelte';
	import { cn } from '$lib/utils/cn';
	import IconButton from '../../molecules/IconButton.svelte';
	import ThemeToggle from '../../molecules/ThemeToggle.svelte';
	import {
		Code2,
		ListFilter,
		Layers,
		CircleHelp,
		Settings2,
		Undo2,
		Redo2,
		Copy,
		Share2,
		Download,
		LayoutDashboard
	} from 'lucide-svelte';
	import type { SidebarTab } from '$lib/types/ui.types';
	import type { Icon } from 'lucide-svelte';
	import type { Component, ComponentProps } from 'svelte';

	type LucideIcon = Component<ComponentProps<Icon>>;

	interface SidebarTabItem {
		id: SidebarTab;
		icon: LucideIcon;
		label: string;
	}

	const tabs: SidebarTabItem[] = [
		{ id: 'json', icon: Code2 as unknown as LucideIcon, label: 'JSON Editor' },
		{ id: 'features', icon: ListFilter as unknown as LucideIcon, label: 'Features' },
		{ id: 'layers', icon: Layers as unknown as LucideIcon, label: 'Layers' },
		{ id: 'help', icon: CircleHelp as unknown as LucideIcon, label: 'Help' }
	];

	let { children } = $props();
</script>

<aside
	class="flex h-screen w-80 flex-col border-r bg-background transition-all duration-300"
	data-collapsed={uiStore.sidebarCollapsed}
>
	<!-- Header -->
	<header class="flex h-14 items-center justify-between border-b px-4">
		<div class="flex items-center gap-2 font-semibold">
			<LayoutDashboard class="h-5 w-5 text-primary" />
			<span>Georava Workspace</span>
		</div>
		<div class="flex items-center gap-1">
			<IconButton icon={Settings2 as unknown as LucideIcon} label="Settings" />
		</div>
	</header>

	<!-- Toolbar -->
	<div class="flex items-center justify-between border-b bg-muted/20 px-2 py-1">
		<div class="flex gap-1">
			<IconButton icon={Undo2 as unknown as LucideIcon} label="Undo" />
			<IconButton icon={Redo2 as unknown as LucideIcon} label="Redo" />
			<div class="mx-1 h-4 w-px bg-border"></div>
			<IconButton icon={Copy as unknown as LucideIcon} label="Copy Feature" />
			<IconButton icon={Share2 as unknown as LucideIcon} label="Share Map" />
		</div>
		<div class="flex gap-1">
			<IconButton icon={Download as unknown as LucideIcon} label="Export Data" />
		</div>
	</div>

	<!-- Tabs Nav -->
	<nav class="flex border-b bg-muted/10 p-1 gap-1">
		{#each tabs as tab (tab.id)}
			<button
				onclick={() => uiStore.setActiveTab(tab.id)}
				class={cn(
					'flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
					uiStore.activeTab === tab.id
						? 'bg-background text-foreground shadow-sm'
						: 'text-muted-foreground hover:bg-background/50 hover:text-foreground'
				)}
			>
				<div class="flex items-center justify-center gap-2">
					<tab.icon class="h-3.5 w-3.5" />
					<span>{tab.label}</span>
				</div>
			</button>
		{/each}
	</nav>

	<!-- Tab Content -->
	<main class="flex-1 overflow-hidden relative">
		{@render children?.()}
	</main>

	<!-- Footer -->
	<footer class="flex items-center justify-between border-t p-2">
		<ThemeToggle />
		<div class="text-[10px] text-muted-foreground">v2.0.0-beta</div>
	</footer>
</aside>
