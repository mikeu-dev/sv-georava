import { defaultGeocodingService, type NominatimHit } from '@geovara/core';

/**
 * Throttled search returning an array of location hits.
 */
export async function nominatimSearchResults(params: Record<string, string | number | undefined>): Promise<NominatimHit[]> {
	return defaultGeocodingService.search(params);
}
