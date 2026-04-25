<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import Button from '$lib/components/atoms/Button.svelte';
	import { Mail, Lock, Loader2, LayoutDashboard } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { loginSchema } from './schema';

	import { untrack } from 'svelte';

	let { data } = $props();

	let isLoading = $state(false);
	let authError = $state<string | null>(null);

	const { form, errors, enhance, constraints } = superForm(
		untrack(() => data.form),
		{
			validators: zodClient(loginSchema as unknown as Parameters<typeof zodClient>[0]),
			SPA: true,
			async onUpdate({ form: f }) {
				if (!f.valid) return;

				isLoading = true;
				authError = null;

				try {
					const { error } = await authClient.signIn.email({
						email: f.data.email as string,
						password: f.data.password as string
					});

					if (error) {
						authError = error.message || 'Failed to sign in';
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
			<h2 class="mt-6 text-3xl font-bold tracking-tight">Welcome Back</h2>
			<p class="text-muted-foreground mt-2 text-sm">Sign in to your Georava account</p>
		</div>

		<form class="mt-8 space-y-6" use:enhance>
			<div class="space-y-4 rounded-md shadow-sm">
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
						Signing in...
					{:else}
						Sign in
					{/if}
				</Button>
			</div>
		</form>

		<div class="text-muted-foreground text-center text-sm">
			Don't have an account?
			<a href={resolve('/auth/register')} class="text-primary font-medium hover:underline"
				>Register now</a
			>
		</div>
	</div>
</div>
