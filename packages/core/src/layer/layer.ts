import type Map from 'ol/Map.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import type { Feature } from 'ol';
import type Geometry from 'ol/geom/Geometry.js';

import TileLayer from 'ol/layer/Tile.js';
import OSM from 'ol/source/OSM.js';
import XYZ from 'ol/source/XYZ.js';
import type Layer from 'ol/layer/Layer.js';

export interface LayerConfig {
  id: string;
  type: 'geojson' | 'tile';
  data?: any; // For geojson
  url?: string; // For tile or remote geojson
  isXYZ?: boolean;
  attributions?: string;
  maxZoom?: number;
}

export function addLayer(map: Map, config: LayerConfig) {
  if (config.type === 'geojson') {
    const source = new VectorSource({
      features: config.data ? new GeoJSON().readFeatures(config.data, {
        featureProjection: map.getView().getProjection(),
      }) : [],
    });

    const layer = new VectorLayer({
      source: source,
    });
    
    // @ts-ignore - custom property for identification
    layer.set('id', config.id);
    
    map.addLayer(layer);
    return layer;
  }
  
  return null;
}

export function removeLayer(map: Map, id: string) {
  const layers = map.getLayers().getArray();
  const layerToRemove = layers.find(layer => layer.get('id') === id);
  if (layerToRemove) {
    map.removeLayer(layerToRemove);
  }
}

export function setBasemap(layer: TileLayer<OSM | XYZ>, config: Partial<LayerConfig>) {
  const source = config.isXYZ && config.url
    ? new XYZ({ url: config.url, attributions: config.attributions, maxZoom: config.maxZoom })
    : new OSM();
  layer.setSource(source);
}

export function setLayerOpacity(layer: Layer, opacity: number) {
  layer.setOpacity(opacity);
}

export function setLayerVisibility(layer: Layer, visible: boolean) {
  layer.setVisible(visible);
}
