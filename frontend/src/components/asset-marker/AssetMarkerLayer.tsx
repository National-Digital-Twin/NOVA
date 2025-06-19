import { useEffect, useState } from 'react';
import type { FeatureCollection, Point } from 'geojson';
import { Layer, Source } from 'react-map-gl/maplibre';
import type { MapRef } from 'react-map-gl/maplibre';
import windTurbineIcon from '../../assets/Windturbine_blue_unselected.svg';
import windTurbineSelectedIcon from '../../assets/Windturbine_blue_selected.svg';
import { fetchSubstations } from '../map-substations-list';
import type { ListItem } from "../map-substations-list/SubstationsList";
import { SubstationsList } from '../map-substations-list';

interface AssetMarkerLayerProps {
  assets: Array<{
    longitude: number;
    latitude: number;
    id: string;
  }>;
  mapRef?: React.RefObject<MapRef>;
}

/**
 * A component for displaying wind turbine markers on the map using a layer approach
 */
const AssetMarkerLayer: React.FC<AssetMarkerLayerProps> = ({ assets, mapRef }) => {
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [substations, setSubstations] = useState<ListItem[]>([]);
  const [popupPosition, setPopupPosition] = useState<{ longitude: number; latitude: number } | null>(null);

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

  // Handle click on the map to detect if a marker was clicked
  useEffect(() => {
    if (!mapRef?.current) return;

    const map = mapRef.current;

    const handleMapClick = (e: any) => {
      // Query features at the clicked point
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['asset-markers']
      });

      if (features.length > 0) {
        const assetId = features[0].properties?.id;
        const isSelected = features[0].properties?.selected;
        
        // Find the asset with this ID
        const clickedAsset = assets.find(asset => asset.id === assetId);
        
        if (clickedAsset) {
          // If already selected, deselect it
          if (isSelected) {
            setSelectedAssetId(null);
            setPopupPosition(null);
          } else {
            // Otherwise, select it and show popup
            setSelectedAssetId(assetId);
            setPopupPosition({
              longitude: clickedAsset.longitude,
              latitude: clickedAsset.latitude
            });
            
            // Fetch substations data
            setIsLoading(true);
            setError(null);
            
            fetchSubstations(clickedAsset.longitude, clickedAsset.latitude)
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
          }
        }
      } else if (selectedAssetId) {
        // If clicked outside any marker, deselect current marker
        setSelectedAssetId(null);
        setPopupPosition(null);
      }
    };

    // Add click event listener
    map.on('click', handleMapClick);

    // Clean up
    return () => {
      map.off('click', handleMapClick);
    };
  }, [mapRef, assets, selectedAssetId]);

  // Handle confirmation from the list
  const handleConfirm = (selected: ListItem) => {
    console.log(`Selected turbine: ${selected.text}`);
    setSelectedAssetId(null);
    setPopupPosition(null);
  };

  return (
    <>
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

      {/* Add images to the map for the markers */}
      {mapRef?.current && (
        <div style={{ display: 'none' }}>
          {(() => {
            const map = mapRef.current;
            
            // Add the images if they don't exist
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
            
            return null;
          })()}
        </div>
      )}

      {/* Popup for selected marker */}
      {popupPosition && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -100%)',
            zIndex: 1000,
            marginTop: '-30px', // Adjust based on marker height
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
              onConfirm={handleConfirm}
            />
          )}
        </div>
      )}
    </>
  );
};

export default AssetMarkerLayer;