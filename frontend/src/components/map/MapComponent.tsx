import 'maplibre-gl/dist/maplibre-gl.css';
import { useRef, useState } from 'react';
import type { MapRef } from 'react-map-gl/maplibre';
import { Map } from 'react-map-gl/maplibre';
import { MAP_STYLES, type MapStyle } from '../../types/map';
import MapControls from '../map-controls/MapControls';
import RandomHeatmapLayer from '../map-layers/heatmap/RandomHeatmapLayer';
import RandomPolygonsLayer from '../map-layers/polygons/RandomPolygonsLayer';
import SidebarComponent from '../sidebar/SidebarComponent';

const MapComponent = () => {
    const mapRef = useRef<MapRef>(null!);
    const [viewState, setViewState] = useState({ longitude: -1.33, latitude: 50.65, zoom: 10, pitch: 60, bearing: 0 });
    const [layerVisibility, setLayerVisibility] = useState({ heatmap: true, polygons: true });
    const [mapStyle, setMapStyle] = useState<MapStyle>('hybrid');

    const toggleLayer = (layer: 'heatmap' | 'polygons') => setLayerVisibility(prev => ({ ...prev, [layer]: !prev[layer] }));

    const handleStyleChange = (newStyle: MapStyle) => {
        setMapStyle(newStyle);
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <SidebarComponent onToggleLayer={toggleLayer} layerVisibility={layerVisibility} />
            <Map
                ref={mapRef}
                {...viewState}
                onMove={evt => setViewState(evt.viewState)}
                mapStyle={MAP_STYLES[mapStyle]}
                style={{ width: '100%', height: '100%' }}
            >
                <MapControls mapRef={mapRef} onStyleChange={handleStyleChange} currentStyle={mapStyle} />
                {layerVisibility.polygons && <RandomPolygonsLayer />}
                {layerVisibility.heatmap && <RandomHeatmapLayer />}
            </Map>
        </div>
    );
};

export default MapComponent;
