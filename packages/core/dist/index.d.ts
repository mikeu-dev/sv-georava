import * as ol_extent from 'ol/extent';
import Map from 'ol/Map.js';
import { Coordinate } from 'ol/coordinate';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import { Feature } from 'ol';
import Geometry from 'ol/geom/Geometry.js';
import TileLayer from 'ol/layer/Tile.js';
import OSM from 'ol/source/OSM.js';
import XYZ from 'ol/source/XYZ.js';
import Layer from 'ol/layer/Layer.js';
import { DragAndDrop, Draw, Modify, Select } from 'ol/interaction.js';
import { Options as Options$1 } from 'ol/interaction/Draw.js';
import { Options as Options$3 } from 'ol/interaction/Select.js';
import { Options as Options$2 } from 'ol/interaction/Modify.js';
import { Options } from 'ol/interaction/DragAndDrop.js';

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
    isXYZ?: boolean;
    attributions?: string;
    maxZoom?: number;
}
declare function addLayer(map: Map, config: LayerConfig): VectorLayer<VectorSource<Feature<Geometry, {
    [x: string]: any;
}>>, Feature<Geometry, {
    [x: string]: any;
}>> | null;
declare function removeLayer(map: Map, id: string): void;
declare function setBasemap(layer: TileLayer<OSM | XYZ>, config: Partial<LayerConfig>): void;
declare function setLayerOpacity(layer: Layer, opacity: number): void;
declare function setLayerVisibility(layer: Layer, visible: boolean): void;

type MapEventType = 'click' | 'moveend' | 'pointermove';
declare function onMapEvent(map: Map, event: MapEventType, handler: (e: any) => void): void;

declare function addSelectInteraction(map: Map, options?: Options$3): Select;
declare function addModifyInteraction(map: Map, options: Options$2): Modify;
declare function addDrawInteraction(map: Map, options: Options$1): Draw;
declare function addDragAndDropInteraction(map: Map, options: Options): DragAndDrop;

export { type LayerConfig, type MapEventType, type MapOptions, addDragAndDropInteraction, addDrawInteraction, addLayer, addModifyInteraction, addSelectInteraction, createMap, getMapState, onMapEvent, removeLayer, setBasemap, setLayerOpacity, setLayerVisibility };
