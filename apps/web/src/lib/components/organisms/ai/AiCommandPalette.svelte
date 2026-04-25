<script lang="ts">
	import { Sparkles, Loader2, X } from 'lucide-svelte';
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
		} catch {
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
		class="glass-pill bg-accent/15 group fixed right-6 bottom-20 z-30 flex items-center gap-2.5 rounded-full border border-white/10 px-4 py-2.5 shadow-2xl transition-all hover:scale-105"
	>
		<Sparkles class="text-accent h-5 w-5 animate-pulse" />
		<span class="text-foreground/90 text-xs font-bold">Ask Georava</span>
		<div
			class="ml-1 flex items-center gap-1 rounded-md border border-white/10 bg-white/10 px-1.5 py-0.5"
		>
			<span class="text-muted-foreground font-mono text-[9px] font-bold uppercase">Ctrl+K</span>
		</div>
	</button>
{:else}
	<div
		class="bg-background/40 animate-in fade-in fixed inset-0 z-50 flex items-start justify-center px-4 pt-[15vh] backdrop-blur-md duration-300"
	>
		<div
			class="border-border bg-card/80 animate-in slide-in-from-top-8 w-full max-w-2xl overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-2xl"
		>
			<form onsubmit={handleSubmit} class="flex items-center gap-4 p-5">
				{#if isLoading}
					<Loader2 class="text-accent h-6 w-6 animate-spin" />
				{:else}
					<Sparkles class="text-accent h-6 w-6" />
				{/if}
				<input
					bind:this={inputRef}
					bind:value={query}
					type="text"
					class="placeholder:text-muted-foreground/50 flex-1 border-none bg-transparent text-lg font-medium outline-none"
					placeholder="Ask Georava (e.g., 'Fly to Jakarta' or 'Buffer these polylines')..."
					disabled={isLoading}
				/>
				<button
					type="button"
					onclick={() => (isOpen = false)}
					class="hover:bg-muted rounded-lg p-1.5 transition-all"
				>
					<X class="text-muted-foreground h-5 w-5" />
				</button>
			</form>

			{#if narrative}
				<div class="animate-in fade-in slide-in-from-top-2 px-5 pb-5">
					<div class="border-border/50 flex items-start gap-3 border-t pt-4">
						<p class="text-foreground/80 text-sm italic">{narrative}</p>
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}
