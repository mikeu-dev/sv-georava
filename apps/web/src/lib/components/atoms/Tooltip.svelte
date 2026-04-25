<script lang="ts">
	import { Tooltip as BitsTooltip } from 'bits-ui';
	import { cn } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';

	interface Props {
		content: string;
		children: Snippet;
		side?: 'top' | 'right' | 'bottom' | 'left';
		align?: 'start' | 'center' | 'end';
		delayDuration?: number;
		class?: string;
	}

	let {
		content,
		children,
		side = 'top',
		align = 'center',
		delayDuration = 200,
		class: className
	}: Props = $props();
</script>

<BitsTooltip.Root {delayDuration}>
	<BitsTooltip.Trigger>
		{#snippet child({ props })}
			<span {...props} class={cn('inline-block outline-none', className)}>
				{@render children()}
			</span>
		{/snippet}
	</BitsTooltip.Trigger>
	<BitsTooltip.Content
		{side}
		{align}
		class={cn(
			'bg-popover text-popover-foreground animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 overflow-hidden rounded-md border px-3 py-1.5 text-xs shadow-md',
			className
		)}
		sideOffset={4}
	>
		{content}
		<BitsTooltip.Arrow class="fill-popover" />
	</BitsTooltip.Content>
</BitsTooltip.Root>
