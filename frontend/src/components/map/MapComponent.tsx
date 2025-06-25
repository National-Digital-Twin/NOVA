import 'maplibre-gl/dist/maplibre-gl.css';
import { useRef, useState, useCallback, useEffect } from 'react';
import type { MapLayerMouseEvent, MapRef } from 'react-map-gl/maplibre';
import { Map } from 'react-map-gl/maplibre';
import { MAP_STYLES, type MapStyle } from '../../types/map';
import MapControls from '../map-controls/MapControls';
import SearchPanel from '../search/SearchPanel';
import LayerControlPanel from '../layer-selection/LayerControlPanel';
import AssetMarker from '../asset-marker/AssetMarker';
import windTurbineIcon from '../../assets/Windturbine_white.svg';
import useMapboxDraw from '../../hooks/useMapboxDraw';

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
    const [markerPosition, setMarkerPosition] = useState<{
        longitude?: number;
        latitude?: number;
    } | null>(null);
    const [placing, setPlacing] = useState(false);
    const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const drawRef = useMapboxDraw(mapRef, isMapInitialized);

    const handleStyleChange = (newStyle: MapStyle) => {
        setMapStyle(newStyle);
    };

    const handleMapLoad = () => {
        setIsMapInitialized(true);
    };

    // Handle map click to update marker position
    const handleMapClick = useCallback((e: MapLayerMouseEvent) => {
        if (!placing) return;

        const { lngLat } = e;
        setMarkerPosition({longitude: lngLat.lng, latitude: lngLat.lat});
        setPlacing(false);
    }, [placing]);


    // Handle marker drag end to update marker position
    const handleMarkerDragEnd = useCallback((longitude: number, latitude: number) => {
        console.log('Marker position updated:', { longitude, latitude });
        setMarkerPosition({ longitude, latitude });
    }, []);

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
                onClick={handleMapClick}
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
                            setPlacing={setPlacing}
                            showLayerControl={() => setShowLayerControl(true)}  />
                        <MapControls mapRef={mapRef} onStyleChange={handleStyleChange} currentStyle={mapStyle} />
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
                                <img 
                                    src={windTurbineIcon} 
                                    alt="Wind Turbine pending" 
                                    style={{ width: '60px', height: '60px', cursor: 'pointer' }}
                                />
                            </div>
                            )}
                        {markerPosition && (
                            <AssetMarker
                                longitude={markerPosition.longitude}
                                latitude={markerPosition.latitude}
                                mapRef={mapRef}
                                onDragEnd={handleMarkerDragEnd}
                                setMarkerPosition={setMarkerPosition}
                                setIsPanelOpen={setIsPanelOpen}
                                setPlacing={setPlacing}
                            />
                        )}
                        {showLayerControl && <LayerControlPanel mapRef={mapRef} drawRef={drawRef} />}
                    </>
                )}
            </Map>
        </div>
    );
};

export default MapComponent;
