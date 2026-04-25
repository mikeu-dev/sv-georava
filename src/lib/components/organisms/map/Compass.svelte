<script lang="ts">
	import { Compass as CompassIcon } from 'lucide-svelte';
	import type Map from 'ol/Map.js';
	import Button from '$lib/components/atoms/Button.svelte';
	import Tooltip from '$lib/components/atoms/Tooltip.svelte';

	let { map } = $props<{ map: Map | undefined }>();

	let rotation = $state(0);

	$effect(() => {
		if (!map) return;

		const updateRotation = () => {
			rotation = map.getView().getRotation();
		};

		map.on('postrender', updateRotation);
		return () => map.un('postrender', updateRotation);
	});

	function handleResetRotation() {
		if (!map) return;
		map.getView().animate({
			rotation: 0,
			duration: 250
		});
	}
</script>

<div class="z-10 flex flex-col gap-2 pointer-events-auto">
	<Tooltip content="Reset North (Rotate with Alt+Shift+Drag)" side="left">
		<Button
			variant="secondary"
			size="icon"
			class="group relative h-10 w-10 rounded-full border border-border/50 bg-background/80 shadow-lg backdrop-blur-md transition-all duration-300 hover:bg-background"
			onclick={handleResetRotation}
			style="transform: rotate({rotation}rad)"
		>
			<CompassIcon class="h-5 w-5 text-primary transition-transform group-hover:scale-110" />
			<div
				class="absolute -top-1 left-1/2 h-2 w-1 -translate-x-1/2 rounded-full bg-destructive"
			></div>
		</Button>
	</Tooltip>
</div>
