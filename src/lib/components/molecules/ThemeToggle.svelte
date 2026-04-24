<script lang="ts">
	import { uiStore } from '$lib/stores/ui.store.svelte';
	import IconButton from './IconButton.svelte';
	import { Sun, Moon } from 'lucide-svelte';
</script>

<IconButton
	icon={uiStore.theme === 'light' ? Moon : Sun}
	label="Toggle Theme"
	onclick={() => uiStore.toggleTheme()}
	class="text-muted-foreground hover:text-foreground"
/>
