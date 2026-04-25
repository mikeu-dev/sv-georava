/**
 * Pure formatting utility functions.
 */

export function formatArea(areaM2: number): string {
	if (areaM2 > 1_000_000) {
		return `${(areaM2 / 1_000_000).toFixed(2)} km²`;
	}
	return `${areaM2.toFixed(0)} m²`;
}

export function formatLength(lengthM: number): string {
	if (lengthM > 1000) {
		return `${(lengthM / 1000).toFixed(2)} km`;
	}
	return `${lengthM.toFixed(0)} m`;
}

export function formatCoordinate(value: number, decimals: number = 4): string {
	return value.toFixed(decimals);
}

export function formatPercentage(value: number): string {
	return `${Math.round(value * 100)}%`;
}
