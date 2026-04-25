<script lang="ts">
	import MapWorkspace from '$lib/components/templates/MapWorkspace.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Georava | Professional Geospatial Toolkit</title>
	<meta name="description" content="Advanced GIS mapping and analysis tool built with SvelteKit and OpenLayers." />
</svelte:head>

<MapWorkspace user={data.user ?? null} />
