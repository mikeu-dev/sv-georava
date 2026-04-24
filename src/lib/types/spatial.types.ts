/**
 * Spatial analysis domain types.
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
