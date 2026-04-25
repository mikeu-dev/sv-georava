import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['ol', 'ol/Map', 'ol/View', 'ol/layer/Tile', 'ol/source/OSM', 'ol/proj'],
});
