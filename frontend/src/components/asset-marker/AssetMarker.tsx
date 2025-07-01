import { useRef, useState } from 'react';
import unselected_turbine_icon from '../../assets/Windturbine_blue_unselected.svg';
import selected_turbine_icon from '../../assets/Windturbine_blue_selected.svg';
import white_turbine_icon from '../../assets/white_turbine.svg';
import { Marker } from 'react-map-gl/maplibre';
import { useMapStore } from '../../stores/useMapStore';
import { SubstationsListContainer } from '../map-substations-list';
import AssetControls from './AssetControls';
import { MarkerStatus } from './AssetMarkerStatus';
import AssetSpecificationPopup from './AssetSpecificationPopup';

interface AssetMarkerProps {
    longitude?: number;
    latitude?: number;
    onClick?: () => void;
    onBoltClick?: () => void;
    setIsPanelOpen?: (isPanelOpen: boolean) => void;
}

const AssetMarker: React.FC<AssetMarkerProps> = ({ longitude, latitude, onBoltClick, setIsPanelOpen }) => {
    const markerRef = useRef<HTMLDivElement>(null);
    const [hasOpened, setHasOpened] = useState(false);
    const [showControls, setShowControls] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [showSubstationsList, setShowSubstationsList] = useState(false);

    const setPlacing = useMapStore((s) => s.setPlacing);
    const setMarkerPosition = useMapStore((s) => s.setMarkerPosition);
    const markerStatus = useMapStore((s) => s.markerStatus);

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

    const getMarkerImg = () => {
        switch (markerStatus) {
            case MarkerStatus.Draft:
                return unselected_turbine_icon;
            case MarkerStatus.Connecting:
                return white_turbine_icon;
            default:
                return selected_turbine_icon;
        }
    };

    const getMarkerSize = () => {
        if (markerStatus === MarkerStatus.Connecting) {
            return 100;
        } else {
            return 60;
        }
    };

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
                        <SubstationsListContainer setShowSubstationsList={setShowSubstationsList} setShowControls={setShowControls} />
                    </div>
                )}
                <img
                    src={getMarkerImg()}
                    alt="Wind Turbine"
                    style={{
                        width: getMarkerSize(),
                        height: getMarkerSize(),
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
