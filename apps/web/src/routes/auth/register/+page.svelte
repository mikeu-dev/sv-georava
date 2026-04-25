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

	const { form, errors, enhance, constraints } = superForm(
		untrack(() => data.form),
		{
			validators: zodClient(registerSchema),
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
		}
	);
</script>

<div class="bg-muted/30 flex min-h-screen items-center justify-center p-4">
	<div class="bg-background w-full max-w-md space-y-8 rounded-2xl border p-8 shadow-xl">
		<div class="text-center">
			<div
				class="bg-primary text-primary-foreground mx-auto flex h-12 w-12 items-center justify-center rounded-xl"
			>
				<LayoutDashboard class="h-6 w-6" />
			</div>
			<h2 class="mt-6 text-3xl font-bold tracking-tight">Create Account</h2>
			<p class="text-muted-foreground mt-2 text-sm">Join Georava to start mapping</p>
		</div>

		<form class="mt-8 space-y-6" use:enhance>
			<div class="space-y-4 rounded-md shadow-sm">
				<div class="space-y-1">
					<div class="relative">
						<User class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
						<input
							name="name"
							bind:value={$form.name}
							type="text"
							placeholder="Full Name"
							aria-invalid={$errors.name ? 'true' : undefined}
							{...$constraints.name}
							class="bg-muted/20 focus:border-primary focus:ring-primary block w-full rounded-lg border py-2.5 pr-3 pl-10 text-sm transition-all outline-none focus:ring-1"
						/>
					</div>
					{#if $errors.name}
						<p class="text-destructive text-[10px]">{$errors.name}</p>
					{/if}
				</div>

				<div class="space-y-1">
					<div class="relative">
						<Mail class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
						<input
							name="email"
							bind:value={$form.email}
							type="email"
							placeholder="Email address"
							aria-invalid={$errors.email ? 'true' : undefined}
							{...$constraints.email}
							class="bg-muted/20 focus:border-primary focus:ring-primary block w-full rounded-lg border py-2.5 pr-3 pl-10 text-sm transition-all outline-none focus:ring-1"
						/>
					</div>
					{#if $errors.email}
						<p class="text-destructive text-[10px]">{$errors.email}</p>
					{/if}
				</div>

				<div class="space-y-1">
					<div class="relative">
						<Lock class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
						<input
							name="password"
							bind:value={$form.password}
							type="password"
							placeholder="Password"
							aria-invalid={$errors.password ? 'true' : undefined}
							{...$constraints.password}
							class="bg-muted/20 focus:border-primary focus:ring-primary block w-full rounded-lg border py-2.5 pr-3 pl-10 text-sm transition-all outline-none focus:ring-1"
						/>
					</div>
					{#if $errors.password}
						<p class="text-destructive text-[10px]">{$errors.password}</p>
					{/if}
				</div>

				<div class="space-y-1">
					<div class="relative">
						<Lock class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
						<input
							name="confirmPassword"
							bind:value={$form.confirmPassword}
							type="password"
							placeholder="Confirm Password"
							aria-invalid={$errors.confirmPassword ? 'true' : undefined}
							{...$constraints.confirmPassword}
							class="bg-muted/20 focus:border-primary focus:ring-primary block w-full rounded-lg border py-2.5 pr-3 pl-10 text-sm transition-all outline-none focus:ring-1"
						/>
					</div>
					{#if $errors.confirmPassword}
						<p class="text-destructive text-[10px]">{$errors.confirmPassword}</p>
					{/if}
				</div>
			</div>

			{#if authError}
				<div class="bg-destructive/10 text-destructive rounded-lg p-3 text-center text-xs">
					{authError}
				</div>
			{/if}

			<div>
				<Button type="submit" class="w-full py-6 text-base font-semibold" disabled={isLoading}>
					{#if isLoading}
						<Loader2 class="mr-2 h-5 w-5 animate-spin" />
						Creating account...
					{:else}
						Create Account
					{/if}
				</Button>
			</div>
		</form>

		<div class="text-muted-foreground text-center text-sm">
			Already have an account?
			<a href={resolve('/auth/login')} class="text-primary font-medium hover:underline">Sign in</a>
		</div>
	</div>
</div>
