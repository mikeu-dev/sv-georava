<script lang="ts">
	import { uiStore } from '$lib/stores/ui.store.svelte';
	import IconButton from './IconButton.svelte';
	import { Sun, Moon } from 'lucide-svelte';
	import type { Component, ComponentProps } from 'svelte';
	import type { Icon } from 'lucide-svelte';

	type LucideIcon = Component<ComponentProps<Icon>>;

	const currentIcon = $derived((uiStore.theme === 'light' ? Moon : Sun) as unknown as LucideIcon);
</script>

<IconButton
	icon={currentIcon}
	label="Toggle Theme"
	onclick={() => uiStore.toggleTheme()}
	class="text-muted-foreground hover:text-foreground"
/>
