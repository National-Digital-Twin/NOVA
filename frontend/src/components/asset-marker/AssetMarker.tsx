import { useRef, useState } from 'react';
import { Marker, type MapRef, type MarkerDragEvent } from 'react-map-gl/maplibre';
import windTurbineIcon from '../../assets/Windturbine_blue_unselected.svg';
import windTurbineSelectedIcon from '../../assets/Windturbine_blue_selected.svg';
import AssetControls from './AssetControls';
import { SubstationsListContainer } from '../map-substations-list';
import { useMapStore } from '../../stores/useMapStore';

interface AssetMarkerProps {
    longitude?: number;
    latitude?: number;
    mapRef?: React.RefObject<MapRef>;
    onClick?: () => void;
    onBoltClick?: () => void;
    isSelected?: boolean;
    onDragEnd?: (longitude: number, latitude: number) => void;
    setIsPanelOpen?: (isPanelOpen: boolean) => void;
    setPlacing?: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * A reusable component for displaying a wind turbine marker on the map
 */
const AssetMarker: React.FC<AssetMarkerProps> = ({
    longitude,
    latitude,
    onBoltClick,
    isSelected = false,
    onDragEnd,
    setIsPanelOpen,
}) => {
    const markerRef = useRef<HTMLDivElement>(null);
    const [showControls, setShowControls] = useState(false);
    const [showSubstationsList, setShowSubstationsList] = useState(false);
    const setPlacing = useMapStore((s) => s.setPlacing);
    const setMarkerPosition = useMapStore((s) => s.setMarkerPosition);
    const preventPolygonEdit = useMapStore((s) => s.preventPolygonEdit);
    
    const handleMarkerClick = (e: React.MouseEvent) => {
        // handle event propogation
        e.stopPropagation();
        preventPolygonEdit(e.nativeEvent);

        // Toggle controls visibility
        setShowControls((prev) => !prev);
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
        <Marker longitude={longitude} latitude={latitude} anchor="bottom" draggable={true} onDragEnd={handleDragEnd}>
            <div ref={markerRef} style={{ position: 'relative' }}>
                {showControls && (
                    <AssetControls
                        onBoltClick={() => {
                            setShowSubstationsList((prev) => !prev);
                            if (onBoltClick) onBoltClick();
                        }}
                        onDeleteClick={() => {
                            if (setMarkerPosition) setMarkerPosition(null);
                        }}
                        onEditClick={() => {
                            if (setMarkerPosition) setMarkerPosition(null);
                            if (setIsPanelOpen) setIsPanelOpen(true);
                        }}
                        onMoveClick={() => {
                            if (setMarkerPosition) setMarkerPosition(null);
                            if (setPlacing) setPlacing(true);
                        }}
                    />
                )}
                {showSubstationsList && (
                    <div
                        style={{
                            position: 'absolute',
                            bottom: '-320px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 1000,
                            width: '250px',
                        }}
                    >
                        <SubstationsListContainer
                            longitude={longitude}
                            latitude={latitude}
                            onConfirm={(selected) => {
                                console.log(`Selected substation: ${selected.text}`);
                                setShowSubstationsList(false);
                            }}
                        />
                    </div>
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
