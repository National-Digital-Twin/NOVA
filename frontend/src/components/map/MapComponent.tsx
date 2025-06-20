import 'maplibre-gl/dist/maplibre-gl.css';
import { useRef, useState, useCallback } from 'react';
import type { MapRef } from 'react-map-gl/maplibre';
import { Map } from 'react-map-gl/maplibre';
import { MAP_STYLES, type MapStyle } from '../../types/map';
import MapControls from '../map-controls/MapControls';
import SearchPanel from '../search/SearchPanel';
import LayerControlPanel from '../layer-selection/LayerControlPanel';
import AssetMarker from '../asset-marker/AssetMarker';

const MapComponent = () => {
    const mapRef = useRef<MapRef>(null!);
    const [viewState, setViewState] = useState({ longitude: -1.33, latitude: 50.65, zoom: 10, pitch: 60, bearing: 0 });
    const [mapStyle, setMapStyle] = useState<MapStyle>('hybrid');
    const [isMapInitialized, setIsMapInitialized] = useState(false);
    const [showLayerControl, setShowLayerControl] = useState(false);
    const [markerPosition, setMarkerPosition] = useState<{
        longitude?: number;
        latitude?: number;
    } | null>(null);

    const handleStyleChange = (newStyle: MapStyle) => {
        setMapStyle(newStyle);
    };

    const handleMapLoad = () => {
        setIsMapInitialized(true);
    };

    // Handle map click to update marker position
    const handleMapClick = useCallback((e: any) => {
        if (!mapRef.current) return;

        // Create or update marker position
        setMarkerPosition({
            longitude: e.lngLat.lng,
            latitude: e.lngLat.lat
        });
    }, []);


    // Handle marker drag end to update marker position
    const handleMarkerDragEnd = useCallback((longitude: number, latitude: number) => {
        console.log('Marker position updated:', { longitude, latitude });
        setMarkerPosition({ longitude, latitude });
    }, []);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <Map
                ref={mapRef}
                {...viewState}
                onMove={(evt) => setViewState(evt.viewState)}
                onLoad={handleMapLoad}
                onClick={handleMapClick}
                mapStyle={MAP_STYLES[mapStyle]}
                style={{ width: '100%', height: '100%' }}
            >
                {isMapInitialized && (
                    <>
                        <SearchPanel mapRef={mapRef} hideLayerControl={() => setShowLayerControl(false)} showLayerControl={() => setShowLayerControl(true)} />
                        <MapControls mapRef={mapRef} onStyleChange={handleStyleChange} currentStyle={mapStyle} />
                        {markerPosition && (
                            <AssetMarker
                                longitude={markerPosition.longitude}
                                latitude={markerPosition.latitude}
                                mapRef={mapRef}
                                onDragEnd={handleMarkerDragEnd}
                            />
                        )}
                        {showLayerControl && <LayerControlPanel />}
                    </>
                )}
            </Map>
        </div>
    );
};

export default MapComponent;
