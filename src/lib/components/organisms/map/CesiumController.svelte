<script lang="ts">
	import type { Map } from 'ol';

	interface Props {
		map: Map | undefined;
		enabled: boolean;
	}

	interface CesiumGlobal {
		createWorldTerrainAsync: () => Promise<unknown>;
		Cesium3DTileset: {
			fromUrl: (url: string, options: unknown) => Promise<unknown>;
		};
	}

	interface CesiumWin extends Window {
		Cesium?: CesiumGlobal;
		ol?: unknown;
		olcs?: {
			OLCesium: new (options: { map: Map }) => {
				getCesiumScene: () => {
					terrainProvider: unknown;
					primitives: {
						add: (tileset: unknown) => void;
					};
				};
				setEnabled: (enabled: boolean) => void;
			};
		};
	}

	let { map, enabled }: Props = $props();

	let ol3d: { setEnabled: (enabled: boolean) => void } | null = null;
	let isInitialized = false;

	async function loadScript(url: string) {
		return new Promise((resolve, reject) => {
			if (typeof document === 'undefined') return resolve(null);
			const script = document.createElement('script');
			script.src = url;
			script.async = true;
			script.onload = () => resolve(null);
			script.onerror = reject;
			document.head.appendChild(script);
		});
	}

	$effect(() => {
		if (!map || typeof window === 'undefined') return;

		const initCesium = async () => {
			const win = window as unknown as CesiumWin;
			
			if (isInitialized) return;

			try {
				// Ensure Cesium is loaded
				if (!win.Cesium) {
					await loadScript('https://cesium.com/downloads/cesiumjs/releases/1.113/Build/Cesium/Cesium.js');
				}

				// Ensure ol-cesium is loaded and ol is defined
				if (!win.olcs) {
					// Wait for MapCanvas to define window.ol
					let attempts = 0;
					while (!win.ol && attempts < 50) {
						await new Promise((r) => setTimeout(r, 100));
						attempts++;
					}
					await loadScript('https://cdn.jsdelivr.net/npm/ol-cesium@2.17.0/dist/olcesium.js');
				}

				const Cesium = win.Cesium;
				const OLCesium = win.olcs?.OLCesium;

				if (!Cesium || !OLCesium) return;

				const ol3dInstance = new OLCesium({ map: map });
				ol3d = ol3dInstance;

				const scene = ol3dInstance.getCesiumScene();

				const terrainProvider = await Cesium.createWorldTerrainAsync();
				scene.terrainProvider = terrainProvider;

				const tileset = await Cesium.Cesium3DTileset.fromUrl(
					'https://assets.cesium.com/1/ion/default/v1/354307/tileset.json?assetId=354307',
					{
						skipLevelOfDetail: true,
						cullWithChildrenBounds: false
					}
				);
				scene.primitives.add(tileset);

				isInitialized = true;
				ol3d.setEnabled(enabled);
			} catch (error) {
				console.error('Error initializing OLCesium/Cesium:', error);
			}
		};

		initCesium();
	});

	$effect(() => {
		if (isInitialized && ol3d) {
			try {
				ol3d.setEnabled(enabled);
			} catch (error) {
				console.error('Error toggling Cesium:', error);
			}
		}
	});
</script>
