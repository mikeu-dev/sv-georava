<script lang="ts">
	import { uiStore } from '$lib/stores/ui.store.svelte';
	import { 
		Code2, 
		Layers, 
		Settings, 
		HelpCircle, 
		ListTree
	} from 'lucide-svelte';
	import { cn } from '$lib/utils/cn';
	import type { SidebarTab } from '$lib/types/ui.types';
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const items: any[] = [
		{ id: 'json', icon: Code2, label: 'GeoJSON Editor' },
		{ id: 'features', icon: ListTree, label: 'Feature List' },
		{ id: 'layers', icon: Layers, label: 'Layer Manager' },
		{ id: 'help', icon: HelpCircle, label: 'Documentation' }
	];

	let isCollapsed = $state(false);
</script>

<nav class="bg-card border-border flex h-full flex-col border-r transition-all duration-300" 
	style="width: {isCollapsed ? '64px' : '64px'}">
	<!-- Logo / Home -->
	<div class="flex h-16 items-center justify-center border-b">
		<div class="bg-primary size-8 rounded-sm shadow-lg flex items-center justify-center text-primary-foreground font-bold">
			G
		</div>
	</div>

	<!-- Navigation Items -->
	<div class="flex flex-1 flex-col items-center gap-4 py-6">
		{#each items as item (item.id)}
			<button
				onclick={() => uiStore.activeTab = item.id}
				class={cn(
					"group relative flex size-10 items-center justify-center rounded-md transition-all duration-200",
					uiStore.activeTab === item.id 
						? "bg-primary text-primary-foreground shadow-md" 
						: "text-muted-foreground hover:bg-secondary hover:text-foreground"
				)}
				title={item.label}
			>
				<item.icon size={20} strokeWidth={uiStore.activeTab === item.id ? 2.5 : 2} />
				
				<!-- Indicator -->
				{#if uiStore.activeTab === item.id}
					<div class="bg-primary absolute -left-1 h-6 w-1 rounded-r-full shadow-[0_0_8px_var(--color-primary)]"></div>
				{/if}

				<!-- Tooltip (Side) -->
				<div class="bg-popover text-popover-foreground pointer-events-none absolute left-14 z-50 whitespace-nowrap rounded-sm border px-2 py-1 text-xs font-medium opacity-0 shadow-xl transition-all group-hover:opacity-100">
					{item.label}
				</div>
			</button>
		{/each}
	</div>

	<!-- Bottom Section -->
	<div class="flex flex-col items-center gap-4 border-t py-6">
		<button
			class="text-muted-foreground hover:text-foreground flex size-10 items-center justify-center transition-colors"
			title="Settings"
		>
			<Settings size={20} />
		</button>
		
		<div class="bg-muted size-8 rounded-full border flex items-center justify-center overflow-hidden">
			<span class="text-[10px] font-bold">SV</span>
		</div>
	</div>
</nav>
