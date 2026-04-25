import { describe, it, expect } from 'vitest';
import { SpatialService } from './spatial';

describe('SpatialService', () => {
  const point: any = {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [106.8272, -6.1751]
    },
    properties: {}
  };

  it('should create a buffer correctly', () => {
    const buffered = SpatialService.createBuffer(point, 100, 'meters');
    expect(buffered.geometry.type).toBe('Polygon');
  });

  it('should calculate area of a polygon', () => {
    const polygon: any = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [0, 0],
            [0, 1],
            [1, 1],
            [1, 0],
            [0, 0]
          ]
        ]
      }
    };
    const area = SpatialService.calculateArea(polygon);
    expect(area).toBeGreaterThan(0);
  });

  it('should find centroid of a feature', () => {
    const centroid = SpatialService.calculateCentroid(point);
    expect(centroid.geometry.type).toBe('Point');
    expect(centroid.geometry.coordinates).toEqual([106.8272, -6.1751]);
  });
});
