import { Box } from '@mui/material';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useRef, useState } from 'react';
import { Map, NavigationControl, type MapRef } from 'react-map-gl/maplibre';
import DrawerComponent from './DrawerComponent';
import RandomHeatmapLayer from './RandomHeatmapLayer';
import RandomPolygonsLayer from './RandomPolygonsLayer';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPTILER_API_KEY;

const MapComponent = () => {
    const mapRef = useRef<MapRef>(null);
    const [viewState, setViewState] = useState({ longitude: -1.33, latitude: 50.65, zoom: 10, pitch: 60, bearing: 0 });
    const [layerVisibility, setLayerVisibility] = useState({ heatmap: true, polygons: true });

    const toggleLayer = (layer: 'heatmap' | 'polygons') => setLayerVisibility(prev => ({ ...prev, [layer]: !prev[layer] }));

    return (
        <Box sx={{ position: 'relative' }}>
            <DrawerComponent layerVisibility={layerVisibility} onToggleLayer={toggleLayer} />
            <Map
                ref={mapRef}
                {...viewState}
                onMove={evt => setViewState(evt.viewState)}
                mapStyle={`https://api.maptiler.com/maps/hybrid/style.json?key=${MAPBOX_TOKEN}`}
            >
                <NavigationControl position="top-right" />
                {layerVisibility.polygons && <RandomPolygonsLayer />}
                {layerVisibility.heatmap && <RandomHeatmapLayer />}
            </Map>
        </Box>
    );
};

export default MapComponent;
