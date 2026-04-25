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

	$effect(() => {
		if (!map || typeof window === 'undefined') return;

		const initCesium = async () => {
			const win = window as unknown as CesiumWin;
			const Cesium = win.Cesium;
			const OLCesium = win.olcs?.OLCesium;

			if (!Cesium || !OLCesium) {
				return;
			}

			if (isInitialized) return;

			try {
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

		const interval = setInterval(() => {
			const win = window as unknown as CesiumWin;
			if (win.Cesium && win.olcs?.OLCesium) {
				initCesium();
				clearInterval(interval);
			}
		}, 500);

		return () => clearInterval(interval);
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
