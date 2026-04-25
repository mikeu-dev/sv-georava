<script lang="ts">
	import Button from '../atoms/Button.svelte';
	import Tooltip from '../atoms/Tooltip.svelte';
	import type { Component, ComponentProps } from 'svelte';
	import type { Icon } from 'lucide-svelte';

	interface IconButtonProps {
		icon: Component<ComponentProps<Icon>>;
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
		icon: IconComp,
		label,
		onclick,
		variant = 'ghost',
		size = 'icon',
		active = false,
		disabled = false,
		side = 'top',
		class: className,
		iconClass
	}: IconButtonProps = $props();
</script>

<Tooltip content={label} {side}>
	<Button tag="span" {variant} {size} {onclick} {disabled} class={className} data-active={active}>
		<IconComp class={iconClass ?? 'h-4 w-4'} />
	</Button>
</Tooltip>
