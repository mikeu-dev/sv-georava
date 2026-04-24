<script lang="ts">
	import { Tooltip as BitsTooltip } from 'bits-ui';
	import { cn } from '$lib/utils/cn';

	interface Props {
		content: string;
		children: import('svelte').Snippet;
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
	<BitsTooltip.Trigger asChild let:builder>
		<div use:builder.action {...builder} class="inline-block">
			{@render children()}
		</div>
	</BitsTooltip.Trigger>
	<BitsTooltip.Content
		{side}
		{align}
		class={cn(
			'z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
			className
		)}
		sideOffset={4}
	>
		{content}
		<BitsTooltip.Arrow class="fill-popover" />
	</BitsTooltip.Content>
</BitsTooltip.Root>
