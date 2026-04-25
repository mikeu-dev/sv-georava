import Map from 'ol/Map.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import OSM from 'ol/source/OSM.js';
import { fromLonLat, toLonLat } from 'ol/proj.js';
import type { Coordinate } from 'ol/coordinate';

export interface MapOptions {
  target: HTMLElement | string;
  center?: [number, number];
  zoom?: number;
}

export function createMap(options: MapOptions): Map {
  const center = options.center ? fromLonLat(options.center) : fromLonLat([0, 0]);
  
  const map = new Map({
    target: options.target,
    layers: [
      new TileLayer({
        source: new OSM(),
      }),
    ],
    view: new View({
      center: center,
      zoom: options.zoom ?? 2,
    }),
  });

  return map;
}

export function getMapState(map: Map) {
  const view = map.getView();
  const center = view.getCenter();
  const zoom = view.getZoom();
  const extent = view.calculateExtent(map.getSize());

  return {
    center: center ? toLonLat(center) : [0, 0],
    zoom: zoom ?? 0,
    bounds: extent,
  };
}
