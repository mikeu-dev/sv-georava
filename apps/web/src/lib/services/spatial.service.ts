import { SpatialService as CoreSpatialService } from '@geovara/core';

/**
 * GisService: Centralized service for geometric computations.
 * Now acts as a proxy to @geovara/core SpatialService.
 */
export const GisService = CoreSpatialService;
