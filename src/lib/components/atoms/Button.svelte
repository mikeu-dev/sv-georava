<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';

	interface Props {
		children?: Snippet;
		onclick?: (e: MouseEvent) => void;
		type?: 'button' | 'submit' | 'reset';
		variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'accent';
		size?: 'default' | 'sm' | 'lg' | 'icon' | 'xs';
		class?: string;
		disabled?: boolean;
		tag?: 'button' | 'div' | 'span' | 'a';
		[key: string]: unknown;
	}

	let {
		children,
		onclick,
		type = 'button',
		variant = 'default',
		size = 'default',
		class: className,
		disabled = false,
		tag = 'button',
		...rest
	}: Props = $props();

	const variants = {
		default: 'bg-primary text-primary-foreground hover:bg-primary/90',
		destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
		outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
		secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
		ghost: 'hover:bg-accent hover:text-accent-foreground',
		accent: 'bg-accent text-accent-foreground hover:bg-accent/90'
	};

	const sizes = {
		default: 'h-10 px-4 py-2',
		sm: 'h-9 rounded-md px-3',
		lg: 'h-11 rounded-md px-8',
		icon: 'h-10 w-10',
		xs: 'h-7 w-7 rounded-sm p-1'
	};

	const baseClass =
		'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
</script>

{#if tag === 'button'}
	<button
		{type}
		class={cn(baseClass, variants[variant], sizes[size], className)}
		{onclick}
		{disabled}
		{...rest}
	>
		{@render children?.()}
	</button>
{:else if tag === 'div'}
	<div
		role="button"
		tabindex="0"
		class={cn(baseClass, variants[variant], sizes[size], className)}
		onclick={onclick}
		{...rest}
	>
		{@render children?.()}
	</div>
{:else if tag === 'span'}
	<span
		role="button"
		tabindex="0"
		class={cn(baseClass, variants[variant], sizes[size], className)}
		onclick={onclick}
		{...rest}
	>
		{@render children?.()}
	</span>
{/if}
