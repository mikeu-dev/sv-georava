import type Map from 'ol/Map.js';
import type { MapBrowserEvent } from 'ol';

export type MapEventType = 'click' | 'moveend' | 'pointermove';

export function onMapEvent(map: Map, event: MapEventType, handler: (e: any) => void) {
  map.on(event as any, (e: MapBrowserEvent<any>) => {
    // Basic wrapper for event data
    const wrappedEvent = {
      originalEvent: e,
      coordinate: e.coordinate,
      pixel: e.pixel,
      type: e.type,
    };
    handler(wrappedEvent);
  });
}
