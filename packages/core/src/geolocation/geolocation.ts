import type Map from 'ol/Map.js';
import Geolocation from 'ol/Geolocation.js';
import Feature from 'ol/Feature.js';
import Point from 'ol/geom/Point.js';
import { Vector as VectorSource } from 'ol/source.js';
import { Vector as VectorLayer } from 'ol/layer.js';
import { Style, Circle as CircleStyle, Fill, Stroke } from 'ol/style.js';

export interface GeolocationOptions {
  onPositionChange?: (position: number[]) => void;
  onAccuracyChange?: (geometry: any) => void;
  zoomToPosition?: boolean;
  style?: Style;
}

export function createGeolocation(map: Map, options: GeolocationOptions = {}) {
  const geolocation = new Geolocation({
    trackingOptions: {
      enableHighAccuracy: true
    },
    projection: map.getView().getProjection()
  });

  const positionFeature = new Feature();
  const accuracyFeature = new Feature();

  const vectorSource = new VectorSource({
    features: [accuracyFeature, positionFeature]
  });

  const vectorLayer = new VectorLayer({
    source: vectorSource,
    style: options.style || new Style({
      image: new CircleStyle({
        radius: 6,
        fill: new Fill({ color: '#3399CC' }),
        stroke: new Stroke({ color: '#fff', width: 2 })
      })
    }),
    zIndex: 999
  });

  map.addLayer(vectorLayer);

  geolocation.on('change:accuracyGeometry', () => {
    const accuracy = geolocation.getAccuracyGeometry();
    accuracyFeature.setGeometry(accuracy || undefined);
    if (options.onAccuracyChange) options.onAccuracyChange(accuracy);
  });

  geolocation.on('change:position', () => {
    const coordinates = geolocation.getPosition();
    if (!coordinates) return;
    
    positionFeature.setGeometry(new Point(coordinates));
    
    if (options.onPositionChange) options.onPositionChange(coordinates);
    
    if (options.zoomToPosition) {
      map.getView().animate({
        center: coordinates,
        zoom: 16,
        duration: 1000
      });
    }
  });

  return {
    geolocation,
    layer: vectorLayer,
    setTracking: (tracking: boolean) => geolocation.setTracking(tracking),
    dispose: () => {
      map.removeLayer(vectorLayer);
      geolocation.setTracking(false);
    }
  };
}
