import * as turf from '@turf/turf';
import type { Feature, FeatureCollection, Geometry, Polygon, MultiPolygon, Point } from 'geojson';
import * as topojsonClient from 'topojson-client';
import * as topojsonServer from 'topojson-server';
import type { Topology } from 'topojson-specification';
import type { BufferUnit } from '../types.js';

/**
 * SpatialService: Centralized service for geometric computations.
 */
export const SpatialService = {
  createBuffer(
    feature: Feature<Geometry>,
    radius: number,
    units: BufferUnit = 'kilometers'
  ): Feature<Polygon | MultiPolygon> {
    // @ts-ignore
    return turf.buffer(feature, radius, { units });
  },

  calculateCentroid(data: Feature<Geometry> | FeatureCollection<Geometry>): Feature<Point> {
    return turf.centroid(data);
  },

  calculateArea(feature: Feature<Geometry>): number {
    return turf.area(feature);
  },

  calculateLength(feature: Feature<Geometry>): number {
    return turf.length(feature, { units: 'meters' });
  },

  checkIntersection(feat1: Feature<Geometry>, feat2: Feature<Geometry>): boolean {
    // @ts-ignore
    const intersect = turf.intersect(turf.featureCollection([feat1, feat2]));
    return !!intersect;
  },

  toTopoJSON(geojson: FeatureCollection): Topology {
    return topojsonServer.topology({ data: geojson }) as unknown as Topology;
  },

  fromTopoJSON(topology: unknown): FeatureCollection {
    if (
      !topology ||
      typeof topology !== 'object' ||
      !('objects' in topology) ||
      (topology as { objects?: unknown }).objects == null
    ) {
      throw new Error('Invalid TopoJSON: missing objects');
    }

    const top = topology as Topology;
    const { objects } = top;
    const keys = Object.keys(objects);
    if (keys.length === 0) {
      throw new Error('Invalid TopoJSON: empty objects');
    }

    const features: Feature<Geometry>[] = [];
    for (const key of keys) {
      const obj = objects[key];
      if (obj == null) continue;
      // @ts-ignore
      const gj = topojsonClient.feature(top, obj) as unknown as FeatureCollection | Feature;
      if (gj.type === 'FeatureCollection') {
        features.push(...(gj.features as Feature<Geometry>[]));
      } else {
        features.push(gj as Feature<Geometry>);
      }
    }
    return { type: 'FeatureCollection', features };
  },

  simplifyGeometry(
    feature: Feature<Geometry>,
    tolerance: number = 0.01,
    highQuality: boolean = false
  ): Feature<Geometry> {
    return turf.simplify(feature, { tolerance, highQuality });
  },

  unionFeatures(features: Feature<Geometry>[]): Feature<Polygon | MultiPolygon> | null {
    if (features.length < 2) return null;
    const collection = turf.featureCollection(features);
    // @ts-ignore
    return turf.union(collection);
  }
} as const;
