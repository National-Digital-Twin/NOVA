import 'maplibre-gl/dist/maplibre-gl.css';
import { useRef, useState } from 'react';
import type { MapRef } from 'react-map-gl/maplibre';
import { Map } from 'react-map-gl/maplibre';
import { MAP_STYLES, type MapStyle } from '../../types/map';
import MapControls from '../map-controls/MapControls';
import SearchPanel from '../search/SearchPanel';
import LayerControlPanel from '../layer-selection/LayerControlPanel';
import useMapboxDraw from '../../hooks/useMapboxDraw';
import { MapVisualHelper } from '../../utils/MapVisualHelper';

const MAP_VIEW_BOUNDS: [[number, number], [number, number]] = [
    [-25.0, 42.0],
    [15.0, 67.0],
];

const MapComponent = () => {
    const mapRef = useRef<MapRef>(null!);
    const [viewState, setViewState] = useState({ longitude: -1.611, latitude: 54.5, pitch: 0, bearing: 0 });
    const [mapStyle, setMapStyle] = useState<MapStyle>('hybrid');
    const [isMapInitialized, setIsMapInitialized] = useState(false);
    const [showLayerControl, setShowLayerControl] = useState(false);
    const drawRef = useMapboxDraw(mapRef, isMapInitialized);

    const handleStyleChange = (newStyle: MapStyle) => {
        setMapStyle(newStyle);
        const cachedHeatMap = MapVisualHelper.getCachedHeatmapGeojson();
        const userDrawnPolygon = drawRef.current ? MapVisualHelper.getFirstPolygon(drawRef.current) : null;
        if (mapRef.current && userDrawnPolygon && cachedHeatMap) {
            mapRef.current.getMap().once('styledata', () => {
                MapVisualHelper.addOrUpdateHeatmapLayer(mapRef, cachedHeatMap);
                MapVisualHelper.applyDimmedMaskAndPanToPolygon(mapRef.current.getMap(), userDrawnPolygon);
            });
        }
    };

    const handleMapLoad = () => {
        setIsMapInitialized(true);
    };

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
                        <MapControls mapRef={mapRef} onStyleChange={handleStyleChange} currentStyle={mapStyle} />
                        {showLayerControl && <LayerControlPanel mapRef={mapRef} drawRef={drawRef} />}
                    </>
                )}
            </Map>
        </div>
    );
};

export default MapComponent;
