import { useRef, useState } from 'react';
import { Marker } from 'react-map-gl/maplibre';
import type { MapRef, MarkerDragEvent } from 'react-map-gl/maplibre';
import windTurbineIcon from '../../assets/Windturbine_blue_unselected.svg';
import windTurbineSelectedIcon from '../../assets/Windturbine_blue_selected.svg';
import AssetControls from './AssetControls';

interface AssetMarkerProps {
  longitude?: number;
  latitude?: number;
  mapRef?: React.RefObject<MapRef>;
  onClick?: () => void;
  onBoltClick?: () => void;
  isSelected?: boolean;
  onDragEnd?: (longitude: number, latitude: number) => void;
}

/**
 * A reusable component for displaying a wind turbine marker on the map
 */
const AssetMarker: React.FC<AssetMarkerProps> = ({ longitude, latitude, onClick, onBoltClick, isSelected = false, onDragEnd }) => {
  const markerRef = useRef<HTMLDivElement>(null);
  const [showControls, setShowControls] = useState(false);

  const handleMarkerClick = (e: React.MouseEvent) => {
    // Prevent event from bubbling up to the map
    e.stopPropagation();

    // Log marker click
    console.log('Marker clicked');

    // Toggle controls visibility
    setShowControls(prev => !prev);

    // Call the onClick prop if provided
    if (onClick) {
      onClick();
    }
  };

  const handleDragEnd = (event: MarkerDragEvent) => {
    console.log('Marker dragged to:', event.lngLat);

    // Call the onDragEnd prop if provided
    if (onDragEnd) {
      onDragEnd(event.lngLat.lng, event.lngLat.lat);
    }
  };

  // Only render the marker if both longitude and latitude are provided
  if (longitude === undefined || latitude === undefined) {
    return null;
  }

  return (
    <Marker
      longitude={longitude}
      latitude={latitude}
      anchor="bottom"
      draggable={true}
      onDragEnd={handleDragEnd}
    >
      <div 
        ref={markerRef}
        style={{ position: 'relative' }}
        onClick={(e) => e.stopPropagation()}
      >
        {showControls && (
          <AssetControls 
            onBoltClick={onBoltClick || (() => console.log('Bolt clicked'))}
            onDeleteClick={() => console.log('Delete clicked')}
            onMoveClick={() => {
              console.log('Move clicked');
            }}
          />
        )}
        <img 
          src={isSelected ? windTurbineSelectedIcon : windTurbineIcon} 
          alt="Wind Turbine" 
          style={{ width: '60px', height: '60px', cursor: 'pointer' }}
          onClick={handleMarkerClick}
        />
      </div>
    </Marker>
  );
};

export default AssetMarker;
