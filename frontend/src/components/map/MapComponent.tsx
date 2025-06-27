import 'maplibre-gl/dist/maplibre-gl.css';
import { useRef, useState, useCallback, useEffect } from 'react';
import type { MapRef } from 'react-map-gl/maplibre';
import { Map } from 'react-map-gl/maplibre';
import { MAP_STYLES, type MapStyle } from '../../types/map';
import MapControls from '../map-controls/MapControls';
import SearchPanel from '../search/SearchPanel';
import LayerControlPanel from '../layer-selection/LayerControlPanel';
import AssetMarker from '../asset-marker/AssetMarker';
import windTurbineIcon from '../../assets/Windturbine_white.svg';
import useMapboxDraw from '../../hooks/useMapboxDraw';
import { MapVisualHelper } from '../../utils/MapVisualHelper';
import { useMapStore } from '../../stores/useMapStore';

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
    const [showLayerControl, setShowLayerControl] = useState(false);
    const markerPosition = useMapStore((s) => s.markerPosition);
    const setMarkerPosition = useMapStore((s) => s.setMarkerPosition);
    const placing = useMapStore((s) => s.placing);

    const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const drawRef = useMapboxDraw(mapRef, isMapInitialized);
    const setDrawRef = useMapStore((s) => s.setDrawRef);
    const [is3D, setIs3D] = useState(false);
    const cachedHeatMap = useMapStore((s) => s.cachedHeatmap);

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

    const handleMapLoad = () => {
        setIsMapInitialized(true);
    };

    // Handle marker drag end to update marker position
    const handleMarkerDragEnd = useCallback(
        (longitude: number, latitude: number) => {
            console.log('Marker position updated:', { longitude, latitude });
            setMarkerPosition({ longitude, latitude });
        },
        [setMarkerPosition]
    );

    useEffect(() => {
        if (mapRef.current) {
            setMapRef(mapRef.current);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mapRef.current]);

    useEffect(() => {
        if (drawRef.current) {
            setDrawRef(drawRef.current);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [drawRef.current]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };

        if (placing) {
            window.addEventListener('mousemove', handleMouseMove);
        } else {
            setMousePos(null);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [placing]);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <Map
                ref={mapRef}
                maxBounds={MAP_VIEW_BOUNDS}
                {...viewState}
                onMove={(evt) => setViewState(evt.viewState)}
                onLoad={handleMapLoad}
                onClick={useMapStore((s) => s.handleMapClick)}
                mapStyle={MAP_STYLES[mapStyle]}
                style={{ width: '100%', height: '100%' }}
            >
                {isMapInitialized && (
                    <>
                        <SearchPanel
                            drawRef={drawRef}
                            hideLayerControl={() => setShowLayerControl(false)}
                            isPanelOpen={isPanelOpen}
                            mapRef={mapRef}
                            setIsPanelOpen={setIsPanelOpen}
                            showLayerControl={() => setShowLayerControl(true)}
                        />
                        <MapControls mapRef={mapRef} onStyleChange={handleStyleChange} currentStyle={mapStyle} is3D={is3D} setIs3D={setIs3D} />
                        {placing && mousePos && (
                            <div
                                style={{
                                    position: 'fixed',
                                    left: mousePos.x,
                                    top: mousePos.y,
                                    transform: 'translate(-50%, -100%)',
                                    pointerEvents: 'none',
                                    zIndex: 1000,
                                }}
                            >
                                <img src={windTurbineIcon} alt="Wind Turbine pending" style={{ width: '60px', height: '60px', cursor: 'pointer' }} />
                            </div>
                        )}
                        {markerPosition && !is3D && (
                            <AssetMarker
                                longitude={markerPosition.longitude}
                                latitude={markerPosition.latitude}
                                mapRef={mapRef}
                                onDragEnd={handleMarkerDragEnd}
                                setIsPanelOpen={setIsPanelOpen}
                            />
                        )}
                        <LayerControlPanel mapRef={mapRef} drawRef={drawRef} />
                    </>
                )}
            </Map>
        </div>
    );
};

export default MapComponent;
