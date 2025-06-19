import { useEffect } from 'react';
import type { FeatureCollection, Point } from 'geojson';
import { Layer, Source } from 'react-map-gl/maplibre';
import type { MapRef } from 'react-map-gl/maplibre';
import windTurbineIcon from '../../assets/Windturbine_blue_unselected.svg';
import windTurbineSelectedIcon from '../../assets/Windturbine_blue_selected.svg';


interface AssetMarkerLayerProps {
  assets: Array<{
    longitude: number;
    latitude: number;
    id: string;
  }>;
  mapRef?: React.RefObject<MapRef>;
  selectedAssetId?: string | null;
}

/**
 * A component for displaying wind turbine markers on the map using a layer approach
 */
const AssetMarkerLayer: React.FC<AssetMarkerLayerProps> = ({ assets, mapRef, selectedAssetId = null }) => {

  // Convert assets to GeoJSON format
  const geojsonData: FeatureCollection<Point> = {
    type: 'FeatureCollection',
    features: assets.map(asset => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [asset.longitude, asset.latitude]
      },
      properties: {
        id: asset.id,
        selected: asset.id === selectedAssetId
      }
    }))
  };

  // Add images to the map when the component mounts
  useEffect(() => {
    if (!mapRef?.current) return;

    const map = mapRef.current;

    // Add the wind turbine images if they don't exist
    if (!map.hasImage('wind-turbine')) {
      const img = new Image();
      img.onload = () => {
        if (!map.hasImage('wind-turbine')) {
          map.addImage('wind-turbine', img);
        }
      };
      img.src = windTurbineIcon;
    }

    if (!map.hasImage('wind-turbine-selected')) {
      const imgSelected = new Image();
      imgSelected.onload = () => {
        if (!map.hasImage('wind-turbine-selected')) {
          map.addImage('wind-turbine-selected', imgSelected);
        }
      };
      imgSelected.src = windTurbineSelectedIcon;
    }

  }, [mapRef]);

  return (
    <Source id="asset-markers-source" type="geojson" data={geojsonData}>
      <Layer
        id="asset-markers"
        type="symbol"
        layout={{
          'icon-image': ['case', ['get', 'selected'], 'wind-turbine-selected', 'wind-turbine'],
          'icon-size': 0.5,
          'icon-allow-overlap': true,
          'icon-anchor': 'bottom'
        }}
      />
    </Source>
  );
};

export default AssetMarkerLayer;
