import type Map from 'ol/Map.js';
import type { MapBrowserEvent } from 'ol';
import Overlay from 'ol/Overlay.js';
import { Draw } from 'ol/interaction.js';
import type { DrawEvent } from 'ol/interaction/Draw.js';
import { Vector as VectorSource } from 'ol/source.js';
import { Vector as VectorLayer } from 'ol/layer.js';
import { LineString, Polygon } from 'ol/geom.js';
import { getArea, getLength } from 'ol/sphere.js';
import { unByKey } from 'ol/Observable.js';
import type { EventsKey } from 'ol/events.js';
import { Style, Fill, Stroke, Circle as CircleStyle } from 'ol/style.js';
import type { Coordinate } from 'ol/coordinate.js';

export interface MeasurementOptions {
  type: 'LineString' | 'Polygon';
  onDrawStart?: () => void;
  onDrawEnd?: (feature: any) => void;
}

export function createMeasurement(map: Map, options: MeasurementOptions) {
  const vectorSource = new VectorSource();
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

  let draw: Draw | null = null;
  let helpTooltipElement: HTMLDivElement | null = null;
  let helpTooltip: Overlay | null = null;
  let measureTooltipElement: HTMLDivElement | null = null;
  let measureTooltip: Overlay | null = null;
  let listener: EventsKey;

  function createHelpTooltip() {
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

  const pointerMoveHandler = (evt: MapBrowserEvent<any>) => {
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

  const mouseOutHandler = () => {
    helpTooltipElement?.classList.add('hidden');
  };

  createHelpTooltip();
  createMeasureTooltip();

  draw = new Draw({
    source: vectorSource,
    type: options.type,
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

  draw.on('drawstart', (evt: DrawEvent) => {
    const sketch = evt.feature;
    const geometry = sketch.getGeometry();
    // @ts-ignore
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
    if (options.onDrawStart) options.onDrawStart();
  });

  draw.on('drawend', (evt) => {
    if (measureTooltipElement) {
      measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
    }
    measureTooltip?.setOffset([0, -7]);
    measureTooltipElement = null;
    createMeasureTooltip();
    unByKey(listener);
    if (options.onDrawEnd) options.onDrawEnd(evt.feature);
  });

  map.on('pointermove', pointerMoveHandler);
  map.getViewport().addEventListener('mouseout', mouseOutHandler);

  return {
    dispose: () => {
      if (draw) map.removeInteraction(draw);
      if (helpTooltip) map.removeOverlay(helpTooltip);
      if (measureTooltip) map.removeOverlay(measureTooltip);
      map.removeLayer(vectorLayer);
      map.un('pointermove', pointerMoveHandler);
      map.getViewport().removeEventListener('mouseout', mouseOutHandler);
    }
  };
}

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
