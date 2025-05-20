import React, { useRef, useEffect, useState } from 'react';
import Map, { NavigationControl, Source, Layer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import ProtectedAreas from './ProtectedAreas';
import WindTurbines from './WindTurbines';
import SidePanel from './SidePanel';

// Using environment variable for Mapbox access token
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

function MapComponent() {
  const mapRef = useRef();
  // State to track layer visibility
  const [layerVisibility, setLayerVisibility] = useState({
    protectedAreas: true, // Protected areas visible by default
    windTurbines: true, // Wind turbines visible by default
  });

  // State to track drawer open/closed state
  const [drawerOpen, setDrawerOpen] = useState(true);

  // Function to toggle layer visibility
  const handleLayerToggle = (layerName) => {
    setLayerVisibility(prev => ({
      ...prev,
      [layerName]: !prev[layerName]
    }));
  };

  // Function to toggle drawer open/closed state
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const [viewState, setViewState] = useState({
    longitude: -1.3033, // Isle of Wight, UK longitude
    latitude: 50.6942, // Isle of Wight, UK latitude
    zoom: 10, // Zoom level to show the entire island
    pitch: 60, // Tilt the map for 3D effect
    bearing: 0
  });

  // Add 3D terrain when map loads
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current.getMap();

    map.on('load', () => {
      // Add terrain source
      map.addSource('mapbox-dem', {
        'type': 'raster-dem',
        'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
        'tileSize': 512,
        'maxzoom': 14
      });

      // Add terrain layer
      map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });

      // Add 3D buildings
      map.addLayer({
        'id': '3d-buildings',
        'source': 'composite',
        'source-layer': 'building',
        'filter': ['==', 'extrude', 'true'],
        'type': 'fill-extrusion',
        'minzoom': 15,
        'paint': {
          'fill-extrusion-color': '#aaa',
          'fill-extrusion-height': [
            'interpolate', ['linear'], ['zoom'],
            15, 0,
            15.05, ['get', 'height']
          ],
          'fill-extrusion-base': [
            'interpolate', ['linear'], ['zoom'],
            15, 0,
            15.05, ['get', 'min_height']
          ],
          'fill-extrusion-opacity': 0.6
        }
      });
    });
  }, []);

  return (
    <div style={{ width: '100vw', height: 'calc(100vh - 30px)', position: 'absolute', top: '30px', left: 0 }}>
      {/* Side Panel */}
      <SidePanel 
        onLayerToggle={handleLayerToggle} 
        layerVisibility={layerVisibility}
        onDrawerToggle={handleDrawerToggle}
        isOpen={drawerOpen}
      />

      {/* Map container - no margin adjustments needed as drawer now overlays the map */}
      <div style={{ 
        width: '100%', 
        height: '100%'
      }}>
        <Map
          ref={mapRef}
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          mapStyle="mapbox://styles/mapbox/satellite-streets-v12" // Satellite imagery for better 3D effect
          mapboxAccessToken={MAPBOX_TOKEN}
          antialias={true} // For better 3D rendering
          terrain={{ source: 'mapbox-dem', exaggeration: 1.5 }}
        >
          <NavigationControl position="top-right" />
          <ProtectedAreas visible={layerVisibility.protectedAreas} />
          <WindTurbines visible={layerVisibility.windTurbines} />
        </Map>
      </div>
    </div>
  );
}

export default MapComponent;
