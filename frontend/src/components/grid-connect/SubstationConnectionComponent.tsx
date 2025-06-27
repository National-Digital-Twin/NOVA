import { useEffect } from 'react';
import type { MapRef } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import { MapVisualHelper } from '../../utils/MapVisualHelper';

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

    // Remove existing source and layer if they exist
    if (map.getSource(MapVisualHelper.connectionLineLayerId)) {
      if (map.getLayer(MapVisualHelper.connectionLineLayerId)) {
        map.removeLayer(MapVisualHelper.connectionLineLayerId);
      }
      map.removeSource(MapVisualHelper.connectionLineLayerId);
    }

    // Add the source with the path data
    map.addSource(MapVisualHelper.connectionLineLayerId, {
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
      id: MapVisualHelper.connectionLineLayerId,
      type: 'line',
      source: MapVisualHelper.connectionLineLayerId,
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

    // Cleanup function to remove the source and layer when the component unmounts
    return () => {
      if (map.getLayer(MapVisualHelper.connectionLineLayerId)) {
        map.removeLayer(MapVisualHelper.connectionLineLayerId);
      }
      if (map.getSource(MapVisualHelper.connectionLineLayerId)) {
        map.removeSource(MapVisualHelper.connectionLineLayerId);
      }
    };
  }, [mapRef, sourceLng, sourceLat, destLng, destLat]);

  return null;
};

export default SubstationConnectionComponent;
