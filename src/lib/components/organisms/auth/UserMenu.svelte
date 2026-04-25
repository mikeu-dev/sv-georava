<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import { DropdownMenu } from 'bits-ui';
	import Button from '$lib/components/atoms/Button.svelte';
	import { User, LogOut, Settings, UserCircle } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	let { user } = $props<{ user: { name: string; email: string; image?: string | null } | null }>();

	async function handleLogout() {
		await authClient.signOut();
		goto(resolve('/auth/login'));
	}
</script>

{#if user}
	<DropdownMenu.Root>
		<DropdownMenu.Trigger>
			<Button
				variant="ghost"
				size="icon"
				class="border-border/50 bg-background/50 h-9 w-9 overflow-hidden rounded-full border backdrop-blur-sm"
			>
				{#if user.image}
					<img src={user.image} alt={user.name} class="h-full w-full object-cover" />
				{:else}
					<UserCircle class="text-muted-foreground h-5 w-5" />
				{/if}
			</Button>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content
			class="bg-background/95 animate-in fade-in-0 zoom-in-95 pointer-events-auto z-50 min-w-[200px] rounded-xl border p-1 shadow-2xl backdrop-blur-md"
			sideOffset={8}
			align="end"
		>
			<div class="border-bottom mb-1 px-3 py-2">
				<p class="truncate text-xs font-semibold">{user.name}</p>
				<p class="text-muted-foreground truncate text-[10px]">{user.email}</p>
			</div>

			<DropdownMenu.Separator class="bg-border/40 mx-1 h-px" />

			<DropdownMenu.Item
				class="hover:bg-accent hover:text-accent-foreground flex cursor-pointer items-center rounded-lg px-3 py-2 text-xs transition-colors outline-none"
			>
				<User class="mr-2 h-3.5 w-3.5" />
				Profile
			</DropdownMenu.Item>

			<DropdownMenu.Item
				class="hover:bg-accent hover:text-accent-foreground flex cursor-pointer items-center rounded-lg px-3 py-2 text-xs transition-colors outline-none"
			>
				<Settings class="mr-2 h-3.5 w-3.5" />
				Settings
			</DropdownMenu.Item>

			<DropdownMenu.Separator class="bg-border/40 mx-1 h-px" />

			<DropdownMenu.Item
				onSelect={handleLogout}
				class="text-destructive hover:bg-destructive/10 flex cursor-pointer items-center rounded-lg px-3 py-2 text-xs transition-colors outline-none"
			>
				<LogOut class="mr-2 h-3.5 w-3.5" />
				Sign out
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{:else}
	<Button
		variant="outline"
		size="sm"
		class="border-border/50 bg-background/50 h-9 gap-2 rounded-full backdrop-blur-sm"
		onclick={() => goto(resolve('/auth/login'))}
	>
		<User class="h-3.5 w-3.5" />
		Sign in
	</Button>
{/if}
