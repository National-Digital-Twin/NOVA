import { useState, useEffect, useRef } from 'react';
import { Marker } from 'react-map-gl/maplibre';
import type { MapRef } from 'react-map-gl/maplibre';
import windTurbineIcon from '../../assets/Windturbine_blue_unselected.svg';
import windTurbineSelectedIcon from '../../assets/Windturbine_blue_selected.svg';
import { SubstationsList, fetchSubstations } from '../map-substations-list';
import type {ListItem} from "../map-substations-list/SubstationsList";

interface AssetMarkerProps {
  longitude: number;
  latitude: number;
  mapRef?: React.RefObject<MapRef>;
}

/**
 * A reusable component for displaying a wind turbine marker on the map
 */
const AssetMarker: React.FC<AssetMarkerProps> = ({ longitude, latitude }) => {
  const [isListVisible, setIsListVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [substations, setSubstations] = useState<ListItem[]>([]);
  const markerRef = useRef<HTMLDivElement>(null);



  // Create a ref for the substations list
  const listRef = useRef<HTMLDivElement>(null);

  const handleMarkerClick = async () => {
    // Log marker click
    console.log('Marker clicked');

    // Determine if we're opening or closing the list
    const willBeVisible = !isListVisible;

    // Toggle the list visibility
    setIsListVisible(willBeVisible);

    // Only fetch data if we're opening the list
    if (willBeVisible) {
      // Fetch substations data when marker is clicked
      setIsLoading(true);
      setError(null);

      fetchSubstations(longitude, latitude)
        .then(result => {
          setSubstations(result.items);
          setError(result.error);
        })
        .catch(err => {
          console.error('Error in handleMarkerClick:', err);
          setError('Failed to load substations');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  // Handle clicks outside the marker and list to close the popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Store the original target that was clicked
      const clickedElement = event.target as Node;

      // Check if the click was on the marker, the list, or their children
      const isClickInsideMarker = markerRef.current && markerRef.current.contains(clickedElement);
      const isClickInsideList = listRef.current && listRef.current.contains(clickedElement);

      // Only close if the click is outside both the marker and the list
      if (!isClickInsideMarker && !isClickInsideList && isListVisible) {
        setIsListVisible(false);
      }
    };

    // Add event listener when popup is visible
    if (isListVisible) {
      // Use mousedown instead of click to ensure this runs before the marker's click handler
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Clean up the event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isListVisible]);

  // Handle confirmation from the list
  const handleConfirm = (selected: ListItem) => {
    //setSelectedItem(selected);
    console.log(`Selected turbine: ${selected.text}`);
    // Close the list after selection
    setIsListVisible(false);

  };


  return (
    <Marker
      longitude={longitude}
      latitude={latitude}
      anchor="bottom"
    >
      <div 
        ref={markerRef}
        style={{ position: 'relative' }}
        >
        <img 
          src={isListVisible ? windTurbineSelectedIcon : windTurbineIcon} 
          alt="Wind Turbine" 
          style={{ width: '60px', height: '60px', cursor: 'pointer' }}
          onClick={handleMarkerClick}
        />
        {isListVisible && (
          <div 
            ref={listRef}
            style={{ 
              position: 'absolute', 
              top: '100%', 
              left: '50%', 
              transform: 'translateX(-50%)',
              zIndex: 1000,
              marginTop: '5px',
              width: '250px' // Set a fixed width for the list
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
      </div>
    </Marker>
  );
};

export default AssetMarker;