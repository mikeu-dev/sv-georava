# @geovara/core

The core GIS engine for Geovara applications. This package is framework-agnostic and provides a high-level abstraction over OpenLayers and Turf.js.

## Features

- **Map Engine**: Single-function map initialization and state management.
- **Layer Management**: Simplified API for adding/removing layers and controlling visibility/opacity.
- **Interactions**: Pre-configured interaction wrappers (Select, Draw, Modify, Drag & Drop).
- **Spatial Analysis**: Geometric operations (Buffer, Centroid, Intersect) powered by Turf.js.
- **Data Transformation**: Support for GeoJSON, KML, KMZ, and TopoJSON formats.
- **Advanced Tools**: Built-in helpers for Geolocation and Measurements.

## Installation

```bash
pnpm add @geovara/core
```

*Note: `ol` is a peer dependency and must be installed in the host application.*

## Usage Example

```typescript
import { createMap, addLayer, SpatialService } from '@geovara/core';

// Initialize map
const map = createMap({
  target: 'map-container',
  center: [106.8272, -6.1751], // Jakarta
  zoom: 12
});

// Add a GeoJSON layer
addLayer(map, {
  id: 'my-layer',
  type: 'geojson',
  data: myGeoJSONData
});

// Perform spatial analysis
const buffered = SpatialService.createBuffer(myFeature, 500, 'meters');
```

## Modular Structure

- `/map`: Core map initialization.
- `/layer`: Layer and basemap management.
- `/interaction`: OL interaction wrappers.
- `/events`: Map event bus.
- `/spatial`: Turf.js-based geometric operations.
- `/format`: Custom formatters (e.g., TopoJSON).
- `/export`: Multi-format data export.
- `/import`: Data import transformation.
- `/geolocation`: Geolocation tracking utilities.
- `/measurement`: Distance and area measurement tools.
