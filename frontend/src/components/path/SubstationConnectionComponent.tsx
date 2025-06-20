import { useEffect } from 'react';
import type { MapRef } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';

interface SubstationConnectionComponentProps {
  mapRef: React.RefObject<MapRef>;
  sourceLng: number;
  sourceLat: number;
  destLng: number;
  destLat: number;
}

const SubstationConnectionComponent: React.FC<SubstationConnectionComponentProps> = ({
  mapRef,
  sourceLng,
  sourceLat,
  destLng,
  destLat
}) => {
  // Default values for color and width are now defined directly in the component
  const color = '#ffb300';
  const width = 4;

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    // Create a GeoJSON source with the path coordinates
    const sourceId = 'path-source';
    const layerId = 'path-layer';

    // Remove existing source and layer if they exist
    if (map.getSource(sourceId)) {
      if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
      }
      map.removeSource(sourceId);
    }

    // Add the source with the path data
    map.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: [
            [sourceLng, sourceLat],
            [destLng, destLat]
          ]
        }
      }
    });

    // Add a layer to display the path
    map.addLayer({
      id: layerId,
      type: 'line',
      source: sourceId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': color,
        'line-width': width,
        'line-dasharray': [2, 2]
      }
    });

    // Fit the map to show the entire path
    const bounds = new maplibregl.LngLatBounds()
      .extend([sourceLng, sourceLat])
      .extend([destLng, destLat]);

    map.fitBounds(bounds, {
      padding: 50,
      maxZoom: 15
    });

    // Cleanup function to remove the source and layer when the component unmounts
    return () => {
      if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
      }
      if (map.getSource(sourceId)) {
        map.removeSource(sourceId);
      }
    };
  }, [mapRef, sourceLng, sourceLat, destLng, destLat]);

  return null; // This component doesn't render any UI elements
};

export default SubstationConnectionComponent;
