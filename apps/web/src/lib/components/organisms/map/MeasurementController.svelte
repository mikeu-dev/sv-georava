<script lang="ts">
	import { Map, MapBrowserEvent, Overlay } from 'ol';
	import { Draw } from 'ol/interaction';
	import type { DrawEvent } from 'ol/interaction/Draw';
	import VectorSource from 'ol/source/Vector';
	import VectorLayer from 'ol/layer/Vector';
	import { LineString, Polygon } from 'ol/geom';
	import { getArea, getLength } from 'ol/sphere';
	import { unByKey } from 'ol/Observable';
	import type { EventsKey } from 'ol/events';
	import { Style, Fill, Stroke, Circle as CircleStyle } from 'ol/style';
	import type { Coordinate } from 'ol/coordinate';

	let { map, activeType } = $props<{
		map: Map | undefined;
		activeType: 'MeasureDistance' | 'MeasureArea' | null;
	}>();

	let draw: Draw | null = null;
	let helpTooltipElement: HTMLDivElement | null = null;
	let helpTooltip: Overlay | null = null;
	let measureTooltipElement: HTMLDivElement | null = null;
	let measureTooltip: Overlay | null = null;
	const vectorSource = new VectorSource();

	$effect(() => {
		if (!map) return;

		const vectorLayer = new VectorLayer({
			source: vectorSource,
			style: new Style({
				fill: new Fill({ color: 'rgba(255, 255, 255, 0.2)' }),
				stroke: new Stroke({ color: '#ffcc33', width: 2 }),
				image: new CircleStyle({ radius: 7, fill: new Fill({ color: '#ffcc33' }) })
			}),
			zIndex: 100
		});
		map.addLayer(vectorLayer);

		return () => {
			if (map) {
				map.removeLayer(vectorLayer);
				if (draw) map.removeInteraction(draw);
			}
		};
	});

	$effect(() => {
		if (!map || !activeType) {
			if (map && draw) {
				map.removeInteraction(draw);
				draw = null;
			}
			if (map && helpTooltip) {
				map.removeOverlay(helpTooltip);
				helpTooltip = null;
			}
			return;
		}

		const type = activeType === 'MeasureArea' ? 'Polygon' : 'LineString';
		draw = new Draw({
			source: vectorSource,
			type: type,
			style: new Style({
				fill: new Fill({ color: 'rgba(255, 255, 255, 0.2)' }),
				stroke: new Stroke({ color: 'rgba(0, 0, 0, 0.5)', lineDash: [10, 10], width: 2 }),
				image: new CircleStyle({
					radius: 5,
					stroke: new Stroke({ color: 'rgba(0, 0, 0, 0.7)' }),
					fill: new Fill({ color: 'rgba(255, 255, 255, 0.2)' })
				})
			})
		});
		map.addInteraction(draw);

		createMeasureTooltip();
		createHelpTooltip();

		let listener: EventsKey;
		draw.on('drawstart', (evt: DrawEvent) => {
			const sketch = evt.feature;
			const geometry = sketch.getGeometry();
			// @ts-expect-error - OpenLayers DrawEvent coordinate is present at runtime but not in types
			let tooltipCoord: Coordinate = evt.coordinate;

			if (geometry) {
				listener = geometry.on('change', (e) => {
					const geom = e.target;
					let output;
					if (geom instanceof Polygon) {
						output = formatArea(geom);
						tooltipCoord = geom.getInteriorPoint().getCoordinates();
					} else if (geom instanceof LineString) {
						output = formatLength(geom);
						tooltipCoord = geom.getLastCoordinate();
					}
					if (measureTooltipElement) {
						measureTooltipElement.innerHTML = output || '';
					}
					measureTooltip?.setPosition(tooltipCoord);
				});
			}
		});

		draw.on('drawend', () => {
			if (measureTooltipElement) {
				measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
			}
			measureTooltip?.setOffset([0, -7]);
			measureTooltipElement = null;
			createMeasureTooltip();
			unByKey(listener);
		});

		const pointerMoveHandler = (evt: MapBrowserEvent<PointerEvent>) => {
			if (evt.dragging) return;
			let helpMsg = 'Click to start measuring';
			if (draw) {
				helpMsg = 'Click to continue drawing';
			}
			if (helpTooltipElement) {
				helpTooltipElement.innerHTML = helpMsg;
			}
			helpTooltip?.setPosition(evt.coordinate);
			helpTooltipElement?.classList.remove('hidden');
		};

		map.on('pointermove', pointerMoveHandler);
		map.getViewport().addEventListener('mouseout', () => {
			helpTooltipElement?.classList.add('hidden');
		});

		return () => {
			if (map) {
				if (draw) map.removeInteraction(draw);
				if (helpTooltip) map.removeOverlay(helpTooltip);
				map.un('pointermove', pointerMoveHandler);
			}
		};

		function createHelpTooltip() {
			if (!map) return;
			if (helpTooltipElement) {
				helpTooltipElement.parentNode?.removeChild(helpTooltipElement);
			}
			helpTooltipElement = document.createElement('div');
			helpTooltipElement.className = 'ol-tooltip hidden';
			helpTooltip = new Overlay({
				element: helpTooltipElement,
				offset: [15, 0],
				positioning: 'center-left'
			});
			map.addOverlay(helpTooltip);
		}

		function createMeasureTooltip() {
			if (!map) return;
			if (measureTooltipElement) {
				measureTooltipElement.parentNode?.removeChild(measureTooltipElement);
			}
			measureTooltipElement = document.createElement('div');
			measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
			measureTooltip = new Overlay({
				element: measureTooltipElement,
				offset: [0, -15],
				positioning: 'bottom-center',
				stopEvent: false,
				insertFirst: false
			});
			map.addOverlay(measureTooltip);
		}
	});

	function formatLength(line: LineString) {
		const length = getLength(line);
		let output;
		if (length > 100) {
			output = Math.round((length / 1000) * 100) / 100 + ' ' + 'km';
		} else {
			output = Math.round(length * 100) / 100 + ' ' + 'm';
		}
		return output;
	}

	function formatArea(polygon: Polygon) {
		const area = getArea(polygon);
		let output;
		if (area > 10000) {
			output = Math.round((area / 1000000) * 100) / 100 + ' ' + 'km²';
		} else {
			output = Math.round(area * 100) / 100 + ' ' + 'm²';
		}
		return output;
	}
</script>

<style>
	:global(.ol-tooltip) {
		position: relative;
		background: rgba(0, 0, 0, 0.7);
		border-radius: 4px;
		color: white;
		padding: 4px 8px;
		opacity: 0.7;
		white-space: nowrap;
		font-size: 12px;
		cursor: default;
		user-select: none;
		pointer-events: none;
	}
	:global(.ol-tooltip-measure) {
		opacity: 1;
		font-weight: bold;
	}
	:global(.ol-tooltip-static) {
		background-color: #ffcc33;
		color: black;
		border: 1px solid white;
	}
	:global(.ol-tooltip-measure:before),
	:global(.ol-tooltip-static:before) {
		border-top: 6px solid rgba(0, 0, 0, 0.7);
		border-right: 6px solid transparent;
		border-left: 6px solid transparent;
		content: '';
		position: absolute;
		bottom: -6px;
		left: 50%;
		margin-left: -6px;
	}
	:global(.ol-tooltip-static:before) {
		border-top-color: #ffcc33;
	}
</style>
