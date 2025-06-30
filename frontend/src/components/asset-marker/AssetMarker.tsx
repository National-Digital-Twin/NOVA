import { useRef, useState } from 'react';
import { Marker, type MapRef, type MarkerDragEvent } from 'react-map-gl/maplibre';
import unselected_turbine_icon from '../../assets/Windturbine_blue_unselected.svg';
import selected_turbine_icon from '../../assets/Windturbine_blue_selected.svg';
import white_turbine_icon from '../../assets/white_turbine.svg';
import { MapVisualHelper } from '../../utils/MapVisualHelper';
import { useMapStore } from '../../stores/useMapStore';
import { SubstationsListContainer } from '../map-substations-list';
import AssetControls from './AssetControls';

interface AssetMarkerProps {
    longitude?: number;
    latitude?: number;
    mapRef?: React.RefObject<MapRef>;
    onClick?: () => void;
    onBoltClick?: () => void;
    onDragEnd?: (longitude: number, latitude: number) => void;
    setIsPanelOpen?: (isPanelOpen: boolean) => void;
    setPlacing?: React.Dispatch<React.SetStateAction<boolean>>;
}

export enum MarkerStatus {
    Draft,
    Connecting,
    Final
}

/**
 * A reusable component for displaying a wind turbine marker on the map
 */
const AssetMarker: React.FC<AssetMarkerProps> = ({
    longitude,
    latitude,
    onBoltClick,
    onDragEnd,
    setIsPanelOpen,
}) => {
    const markerRef = useRef<HTMLDivElement>(null);
    const [showControls, setShowControls] = useState(false);
    const [showSubstationsList, setShowSubstationsList] = useState(false);
    const setPlacing = useMapStore((s) => s.setPlacing);
    const setMarkerPosition = useMapStore((s) => s.setMarkerPosition);
    const setMaskLayerId = useMapStore((s) => s.setMaskLayerId);
    const setMaskLayerSourceId = useMapStore((s) => s.setMaskLayerSourceId);
    const preventPolygonEdit = useMapStore((s) => s.preventPolygonEdit);
    const markerStatus = useMapStore((s) => s.markerStatus);

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

    setMaskLayerId(MapVisualHelper.maskLayerId);
    setMaskLayerSourceId(MapVisualHelper.maskLayerSourceId);

    // Only render the marker if both longitude and latitude are provided
    if (longitude === undefined || latitude === undefined) {
        return null;
    }

    const getMarkerImg = () => {
        switch (markerStatus) {
            case MarkerStatus.Draft:
                return unselected_turbine_icon
            case MarkerStatus.Connecting:
                return white_turbine_icon
            default:
                return selected_turbine_icon
        }
    }

    const getMarkerSize = () => {
        if (markerStatus === MarkerStatus.Connecting) {
            return 100;
        } else {
            return 60;
        }
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
                            setShowSubstationsList={setShowSubstationsList}
                            setShowControls={setShowControls}
                        />
                    </div>
                )}
                <img
                    src={ getMarkerImg() }
                    alt="Wind Turbine"
                    style={{ width: `${getMarkerSize()}px`, height: `${getMarkerSize()}px`, cursor: 'pointer' }}
                    onClick={ handleMarkerClick }
                />
            </div>
        </Marker>
    );
};

export default AssetMarker;
