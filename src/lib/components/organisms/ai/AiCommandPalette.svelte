<script lang="ts">
	import { Sparkles, Loader2, Command, X } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { mapStore } from '$lib/stores/map.store.svelte';

	let isOpen = $state(false);
	let query = $state('');
	let isLoading = $state(false);
	let narrative = $state('');
	let inputRef = $state<HTMLInputElement>();

	function toggle() {
		isOpen = !isOpen;
		if (isOpen) {
			setTimeout(() => inputRef?.focus(), 50);
		}
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!query.trim() || isLoading) return;

		isLoading = true;
		narrative = 'Analyzing request...';

		try {
			const res = await fetch('/api/ai/intent', {
				method: 'POST',
				body: JSON.stringify({
					query,
					context: mapStore.geojsonString.slice(0, 5000) // limit context
				})
			});
			const result = await res.json();
			narrative = result.narrative;

			// Handle Actions
			if (result.action === 'switch_basemap') {
				// mapStore.setBasemap(result.params.id);
			}

			// Auto-close
			setTimeout(() => {
				if (result.action !== 'unknown') {
					isOpen = false;
					query = '';
					narrative = '';
				}
			}, 3000);
		} catch (err) {
			narrative = 'Error communicating with AI.';
		} finally {
			isLoading = false;
		}
	}

	onMount(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
				e.preventDefault();
				toggle();
			}
			if (e.key === 'Escape') isOpen = false;
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	});
</script>

{#if !isOpen}
	<button
		onclick={toggle}
		class="fixed bottom-20 right-6 z-30 flex items-center gap-2.5 px-4 py-2.5 rounded-full glass-pill shadow-2xl hover:scale-105 transition-all border border-white/10 bg-accent/15 group"
	>
		<Sparkles class="h-5 w-5 text-accent animate-pulse" />
		<span class="text-xs font-bold text-foreground/90">Ask Georava</span>
		<div class="flex items-center gap-1 ml-1 px-1.5 py-0.5 rounded-md bg-white/10 border border-white/10">
			<span class="text-[9px] font-mono font-bold text-muted-foreground uppercase">Ctrl+K</span>
		</div>
	</button>
{:else}
	<div class="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-background/40 backdrop-blur-md animate-in fade-in duration-300">
		<div class="w-full max-w-2xl overflow-hidden rounded-2xl shadow-2xl border border-border bg-card/80 backdrop-blur-2xl animate-in slide-in-from-top-8">
			<form onsubmit={handleSubmit} class="flex items-center p-5 gap-4">
				{#if isLoading}
					<Loader2 class="h-6 w-6 animate-spin text-accent" />
				{:else}
					<Sparkles class="h-6 w-6 text-accent" />
				{/if}
				<input
					bind:this={inputRef}
					bind:value={query}
					type="text"
					class="flex-1 bg-transparent border-none outline-none text-lg font-medium placeholder:text-muted-foreground/50"
					placeholder="Ask Georava (e.g., 'Fly to Jakarta' or 'Buffer these polylines')..."
					disabled={isLoading}
				/>
				<button type="button" onclick={() => (isOpen = false)} class="p-1.5 hover:bg-muted rounded-lg transition-all">
					<X class="h-5 w-5 text-muted-foreground" />
				</button>
			</form>

			{#if narrative}
				<div class="px-5 pb-5 animate-in fade-in slide-in-from-top-2">
					<div class="pt-4 border-t border-border/50 flex items-start gap-3">
						<p class="text-sm text-foreground/80 italic">{narrative}</p>
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}
