import 'maplibre-gl/dist/maplibre-gl.css';
import { useRef, useState, useCallback } from 'react';
import type { MapRef } from 'react-map-gl/maplibre';
import { Map } from 'react-map-gl/maplibre';
import { MAP_STYLES, type MapStyle } from '../../types/map';
import MapControls from '../map-controls/MapControls';
import SearchPanel from '../search/SearchPanel';
import LayerControlPanel from '../layer-selection/LayerControlPanel';
import AssetMarker from '../asset-marker/AssetMarker';
import { SubstationsList } from '../map-substations-list';

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

    // State for tracking marker selection and popup
    const [isMarkerSelected, setIsMarkerSelected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [substations, setSubstations] = useState<any[]>([]);

    // Handle map click to update marker position or toggle selection
    const handleMapClick = useCallback((e: any) => {
        if (!mapRef.current) return;

        // If marker is selected, deselect it
        if (isMarkerSelected) {
            setIsMarkerSelected(false);
        } else {
            // Otherwise, create or update marker position
            setMarkerPosition({
                longitude: e.lngLat.lng,
                latitude: e.lngLat.lat
            });
        }
    }, [isMarkerSelected]);


    // Handle bolt click to fetch substations
    const handleBoltClick = useCallback(() => {
        // Set marker as selected
        setIsMarkerSelected(true);

        // If marker position exists, fetch substations data
        if (markerPosition) {
            setIsLoading(true);
            setError(null);

            import('../map-substations-list').then(({ fetchSubstations }) => {
                fetchSubstations(markerPosition.longitude!, markerPosition.latitude!)
                    .then(result => {
                        setSubstations(result.items);
                        setError(result.error);
                    })
                    .catch(err => {
                        console.error('Error fetching substations:', err);
                        setError('Failed to load substations');
                    })
                    .finally(() => {
                        setIsLoading(false);
                    });
            });
        }
    }, [markerPosition]);

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
                                onBoltClick={handleBoltClick}
                                isSelected={isMarkerSelected}
                                onDragEnd={handleMarkerDragEnd}
                            />
                        )}

                        {/* Popup for selected marker */}
                        {isMarkerSelected && markerPosition && (
                            <div
                                style={{
                                    position: 'absolute',
                                    left: '50%',
                                    top: '50%',
                                    transform: 'translate(-50%, -100%)',
                                    zIndex: 1000,
                                    marginTop: '-30px',
                                    width: '250px'
                                }}
                            >
                                {isLoading ? (
                                    <div style={{ 
                                        backgroundColor: 'white', 
                                        padding: '10px', 
                                        borderRadius: '4px',
                                        textAlign: 'center',
                                        boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                                    }}>
                                        Loading substations...
                                    </div>
                                ) : error ? (
                                    <div style={{ 
                                        backgroundColor: 'white', 
                                        padding: '10px', 
                                        borderRadius: '4px',
                                        textAlign: 'center',
                                        color: 'red',
                                        boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                                    }}>
                                        {error}
                                    </div>
                                ) : (
                                    <SubstationsList
                                        items={substations}
                                        onConfirm={(selected) => {
                                            console.log(`Selected turbine: ${selected.text}`);
                                            setIsMarkerSelected(false);
                                        }}
                                    />
                                )}
                            </div>
                        )}
                        {showLayerControl && <LayerControlPanel />}
                    </>
                )}
            </Map>
        </div>
    );
};

export default MapComponent;
