import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useRef, useState } from 'react';
import type { MapRef } from 'react-map-gl/maplibre';
import { Map } from 'react-map-gl/maplibre';
import { MAP_STYLES, type MapStyle } from '../../types/map';
import MapControls from '../map-controls/MapControls';
import SearchPanel from '../search/SearchPanel';
import LayerControlPanel from '../layer-selection/LayerControlPanel';
import useMapboxDraw from '../../hooks/useMapboxDraw';
import { MapVisualHelper } from '../../utils/MapVisualHelper';
import { useMapStore } from '../../stores/useMapStore';
import AssetMarkerContainer from '../asset-marker/AssetMarkerContainer';
import { useMarkerPlacement } from '../../hooks/useMarkerPlacement';
import PlacingMarkerOverlay from '../asset-marker/PlacingMarkerOverlay';

const MAP_VIEW_BOUNDS: [[number, number], [number, number]] = [
    [-25.0, 42.0],
    [15.0, 67.0],
];

const MapComponent = () => {
    const mapRef = useRef<MapRef>(null!);
    const setMapRef = useMapStore((s) => s.setMapRef);
    const [viewState, setViewState] = useState({ longitude: -1.611, latitude: 54.5, pitch: 0, bearing: 0 });
    const [mapStyle, setMapStyle] = useState<MapStyle>('hybrid');
    const [isMapInitialized, setIsMapInitialized] = useState(false);
    const placing = useMapStore((s) => s.placing);

    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const drawRef = useMapboxDraw(mapRef, isMapInitialized);
    const setDrawRef = useMapStore((s) => s.setDrawRef);
    const [is3D, setIs3D] = useState(false);
    const cachedHeatMap = useMapStore((s) => s.cachedHeatmap);
    const { handleMapClick, mousePos, isInsidePolygon, suitability } = useMarkerPlacement();

    const handleStyleChange = (newStyle: MapStyle) => {
        setMapStyle(newStyle);
        const userDrawnPolygon = drawRef.current ? MapVisualHelper.getFirstPolygon(drawRef.current) : null;
        if (mapRef.current && userDrawnPolygon && cachedHeatMap) {
            mapRef.current.getMap().once('styledata', () => {
                MapVisualHelper.addOrUpdateHeatmapLayer(mapRef, cachedHeatMap);
                MapVisualHelper.applyDimmedMaskAndPanToPolygon(mapRef.current.getMap(), userDrawnPolygon);
            });
        }
    };

    useEffect(() => {
        if (drawRef.current) {
            setDrawRef(drawRef.current);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [drawRef.current, setDrawRef]);

    const handleMapLoad = () => {
        setIsMapInitialized(true);
        setMapRef(mapRef.current);
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <Map
                ref={mapRef}
                maxBounds={MAP_VIEW_BOUNDS}
                {...viewState}
                onMove={(evt) => setViewState(evt.viewState)}
                onClick={handleMapClick}
                onLoad={handleMapLoad}
                mapStyle={MAP_STYLES[mapStyle]}
                style={{ width: '100%', height: '100%' }}
            >
                {isMapInitialized && (
                    <>
                        <SearchPanel drawRef={drawRef} isPanelOpen={isPanelOpen} mapRef={mapRef} setIsPanelOpen={setIsPanelOpen} />
                        <MapControls mapRef={mapRef} onStyleChange={handleStyleChange} currentStyle={mapStyle} is3D={is3D} setIs3D={setIs3D} />
                        {placing && mousePos && <PlacingMarkerOverlay mousePos={mousePos} isInsidePolygon={isInsidePolygon} suitability={suitability} />}
                        <AssetMarkerContainer is3D={is3D} setIsPanelOpen={setIsPanelOpen} />
                        <LayerControlPanel mapRef={mapRef} drawRef={drawRef} />
                    </>
                )}
            </Map>
        </div>
    );
};

export default MapComponent;
