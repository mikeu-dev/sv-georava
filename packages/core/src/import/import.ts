import GeoJSON from 'ol/format/GeoJSON.js';
import KML from 'ol/format/KML.js';
import type { Feature } from 'ol';
import type { Geometry } from 'ol/geom';
import { SpatialService } from '../spatial/spatial.js';

const kmlFormat = new KML({
  extractStyles: true,
  showPointNames: true
});

/**
 * Transforms imported data into a standard GeoJSON string.
 */
export async function transformImportedData(
  content: string, 
  filename: string,
  options?: {
    parseTopoJSON?: (topology: unknown) => string;
  }
): Promise<string> {
  const lower = filename.toLowerCase();
  const isKml = lower.endsWith('.kml');
  const isTopo = lower.endsWith('.topojson');

  if (isKml) {
    const kmlFeatures = kmlFormat.readFeatures(content, {
      featureProjection: 'EPSG:3857'
    });
    const gjFormat = new GeoJSON({
      featureProjection: 'EPSG:3857',
      dataProjection: 'EPSG:4326'
    });
    return gjFormat.writeFeatures(kmlFeatures as Feature<Geometry>[]);
  }

  if (isTopo) {
    const topology: unknown = JSON.parse(content);
    const fc = SpatialService.fromTopoJSON(topology);
    return JSON.stringify(fc, null, 2);
  }

  return content;
}
