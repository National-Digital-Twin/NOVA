import React, { useState, useEffect } from 'react';
import { Paper, Typography, CircularProgress } from '@mui/material';
import SubstationsList, { type Substation } from './SubstationsList';
import { fetchSubstations } from './substationsApi';
import { useMapStore } from '../../stores/useMapStore';
import { MapVisualHelper } from '../../utils/MapVisualHelper';
import type { GeoJSONSource } from 'maplibre-gl';
import type { FeatureCollection } from 'geojson';
import { MarkerStatus } from '../asset-marker/AssetMarker';

interface SubstationsListContainerProps {
    setShowSubstationsList: (showSubstationsList: boolean) => void;
    setShowControls?: (showControls: boolean) => void;
}

interface GridLayer {
    id: string;
    endpoint: string;
    type: string;
    data?: FeatureCollection;
}

/**
 * A container component that handles loading substations data and displays
 * the SubstationsList with appropriate loading and error states.
 */
const SubstationsListContainer: React.FC<SubstationsListContainerProps> = ({ setShowSubstationsList, setShowControls }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [substations, setSubstations] = useState<Substation[]>([]);
    const mapRef = useMapStore((s) => s.mapRef);    
    const map = mapRef?.getMap();
    const setGridConnectViewActive = useMapStore((s) => s.setGridConnectViewActive);
    const gridConnectViewActive = useMapStore((s) => s.gridConnectViewActive);
    const setShowLayerControl = useMapStore((s) => s.setShowLayerControl);
    const flyToLocation = useMapStore((s) => s.flyToLocation);
    const setSelectedSubstation = useMapStore((s) => s.setSelectedSubstation);
    const setMarkerStatus = useMapStore((s) => s.setMarkerStatus);
    const markerPosition = useMapStore((s) => s.markerPosition);
    const powerLineColor = '#007AFF';

    const onSubstationSelection = (selected: Substation) => {
        console.log(`Selected substation: ${selected.name}`);
        setSelectedSubstation(selected);
        setGridConnectViewActive(true);
        if (!gridConnectViewActive && setShowControls) setShowControls(false);
        setMarkerStatus(MarkerStatus.Connecting);
        setShowLayerControl(false);
        setShowSubstationsList(false);
        renderGridLayers();
        renderConnectionLineLayer(selected);        
        if (markerPosition && markerPosition.latitude && markerPosition.longitude) flyToLocation(markerPosition.latitude, markerPosition.longitude, 10);
    }


    const renderGridLayers = async () => {
        const substationLayer: GridLayer = { id: MapVisualHelper.substationLayerId, type: 'circle', endpoint: '/api/ui/substation-geojson' };
        const powerLineLayer: GridLayer = { id: MapVisualHelper.powerLineLayerId, type: 'line', endpoint: '/api/ui/power-line-geojson' };
        
        const substationFeatureData = fetchFeatureData(substationLayer);
        const powerLineFeatureData = fetchFeatureData(powerLineLayer);

        await Promise.all([substationFeatureData, powerLineFeatureData]).then((allFeatureData) => {
            setLayers(allFeatureData);
        })
    };

    const fetchFeatureData = async (layerToFetch: GridLayer) => {
        try {
            const response = await fetch(layerToFetch.endpoint);
            if (!response.ok) throw new Error('API error');
            const data = await response.json();
            layerToFetch.data = data;
            return layerToFetch;
        } catch (err) {
            console.error('Failed to load layers', err);
        }
    }

    const setLayers = (layers: (GridLayer | undefined)[]) => {
        if (!map) return;
        for (var layer of layers) {
            if (!layer || !layer.data) continue;
            if (!map.getSource(layer.id)) {
                    const paint = layer.type === 'circle' ? { 'circle-radius': 8, 'circle-color': '#CF9FFF', 'circle-opacity': 0.8 } : { 'line-color': powerLineColor, 'line-width': 4, 'line-opacity': 0.8 }
                    map.addSource(layer.id, { type: 'geojson', data: layer.data });
                    map.addLayer({
                        id: layer.id,
                        type: layer.type,
                        source: layer.id,
                        paint: paint,
                    });

                    console.log(map.getSource(layer.id));
            } else {
                const source = map.getSource(layer.id) as GeoJSONSource;
                source.setData(layer.data);
            }
        }
    }

    const renderConnectionLineLayer = (selected: Substation) => {
        if (!map || !markerPosition || !markerPosition.longitude || !markerPosition.latitude || !selected || !selected.coordinates) return;
        const layerId = MapVisualHelper.connectionLineLayerId;
        const data = {
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates: [
                    [ markerPosition.longitude, markerPosition.latitude ],
                    selected.coordinates
                ]
            }
        };

        if (map.getSource(layerId)) {
            const source = map.getSource(layerId) as GeoJSONSource;
            source.setData(data);
        }
        else {
            map.addSource(layerId, {
                type: 'geojson',
                data: data
            });

            // Add a layer to display the path
            map.addLayer({
                id: MapVisualHelper.connectionLineLayerId,
                type: 'line',
                source: MapVisualHelper.connectionLineLayerId,
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: {
                    'line-color': powerLineColor,
                    'line-width': 2,
                    'line-dasharray': [2, 2]
                }
            });
        }
    }

    useEffect(() => {
        const loadSubstations = async () => {
            if (!markerPosition || !markerPosition.latitude || !markerPosition.longitude) return;

            setIsLoading(true);
            setError(null);

            try {
                const result = await fetchSubstations(markerPosition.longitude, markerPosition.latitude);
                setSubstations(result.items);
                setError(result.error);
            } catch (err) {
                console.error('Error fetching substations:', err);
                setError('Failed to load substations');
            } finally {
                setIsLoading(false);
            }
        };

        loadSubstations();
    }, [markerPosition]);

    if (isLoading) {
        return (
            <Paper elevation={5} sx={{ maxWidth: 600, borderRadius: 1, p: 2, textAlign: 'center' }}>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                <Typography variant="body2">Loading substations...</Typography>
            </Paper>
        );
    }

    if (error) {
        return (
            <Paper elevation={5} sx={{ maxWidth: 600, borderRadius: 1, p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="error">
                    {error}
                </Typography>
            </Paper>
        );
    }

    return <SubstationsList items={substations} onConfirm={onSubstationSelection} />;
};

export default SubstationsListContainer;
