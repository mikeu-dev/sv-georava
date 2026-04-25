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
			<Button variant="ghost" size="icon" class="h-9 w-9 rounded-full border border-border/50 bg-background/50 backdrop-blur-sm overflow-hidden">
				{#if user.image}
					<img src={user.image} alt={user.name} class="h-full w-full object-cover" />
				{:else}
					<UserCircle class="h-5 w-5 text-muted-foreground" />
				{/if}
			</Button>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content
			class="z-50 min-w-[200px] rounded-xl border bg-background/95 p-1 shadow-2xl backdrop-blur-md animate-in fade-in-0 zoom-in-95 pointer-events-auto"
			sideOffset={8}
			align="end"
		>
			<div class="px-3 py-2 border-bottom mb-1">
				<p class="text-xs font-semibold truncate">{user.name}</p>
				<p class="text-[10px] text-muted-foreground truncate">{user.email}</p>
			</div>
			
			<DropdownMenu.Separator class="h-px bg-border/40 mx-1" />
			
			<DropdownMenu.Item
				class="flex cursor-pointer items-center rounded-lg px-3 py-2 text-xs outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
			>
				<User class="mr-2 h-3.5 w-3.5" />
				Profile
			</DropdownMenu.Item>
			
			<DropdownMenu.Item
				class="flex cursor-pointer items-center rounded-lg px-3 py-2 text-xs outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
			>
				<Settings class="mr-2 h-3.5 w-3.5" />
				Settings
			</DropdownMenu.Item>
			
			<DropdownMenu.Separator class="h-px bg-border/40 mx-1" />
			
			<DropdownMenu.Item
				onSelect={handleLogout}
				class="flex cursor-pointer items-center rounded-lg px-3 py-2 text-xs text-destructive outline-none transition-colors hover:bg-destructive/10"
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
		class="h-9 gap-2 rounded-full border-border/50 bg-background/50 backdrop-blur-sm"
		onclick={() => goto(resolve('/auth/login'))}
	>
		<User class="h-3.5 w-3.5" />
		Sign in
	</Button>
{/if}
