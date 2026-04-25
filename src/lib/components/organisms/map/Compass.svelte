<script lang="ts">
	import { onMount } from 'svelte';
	import { Compass as CompassIcon } from 'lucide-svelte';
	import type Map from 'ol/Map.js';
	import Control from 'ol/control/Control';
	import Button from '$lib/components/atoms/Button.svelte';
	import Tooltip from '$lib/components/atoms/Tooltip.svelte';

	let { map } = $props<{ map: Map | undefined }>();

	let element = $state<HTMLElement>();
	let rotation = $state(0);

	onMount(() => {
		if (map && element) {
			const compassControl = new Control({
				element: element
			});
			map.addControl(compassControl);

			const updateRotation = () => {
				rotation = map.getView().getRotation();
			};

			map.on('postrender', updateRotation);

			return () => {
				map.removeControl(compassControl);
				map.un('postrender', updateRotation);
			};
		}
	});

	function handleResetRotation() {
		if (!map) return;
		map.getView().animate({
			rotation: 0,
			duration: 250
		});
	}
</script>

<div bind:this={element} class="ol-compass ol-unselectable ol-control">
	<Tooltip content="Reset North (Rotate with Alt+Shift+Drag)" side="right">
		<Button
			variant="secondary"
			size="icon"
			class="premium-control group relative h-9 w-9 rounded-full transition-all duration-300"
			onclick={handleResetRotation}
			style="transform: rotate({rotation}rad)"
		>
			<CompassIcon class="text-primary h-5 w-5 transition-transform group-hover:scale-110" />
			<div
				class="bg-destructive absolute -top-1 left-1/2 h-2.5 w-1 -translate-x-1/2 rounded-full border border-white"
			></div>
		</Button>
	</Tooltip>
</div>


