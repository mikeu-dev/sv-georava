<script lang="ts">
	import Button from '../atoms/Button.svelte';
	import Tooltip from '../atoms/Tooltip.svelte';
	import type { Component } from 'svelte';

	interface Props {
		icon: Component;
		label: string;
		onclick?: () => void;
		variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'accent';
		size?: 'default' | 'sm' | 'lg' | 'icon' | 'xs';
		active?: boolean;
		disabled?: boolean;
		side?: 'top' | 'right' | 'bottom' | 'left';
		class?: string;
		iconClass?: string;
	}

	let {
		icon: Icon,
		label,
		onclick,
		variant = 'ghost',
		size = 'icon',
		active = false,
		disabled = false,
		side = 'top',
		class: className,
		iconClass
	}: Props = $props();
</script>

<Tooltip content={label} {side}>
	<Button
		{variant}
		{size}
		{onclick}
		{disabled}
		class={className}
		data-active={active}
	>
		<Icon class={iconClass ?? 'h-4 w-4'} />
	</Button>
</Tooltip>
