// src/map/map.ts
import Map from "ol/Map.js";
import View from "ol/View.js";
import TileLayer from "ol/layer/Tile.js";
import OSM from "ol/source/OSM.js";
import { fromLonLat, toLonLat } from "ol/proj.js";
function createMap(options) {
  const center = options.center ? fromLonLat(options.center) : fromLonLat([0, 0]);
  const map = new Map({
    target: options.target,
    layers: [
      new TileLayer({
        source: new OSM()
      })
    ],
    view: new View({
      center,
      zoom: options.zoom ?? 2
    })
  });
  return map;
}
function getMapState(map) {
  const view = map.getView();
  const center = view.getCenter();
  const zoom = view.getZoom();
  const extent = view.calculateExtent(map.getSize());
  return {
    center: center ? toLonLat(center) : [0, 0],
    zoom: zoom ?? 0,
    bounds: extent
  };
}

// src/layer/layer.ts
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import GeoJSON from "ol/format/GeoJSON.js";
function addLayer(map, config) {
  if (config.type === "geojson") {
    const source = new VectorSource({
      features: config.data ? new GeoJSON().readFeatures(config.data, {
        featureProjection: map.getView().getProjection()
      }) : []
    });
    const layer = new VectorLayer({
      source
    });
    layer.set("id", config.id);
    map.addLayer(layer);
    return layer;
  }
  return null;
}
function removeLayer(map, id) {
  const layers = map.getLayers().getArray();
  const layerToRemove = layers.find((layer) => layer.get("id") === id);
  if (layerToRemove) {
    map.removeLayer(layerToRemove);
  }
}

// src/events/events.ts
function onMapEvent(map, event, handler) {
  map.on(event, (e) => {
    const wrappedEvent = {
      originalEvent: e,
      coordinate: e.coordinate,
      pixel: e.pixel,
      type: e.type
    };
    handler(wrappedEvent);
  });
}
export {
  addLayer,
  createMap,
  getMapState,
  onMapEvent,
  removeLayer
};
//# sourceMappingURL=index.js.map