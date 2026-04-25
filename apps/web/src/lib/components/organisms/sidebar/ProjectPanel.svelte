<script lang="ts">
	import { onMount } from 'svelte';
	import { FolderOpen, Plus, Save, Trash2, Map as MapIcon, Loader2, Calendar } from 'lucide-svelte';
	import Button from '$lib/components/atoms/Button.svelte';
	import Input from '$lib/components/atoms/Input.svelte';
	import { mapStore } from '$lib/stores/map.store.svelte';
	import { uiStore } from '$lib/stores/ui.store.svelte';
	import type { Project } from '$lib/server/db/schema';

	let projects = $state<Project[]>([]);
	let isLoading = $state(true);
	let isSaving = $state(false);
	let newProjectName = $state('');
	let showSaveForm = $state(false);

	async function fetchProjects() {
		try {
			const res = await fetch('/api/projects');
			if (res.ok) {
				projects = await res.json();
			}
		} catch (error) {
			console.error('Failed to fetch projects:', error);
		} finally {
			isLoading = false;
		}
	}

	async function handleSaveProject() {
		if (!newProjectName.trim()) return;
		isSaving = true;
		try {
			const res = await fetch('/api/projects', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: newProjectName,
					data: mapStore.geojsonString
				})
			});
			if (res.ok) {
				newProjectName = '';
				showSaveForm = false;
				await fetchProjects();
			}
		} catch (error) {
			console.error('Failed to save project:', error);
		} finally {
			isSaving = false;
		}
	}

	async function handleDeleteProject(id: string) {
		try {
			const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
			if (res.ok) {
				projects = projects.filter((p) => p.id !== id);
			}
		} catch (error) {
			console.error('Failed to delete project:', error);
		}
	}

	function handleLoadProject(project: Project) {
		mapStore.syncFeaturesFromString(project.data);
		uiStore.activeTab = 'json'; // Switch to see the data
	}

	onMount(fetchProjects);
</script>

<div class="animate-fade-in flex h-full flex-col">
	<div class="border-border/40 flex items-center justify-between border-b p-4">
		<div class="flex items-center gap-2">
			<FolderOpen class="text-primary h-4 w-4" />
			<h3 class="text-xs font-bold tracking-wider uppercase">Projects</h3>
		</div>
		<Button
			variant="ghost"
			size="xs"
			onclick={() => (showSaveForm = !showSaveForm)}
			class={showSaveForm ? 'text-primary' : ''}
		>
			<Plus class="h-3.5 w-3.5" />
		</Button>
	</div>

	<div class="scrollbar-thin flex-1 overflow-y-auto p-4">
		{#if showSaveForm}
			<div
				class="border-primary/20 bg-primary/5 animate-in slide-in-from-top-2 mb-6 space-y-3 rounded-xl border p-3 duration-300"
			>
				<p class="text-primary/70 text-[10px] font-bold uppercase">Save Current Map</p>
				<Input
					bind:value={newProjectName}
					placeholder="Project name..."
					class="bg-background h-8 text-xs"
					onkeydown={(e) => e.key === 'Enter' && handleSaveProject()}
				/>
				<div class="flex gap-2">
					<Button
						variant="default"
						size="sm"
						class="h-8 flex-1 text-[10px]"
						onclick={handleSaveProject}
						disabled={isSaving || !newProjectName.trim()}
					>
						{#if isSaving}
							<Loader2 class="mr-1.5 h-3 w-3 animate-spin" />
						{:else}
							<Save class="mr-1.5 h-3 w-3" />
						{/if}
						Save Project
					</Button>
					<Button
						variant="ghost"
						size="sm"
						class="h-8 text-[10px]"
						onclick={() => (showSaveForm = false)}
					>
						Cancel
					</Button>
				</div>
			</div>
		{/if}

		{#if isLoading}
			<div class="flex h-32 items-center justify-center">
				<Loader2 class="text-muted-foreground/40 h-6 w-6 animate-spin" />
			</div>
		{:else if projects.length === 0}
			<div class="flex h-48 flex-col items-center justify-center px-4 text-center">
				<MapIcon class="text-muted-foreground/20 mb-3 h-10 w-10" />
				<p class="text-muted-foreground text-xs font-semibold">No projects yet</p>
				<p class="text-muted-foreground/60 mt-1 text-[10px]">
					Start drawing on the map and save your work here.
				</p>
			</div>
		{:else}
			<div class="space-y-3">
				{#each projects as project (project.id)}
					<div
						class="group bg-muted/20 hover:border-primary/30 hover:bg-muted/30 relative overflow-hidden rounded-xl border p-3 transition-all"
					>
						<div class="flex flex-col gap-1.5">
							<div class="flex items-center justify-between">
								<p class="text-foreground truncate pr-8 text-xs font-bold">{project.name}</p>
								<div
									class="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100"
								>
									<Button
										variant="ghost"
										size="xs"
										class="text-destructive hover:bg-destructive/10 h-6 w-6"
										onclick={() => handleDeleteProject(project.id)}
									>
										<Trash2 class="h-3 w-3" />
									</Button>
								</div>
							</div>
							<div class="flex items-center gap-3">
								<div class="text-muted-foreground flex items-center text-[9px]">
									<Calendar class="mr-1 h-2.5 w-2.5" />
									{new Date(project.updatedAt).toLocaleDateString()}
								</div>
								<div class="bg-muted-foreground/30 h-1 w-1 rounded-full"></div>
								<div class="text-muted-foreground text-[9px]">
									{JSON.parse(project.data).features?.length || 0} features
								</div>
							</div>
							<Button
								variant="outline"
								size="sm"
								class="mt-1 h-7 w-full text-[10px]"
								onclick={() => handleLoadProject(project)}
							>
								Load to Map
							</Button>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
