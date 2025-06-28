import { useRef, useState } from 'react';
import { Marker, type MarkerDragEvent } from 'react-map-gl/maplibre';
import windTurbineIcon from '../../assets/Windturbine_blue_unselected.svg';
import windTurbineSelectedIcon from '../../assets/Windturbine_blue_selected.svg';
import AssetControls from './AssetControls';
import { SubstationsListContainer } from '../map-substations-list';
import { useMapStore } from '../../stores/useMapStore';

interface AssetMarkerProps {
    longitude?: number;
    latitude?: number;
    onClick?: () => void;
    onBoltClick?: () => void;
    isSelected?: boolean;
    onDragEnd?: (longitude: number, latitude: number) => void;
    setIsPanelOpen?: (isPanelOpen: boolean) => void;
}

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

    const handleMarkerClick = (e: React.MouseEvent<HTMLImageElement>) => {
        e.preventDefault();
        setShowControls((v) => !v);
    };

    const handleDragEnd = (event: MarkerDragEvent) => {
        console.log('Marker dragged to:', event.lngLat);
        if (onDragEnd) {
            onDragEnd(event.lngLat.lng, event.lngLat.lat);
        }
    };

    // Only render if valid coordinates
    if (longitude === undefined || latitude === undefined) return null;

    return (
        <Marker
            longitude={longitude}
            latitude={latitude}
            anchor="bottom"
            draggable={true}
            onDragEnd={handleDragEnd}
        >
            <div ref={markerRef} style={{ position: 'relative' }}>
                {showControls && (
                    <div
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        onMouseUp={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                    >
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
                    </div>
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
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        onMouseUp={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
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
                    style={{ width: 60, height: 60, cursor: 'pointer', pointerEvents: 'auto' }}
                    onClick={handleMarkerClick}
                />
            </div>
        </Marker>
    );
};

export default AssetMarker;
