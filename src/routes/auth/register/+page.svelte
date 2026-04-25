<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import Button from '$lib/components/atoms/Button.svelte';
	import { Mail, Lock, Loader2, User, LayoutDashboard } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { registerSchema } from './schema';
	import { untrack } from 'svelte';

	let { data } = $props();

	let isLoading = $state(false);
	let authError = $state<string | null>(null);

	const { form, errors, enhance, constraints } = superForm(untrack(() => data.form), {
		validators: zodClient(registerSchema as unknown as Parameters<typeof zodClient>[0]),
		SPA: true,
		async onUpdate({ form: f }) {
			if (!f.valid) return;
			
			isLoading = true;
			authError = null;

			try {
				const { error } = await authClient.signUp.email({
					email: f.data.email as string,
					password: f.data.password as string,
					name: f.data.name as string
				});

				if (error) {
					authError = error.message || 'Failed to sign up';
				} else {
					goto(resolve('/'));
				}
			} catch {
				authError = 'An unexpected error occurred';
			} finally {
				isLoading = false;
			}
		}
	});
</script>

<div class="flex min-h-screen items-center justify-center bg-muted/30 p-4">
	<div class="w-full max-w-md space-y-8 rounded-2xl border bg-background p-8 shadow-xl">
		<div class="text-center">
			<div class="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
				<LayoutDashboard class="h-6 w-6" />
			</div>
			<h2 class="mt-6 text-3xl font-bold tracking-tight">Create Account</h2>
			<p class="mt-2 text-sm text-muted-foreground">Join Georava to start mapping</p>
		</div>

		<form class="mt-8 space-y-6" use:enhance>
			<div class="space-y-4 rounded-md shadow-sm">
				<div class="space-y-1">
					<div class="relative">
						<User class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<input
							name="name"
							bind:value={$form.name}
							type="text"
							placeholder="Full Name"
							aria-invalid={$errors.name ? 'true' : undefined}
							{...$constraints.name}
							class="block w-full rounded-lg border bg-muted/20 py-2.5 pl-10 pr-3 text-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
						/>
					</div>
					{#if $errors.name}
						<p class="text-[10px] text-destructive">{$errors.name}</p>
					{/if}
				</div>

				<div class="space-y-1">
					<div class="relative">
						<Mail class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<input
							name="email"
							bind:value={$form.email}
							type="email"
							placeholder="Email address"
							aria-invalid={$errors.email ? 'true' : undefined}
							{...$constraints.email}
							class="block w-full rounded-lg border bg-muted/20 py-2.5 pl-10 pr-3 text-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
						/>
					</div>
					{#if $errors.email}
						<p class="text-[10px] text-destructive">{$errors.email}</p>
					{/if}
				</div>

				<div class="space-y-1">
					<div class="relative">
						<Lock class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<input
							name="password"
							bind:value={$form.password}
							type="password"
							placeholder="Password"
							aria-invalid={$errors.password ? 'true' : undefined}
							{...$constraints.password}
							class="block w-full rounded-lg border bg-muted/20 py-2.5 pl-10 pr-3 text-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
						/>
					</div>
					{#if $errors.password}
						<p class="text-[10px] text-destructive">{$errors.password}</p>
					{/if}
				</div>

				<div class="space-y-1">
					<div class="relative">
						<Lock class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<input
							name="confirmPassword"
							bind:value={$form.confirmPassword}
							type="password"
							placeholder="Confirm Password"
							aria-invalid={$errors.confirmPassword ? 'true' : undefined}
							{...$constraints.confirmPassword}
							class="block w-full rounded-lg border bg-muted/20 py-2.5 pl-10 pr-3 text-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
						/>
					</div>
					{#if $errors.confirmPassword}
						<p class="text-[10px] text-destructive">{$errors.confirmPassword}</p>
					{/if}
				</div>
			</div>

			{#if authError}
				<div class="rounded-lg bg-destructive/10 p-3 text-center text-xs text-destructive">
					{authError}
				</div>
			{/if}

			<div>
				<Button 
					type="submit" 
					class="w-full py-6 text-base font-semibold" 
					disabled={isLoading}
				>
					{#if isLoading}
						<Loader2 class="mr-2 h-5 w-5 animate-spin" />
						Creating account...
					{:else}
						Create Account
					{/if}
				</Button>
			</div>
		</form>

		<div class="text-center text-sm text-muted-foreground">
			Already have an account? 
			<a href={resolve('/auth/login')} class="font-medium text-primary hover:underline">Sign in</a>
		</div>
	</div>
</div>
