import { Box } from '@mui/material';
import 'mapbox-gl/dist/mapbox-gl.css';
import React, { useEffect, useRef, useState } from 'react';
import Map, { NavigationControl } from 'react-map-gl';
import ProtectedAreas from './ProtectedAreas';
import SidePanel from './SidePanel';
import WindTurbines from './WindTurbines';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

function MapComponent() {
    const mapRef = useRef();
    const [layerVisibility, setLayerVisibility] = useState({
        protectedAreas: true,
        windTurbines: true,
    });

    const [drawerOpen, setDrawerOpen] = useState(true);

    const handleLayerToggle = layerName => {
        setLayerVisibility(prev => ({
            ...prev,
            [layerName]: !prev[layerName],
        }));
    };

    const handleDrawerToggle = () => {
        setDrawerOpen(!drawerOpen);
    };

    const [viewState, setViewState] = useState({ longitude: -1.3033, latitude: 50.6942, zoom: 10, pitch: 60, bearing: 0 });

    useEffect(() => {
        if (!mapRef.current) return;

        const map = mapRef.current.getMap();

        map.on('load', () => {
            map.addSource('mapbox-dem', {
                type: 'raster-dem',
                url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
                tileSize: 512,
                maxzoom: 14,
            });

            map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });

            map.addLayer({
                id: '3d-buildings',
                source: 'composite',
                'source-layer': 'building',
                filter: ['==', 'extrude', 'true'],
                type: 'fill-extrusion',
                minzoom: 15,
                paint: {
                    'fill-extrusion-color': '#aaa',
                    'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 15, 0, 15.05, ['get', 'height']],
                    'fill-extrusion-base': ['interpolate', ['linear'], ['zoom'], 15, 0, 15.05, ['get', 'min_height']],
                    'fill-extrusion-opacity': 0.6,
                },
            });
        });
    }, []);

    return (
        <Box
            sx={{
                width: '100vw',
                height: 'calc(100vh - var(--header-height))',
                position: 'absolute',
                top: 'var(--header-height)',
                left: 0,
            }}
        >
            <SidePanel onLayerToggle={handleLayerToggle} layerVisibility={layerVisibility} onDrawerToggle={handleDrawerToggle} isOpen={drawerOpen} />

            <Box sx={{ width: '100%', height: '100%' }}>
                <Map
                    ref={mapRef}
                    {...viewState}
                    onMove={evt => setViewState(evt.viewState)}
                    mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
                    mapboxAccessToken={MAPBOX_TOKEN}
                    antialias={true}
                    terrain={{ source: 'mapbox-dem', exaggeration: 1.5 }}
                >
                    <NavigationControl position="top-right" />
                    <ProtectedAreas visible={layerVisibility.protectedAreas} />
                    <WindTurbines visible={layerVisibility.windTurbines} />
                </Map>
            </Box>
        </Box>
    );
}

export default MapComponent;
