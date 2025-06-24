import 'maplibre-gl/dist/maplibre-gl.css';
import { useRef, useState, useEffect } from 'react';
import type { MapRef } from 'react-map-gl/maplibre';
import { Map } from 'react-map-gl/maplibre';
import { MAP_STYLES, MAPTILER_TOKEN, type MapStyle } from '../../types/map';
import MapControls from '../map-controls/MapControls';
import SearchPanel from '../search/SearchPanel';
import LayerControlPanel from '../layer-selection/LayerControlPanel';
import useMapboxDraw from '../../hooks/useMapboxDraw';

const MAP_VIEW_BOUNDS: [[number, number], [number, number]] = [
    [-25.0, 42.0],
    [15.0, 67.0],
];

const MapComponent = () => {
    const mapRef = useRef<MapRef>(null!);
    const [viewState, setViewState] = useState({
        longitude: -1.611,
        latitude: 54.5,
        pitch: 0,
        bearing: 0,
        zoom: 6,
    });
    const [mapStyle, setMapStyle] = useState<MapStyle>('hybrid');
    const [isMapInitialized, setIsMapInitialized] = useState(false);
    const [showLayerControl, setShowLayerControl] = useState(false);
    const [terrainEnabled, setTerrainEnabled] = useState(false);
    const drawRef = useMapboxDraw(mapRef, isMapInitialized);

    const handleStyleChange = (newStyle: MapStyle) => {
        setMapStyle(newStyle);
    };

    const handleMapLoad = () => {
        setIsMapInitialized(true);
    };

    useEffect(() => {
        const map = mapRef.current?.getMap();
        if (!map || !isMapInitialized) return;

        const checkAndSetTerrain = () => {
            const zoom = map.getZoom();
            if (zoom >= 10 && !terrainEnabled) {
                if (!map.getSource('terrain')) {
                    map.addSource('terrain', {
                        type: 'raster-dem',
                        url: `https://api.maptiler.com/tiles/terrain-rgb/tiles.json?key=${MAPTILER_TOKEN}`,
                        tileSize: 256,
                        maxzoom: 14,
                    });
                }
                map.setTerrain({ source: 'terrain', exaggeration: 2.5 });
                setTerrainEnabled(true);
            } else if (zoom < 10 && terrainEnabled) {
                map.setTerrain(null);
                setTerrainEnabled(false);
            }
        };

        map.on('move', checkAndSetTerrain);
        checkAndSetTerrain();

        return () => {
            map.off('move', checkAndSetTerrain);
        };
    }, [isMapInitialized, terrainEnabled]);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <Map
                ref={mapRef}
                maxBounds={MAP_VIEW_BOUNDS}
                {...viewState}
                onMove={(evt) => setViewState(evt.viewState)}
                onLoad={handleMapLoad}
                mapStyle={MAP_STYLES[mapStyle]}
                style={{ width: '100%', height: '100%' }}
            >
                {isMapInitialized && (
                    <>
                        <SearchPanel
                            mapRef={mapRef}
                            drawRef={drawRef}
                            hideLayerControl={() => setShowLayerControl(false)}
                            showLayerControl={() => setShowLayerControl(true)}
                        />
                        <MapControls
                            mapRef={mapRef}
                            onStyleChange={handleStyleChange}
                            currentStyle={mapStyle}
                        />
                        {showLayerControl && <LayerControlPanel mapRef={mapRef} drawRef={drawRef} />}
                    </>
                )}
            </Map>
        </div>
    );
};

export default MapComponent;
