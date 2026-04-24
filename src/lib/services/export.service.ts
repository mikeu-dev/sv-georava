/**
 * File export service for geospatial data formats.
 */

import GeoJSON from 'ol/format/GeoJSON.js';
import KML from 'ol/format/KML.js';
import JSZip from 'jszip';
import type { Feature } from 'ol';
import type { Geometry } from 'ol/geom';
import { GisService } from './spatial.service';
import type { FeatureCollection } from 'geojson';
import type { ExportFormat } from '$lib/types/geojson.types';

const geojsonFormat = new GeoJSON({
	featureProjection: 'EPSG:3857',
	dataProjection: 'EPSG:4326'
});

const kmlFormat = new KML({
	extractStyles: true,
	showPointNames: true
});

interface ExportResult {
	readonly blob: Blob;
	readonly filename: string;
}

/**
 * Triggers a browser download for the given blob.
 */
function triggerDownload(blob: Blob, filename: string): void {
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

/**
 * Exports geospatial data in the specified format.
 */
export async function exportData(
	geojsonString: string,
	format: ExportFormat
): Promise<ExportResult> {
	if (format === 'topojson') {
		const geojson = JSON.parse(geojsonString) as FeatureCollection;
		const topo = GisService.toTopoJSON(geojson);
		const blob = new Blob([JSON.stringify(topo)], { type: 'application/json' });
		const filename = 'map.topojson';
		triggerDownload(blob, filename);
		return { blob, filename };
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

	const blob = new Blob([data], { type: mimeType });
	triggerDownload(blob, filename);
	return { blob, filename };
}

/**
 * Exports the map canvas as a PNG image.
 */
export function exportMapScreenshot(mapElement: HTMLElement, size: [number, number]): void {
	const mapCanvas = document.createElement('canvas');
	mapCanvas.width = size[0];
	mapCanvas.height = size[1];
	const mapContext = mapCanvas.getContext('2d');
	if (!mapContext) return;

	const canvases = mapElement.querySelectorAll('.ol-layer canvas, canvas.ol-unselectable');
	canvases.forEach((canvas) => {
		const htmlCanvas = canvas as HTMLCanvasElement;
		if (htmlCanvas.width > 0) {
			const opacity = (htmlCanvas.parentNode as HTMLElement)?.style?.opacity || '1';
			mapContext.globalAlpha = parseFloat(opacity);

			const transform = htmlCanvas.style.transform;
			const matrix = transform
				.match(/^matrix\(([^(]*)\)$/)?.[1]
				?.split(',')
				.map(Number);

			if (matrix) {
				mapContext.setTransform(matrix[0], matrix[1], matrix[2], matrix[3], matrix[4], matrix[5]);
			} else {
				mapContext.setTransform(1, 0, 0, 1, 0, 0);
			}

			mapContext.drawImage(htmlCanvas, 0, 0);
		}
	});

	mapContext.globalAlpha = 1;
	mapContext.setTransform(1, 0, 0, 1, 0, 0);

	// Watermark
	mapContext.fillStyle = 'rgba(255, 255, 255, 0.7)';
	mapContext.fillRect(size[0] - 140, size[1] - 28, 140, 28);
	mapContext.font = '11px Inter, sans-serif';
	mapContext.fillStyle = '#333';
	mapContext.textAlign = 'right';
	mapContext.fillText('Made with Georava', size[0] - 8, size[1] - 10);

	const link = document.createElement('a');
	link.download = `georava-map-${new Date().toISOString().slice(0, 10)}.png`;
	link.href = mapCanvas.toDataURL('image/png');
	link.click();
}
