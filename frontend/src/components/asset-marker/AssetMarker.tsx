import { useRef, useState } from 'react';
import { Marker } from 'react-map-gl/maplibre';
import windTurbineSelectedIcon from '../../assets/Windturbine_blue_selected.svg';
import windTurbineIcon from '../../assets/Windturbine_blue_unselected.svg';
import { useMapStore } from '../../stores/useMapStore';
import { SubstationsListContainer } from '../map-substations-list';
import AssetControls from './AssetControls';
import AssetSpecificationPopup from './AssetSpecificationPopup';

interface AssetMarkerProps {
    longitude?: number;
    latitude?: number;
    onClick?: () => void;
    onBoltClick?: () => void;
    isSelected?: boolean;
    setIsPanelOpen?: (isPanelOpen: boolean) => void;
}

const AssetMarker: React.FC<AssetMarkerProps> = ({ longitude, latitude, onBoltClick, isSelected = false, setIsPanelOpen }) => {
    const markerRef = useRef<HTMLDivElement>(null);
    const [hasOpened, setHasOpened] = useState(false);
    const [showControls, setShowControls] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [showSubstationsList, setShowSubstationsList] = useState(false);

    const setPlacing = useMapStore((s) => s.setPlacing);
    const setMarkerPosition = useMapStore((s) => s.setMarkerPosition);

    const handleMarkerClick = (e: React.MouseEvent<HTMLImageElement>) => {
        e.preventDefault();
        setShowControls((v) => !v);
    };

    // Only render if valid coordinates
    if (longitude === undefined || latitude === undefined) return null;

    if (!hasOpened) {
        setHasOpened(true);
        setShowControls(true);
    }

    return (
        <Marker longitude={longitude} latitude={latitude} anchor="bottom" draggable={false}>
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
                                if (setIsPanelOpen) setIsPanelOpen(true);
                            }}
                            onMoveClick={() => {
                                if (setMarkerPosition) setMarkerPosition(null);
                                if (setPlacing) setPlacing(true);
                            }}
                        />
                        {showPopup && <AssetSpecificationPopup />}
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
                        <SubstationsListContainer longitude={longitude} latitude={latitude} onConfirm={() => setShowSubstationsList(false)} />
                    </div>
                )}
                <img
                    src={isSelected ? windTurbineSelectedIcon : windTurbineIcon}
                    alt="Wind Turbine"
                    style={{
                        width: 60,
                        height: 60,
                        cursor: 'pointer',
                        pointerEvents: 'auto',
                    }}
                    onClick={handleMarkerClick}
                    onMouseEnter={() => setShowPopup(true)}
                    onMouseLeave={() => setShowPopup(false)}
                />
            </div>
        </Marker>
    );
};

export default AssetMarker;
