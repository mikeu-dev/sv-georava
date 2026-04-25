<script lang="ts">
	import { uiStore } from '$lib/stores/ui.store.svelte';
	import { resolve } from '$app/paths';
	import { cn } from '$lib/utils/cn';
	import IconButton from '../../molecules/IconButton.svelte';
	import ThemeToggle from '../../molecules/ThemeToggle.svelte';
	import JSONEditor from './JSONEditor.svelte';
	import FeatureList from './FeatureList.svelte';
	import LayerManager from './LayerManager.svelte';
	import SpatialAnalysis from './SpatialAnalysis.svelte';
	import { authClient } from '$lib/auth-client';
	import {
		Code2,
		ListFilter,
		Layers,
		Wand2,
		CircleHelp,
		Settings2,
		Undo2,
		Redo2,
		Copy,
		Share2,
		Download,
		LayoutDashboard,
		LogOut,
		User as UserIcon
	} from 'lucide-svelte';
	import type { SidebarTab } from '$lib/types/ui.types';
	import type { Icon } from 'lucide-svelte';
	import type { Component, ComponentProps } from 'svelte';

	type LucideIcon = Component<ComponentProps<Icon>>;

	const session = authClient.useSession();

	interface SidebarTabItem {
		id: SidebarTab;
		icon: LucideIcon;
		label: string;
	}

	const tabs: SidebarTabItem[] = [
		{ id: 'json', icon: Code2 as unknown as LucideIcon, label: 'JSON' },
		{ id: 'features', icon: ListFilter as unknown as LucideIcon, label: 'Features' },
		{ id: 'layers', icon: Layers as unknown as LucideIcon, label: 'Layers' },
		{ id: 'projects', icon: FolderOpen as unknown as LucideIcon, label: 'Projects' },
		{ id: 'spatial', icon: Wand2 as unknown as LucideIcon, label: 'Spatial' },
		{ id: 'help', icon: CircleHelp as unknown as LucideIcon, label: 'Help' }
	];

	import ProjectPanel from './ProjectPanel.svelte';
	import { FolderOpen } from 'lucide-svelte';

	let { children } = $props();

	async function handleLogout() {
		await authClient.signOut();
		window.location.reload();
	}
</script>

<aside
	class="bg-background flex h-screen w-80 flex-col border-r transition-all duration-300"
	data-collapsed={uiStore.sidebarCollapsed}
>
	<!-- Header -->
	<header class="flex h-14 items-center justify-between border-b px-4">
		<div class="flex items-center gap-2 font-semibold">
			<LayoutDashboard class="text-primary h-5 w-5" />
			<span>Georava Workspace</span>
		</div>
		<div class="flex items-center gap-1">
			<IconButton icon={Settings2 as unknown as LucideIcon} label="Settings" />
		</div>
	</header>

	<!-- Toolbar -->
	<div class="bg-muted/20 flex items-center justify-between border-b px-2 py-1">
		<div class="flex gap-1">
			<IconButton icon={Undo2 as unknown as LucideIcon} label="Undo" />
			<IconButton icon={Redo2 as unknown as LucideIcon} label="Redo" />
			<div class="bg-border mx-1 h-4 w-px"></div>
			<IconButton icon={Copy as unknown as LucideIcon} label="Copy Feature" />
			<IconButton icon={Share2 as unknown as LucideIcon} label="Share Map" />
		</div>
		<div class="flex gap-1">
			<IconButton icon={Download as unknown as LucideIcon} label="Export Data" />
		</div>
	</div>

	<!-- Tabs Nav -->
	<nav class="bg-muted/10 no-scrollbar flex gap-1 overflow-x-auto border-b p-1">
		{#each tabs as tab (tab.id)}
			<button
				onclick={() => uiStore.setActiveTab(tab.id)}
				class={cn(
					'flex-1 rounded-md px-2 py-1.5 text-[10px] font-medium whitespace-nowrap transition-colors',
					uiStore.activeTab === tab.id
						? 'bg-background text-foreground shadow-sm'
						: 'text-muted-foreground hover:bg-background/50 hover:text-foreground'
				)}
			>
				<div class="flex items-center justify-center gap-1.5">
					<tab.icon class="h-3 w-3" />
					<span>{tab.label}</span>
				</div>
			</button>
		{/each}
	</nav>

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

	<!-- Footer / User Profile -->
	<footer class="flex flex-col border-t">
		<div class="bg-muted/5 flex items-center justify-between p-2 px-3">
			{#if $session.data}
				<div class="flex items-center gap-2 overflow-hidden">
					<div
						class="bg-primary/10 text-primary flex h-7 w-7 items-center justify-center rounded-full"
					>
						<UserIcon class="h-4 w-4" />
					</div>
					<div class="flex flex-col overflow-hidden">
						<span class="truncate text-[10px] font-semibold">{$session.data.user.name}</span>
						<span class="text-muted-foreground truncate text-[9px]">{$session.data.user.email}</span
						>
					</div>
				</div>
				<IconButton
					icon={LogOut as unknown as LucideIcon}
					label="Sign Out"
					size="xs"
					variant="ghost"
					class="text-muted-foreground hover:text-destructive"
					onclick={handleLogout}
				/>
			{:else}
				<a
					href={resolve('/auth/login')}
					class="text-primary flex items-center gap-2 text-[10px] font-medium hover:underline"
				>
					<UserIcon class="h-3.5 w-3.5" />
					Sign in to sync
				</a>
			{/if}
		</div>
		<div class="flex items-center justify-between border-t p-2 px-3">
			<ThemeToggle />
			<div class="text-muted-foreground text-[10px]">v2.0.0-beta</div>
		</div>
	</footer>
</aside>

<style>
	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}
	.no-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
