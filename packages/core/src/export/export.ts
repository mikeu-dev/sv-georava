import GeoJSON from 'ol/format/GeoJSON.js';
import KML from 'ol/format/KML.js';
import JSZip from 'jszip';
import type { Feature } from 'ol';
import type { Geometry } from 'ol/geom';
import type { FeatureCollection } from 'geojson';
import { SpatialService } from '../spatial/spatial.js';
import type { ExportFormat, ExportResult } from '../types.js';

const geojsonFormat = new GeoJSON({
  featureProjection: 'EPSG:3857',
  dataProjection: 'EPSG:4326'
});

const kmlFormat = new KML({
  extractStyles: true,
  showPointNames: true
});

/**
 * Formats geospatial data into the specified format as a Blob.
 */
export async function formatExportData(
  geojsonString: string,
  format: ExportFormat
): Promise<{ blob: Blob; filename: string }> {
  if (format === 'topojson') {
    const geojson = JSON.parse(geojsonString) as FeatureCollection;
    const topo = SpatialService.toTopoJSON(geojson);
    return {
      blob: new Blob([JSON.stringify(topo)], { type: 'application/json' }),
      filename: 'map.topojson'
    };
  }

  const olFeatures = geojsonFormat.readFeatures(geojsonString) as Feature<Geometry>[];
  let data: string | Blob = '';
  let filename = '';
  let mimeType = '';

  switch (format) {
    case 'geojson':
      data = geojsonString;
      filename = 'map.geojson';
      mimeType = 'application/vnd.geo+json';
      break;
    case 'kml':
      data = kmlFormat.writeFeatures(olFeatures);
      filename = 'map.kml';
      mimeType = 'application/vnd.google-earth.kml+xml';
      break;
    case 'kmz': {
      const kmlData = kmlFormat.writeFeatures(olFeatures, {
        featureProjection: 'EPSG:4326',
        dataProjection: 'EPSG:4326'
      });
      const zip = new JSZip();
      zip.file('doc.kml', kmlData);
      data = await zip.generateAsync({ type: 'blob' });
      filename = 'map.kmz';
      mimeType = 'application/vnd.google-earth.kmz';
      break;
    }
  }

  return {
    blob: new Blob([data], { type: mimeType }),
    filename
  };
}
