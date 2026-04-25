/**
 * Core domain types for Geovara.
 */

export type BufferUnit = 'meters' | 'kilometers' | 'miles' | 'degrees';

export interface BufferOptions {
  readonly radius: number;
  readonly units: BufferUnit;
}

export interface AnalysisResult {
  readonly label: string;
  readonly value: string;
}

export interface NominatimHit {
  readonly place_id?: number;
  readonly display_name?: string;
  readonly lat?: string;
  readonly lon?: string;
  readonly type?: string;
  readonly boundingbox?: string[];
}

export type ExportFormat = 'geojson' | 'kml' | 'kmz' | 'topojson';

export interface ExportResult {
  readonly blob: Blob;
  readonly filename: string;
}

export interface ParsedFileResult {
  readonly content: string;
  readonly filename: string;
  readonly format: 'geojson' | 'kml' | 'topojson';
}
