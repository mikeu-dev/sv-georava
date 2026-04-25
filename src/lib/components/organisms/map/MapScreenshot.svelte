<script lang="ts">
	import { onMount } from 'svelte';
	import { Camera } from 'lucide-svelte';
	import type Map from 'ol/Map.js';
	import Control from 'ol/control/Control';
	import Button from '$lib/components/atoms/Button.svelte';
	import Tooltip from '$lib/components/atoms/Tooltip.svelte';

	let { map } = $props<{ map: Map | undefined }>();

	let element = $state<HTMLElement>();

	onMount(() => {
		if (map && element) {
			const screenshotControl = new Control({
				element: element
			});
			map.addControl(screenshotControl);
			return () => map.removeControl(screenshotControl);
		}
	});

	function handleScreenshot() {
		if (!map) return;

		map.once('rendercomplete', () => {
			const mapCanvas = document.createElement('canvas');
			const size = map.getSize();
			if (!size) return;

			mapCanvas.width = size[0];
			mapCanvas.height = size[1];
			const mapContext = mapCanvas.getContext('2d');
			if (!mapContext) return;

			// Composite all canvas layers
			const canvases = map
				.getViewport()
				.querySelectorAll('.ol-layer canvas, canvas.ol-unselectable');
			canvases.forEach((canvas: Element) => {
				const htmlCanvas = canvas as HTMLCanvasElement;
				if (htmlCanvas.width > 0) {
					const opacity = (htmlCanvas.parentNode as HTMLElement)?.style?.opacity || '1';
					mapContext.globalAlpha = parseFloat(opacity);

					const transform = htmlCanvas.style.transform;
					const matrix = transform
						.match(/^matrix\(([^(]*)\)$/)?.[1]
						?.split(',')
						.map(Number);

					if (matrix) {
						mapContext.setTransform(
							matrix[0],
							matrix[1],
							matrix[2],
							matrix[3],
							matrix[4],
							matrix[5]
						);
					} else {
						mapContext.setTransform(1, 0, 0, 1, 0, 0);
					}

					mapContext.drawImage(htmlCanvas, 0, 0);
				}
			});

			mapContext.globalAlpha = 1;
			mapContext.setTransform(1, 0, 0, 1, 0, 0);

			// Add watermark
			mapContext.fillStyle = 'rgba(255, 255, 255, 0.7)';
			mapContext.fillRect(size[0] - 140, size[1] - 28, 140, 28);
			mapContext.font = '11px Inter, sans-serif';
			mapContext.fillStyle = '#333';
			mapContext.textAlign = 'right';
			mapContext.fillText('Made with Georava', size[0] - 8, size[1] - 10);

			// Download
			const link = document.createElement('a');
			link.download = `georava-map-${new Date().toISOString().slice(0, 10)}.png`;
			link.href = mapCanvas.toDataURL('image/png');
			link.click();
		});

		map.renderSync();
	}
</script>

<div bind:this={element} class="ol-screenshot ol-unselectable ol-control">
	<Tooltip content="Export as Image" side="left">
		<Button
			tag="span"
			variant="secondary"
			size="icon"
			class="premium-control h-9 w-9"
			onclick={handleScreenshot}
		>
			<Camera class="text-primary h-4 w-4" />
		</Button>
	</Tooltip>
</div>


