import * as ol_extent from 'ol/extent';
import Map from 'ol/Map.js';
import { Coordinate } from 'ol/coordinate';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import { Feature } from 'ol';
import Geometry from 'ol/geom/Geometry.js';

interface MapOptions {
    target: HTMLElement | string;
    center?: [number, number];
    zoom?: number;
}
declare function createMap(options: MapOptions): Map;
declare function getMapState(map: Map): {
    center: Coordinate;
    zoom: number;
    bounds: ol_extent.Extent;
};

interface LayerConfig {
    id: string;
    type: 'geojson' | 'tile';
    data?: any;
    url?: string;
}
declare function addLayer(map: Map, config: LayerConfig): VectorLayer<VectorSource<Feature<Geometry, {
    [x: string]: any;
}>>, Feature<Geometry, {
    [x: string]: any;
}>> | null;
declare function removeLayer(map: Map, id: string): void;

type MapEventType = 'click' | 'moveend' | 'pointermove';
declare function onMapEvent(map: Map, event: MapEventType, handler: (e: any) => void): void;

export { type LayerConfig, type MapEventType, type MapOptions, addLayer, createMap, getMapState, onMapEvent, removeLayer };
