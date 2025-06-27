import { useCallback } from 'react';
import AssetMarker from './AssetMarker';
import { useMapStore } from '../../stores/useMapStore';

interface Props {
    is3D: boolean;
    setIsPanelOpen?: (isPanelOpen: boolean) => void;
}

const AssetMarkerContainer = ({ is3D, setIsPanelOpen }: Props) => {
    const markerPosition = useMapStore((s) => s.markerPosition);
    const setMarkerPosition = useMapStore((s) => s.setMarkerPosition);

    const handleMarkerDragEnd = useCallback(
        (longitude: number, latitude: number) => {
            console.log('Marker position updated:', { longitude, latitude });
            setMarkerPosition({ longitude, latitude });
        },
        [setMarkerPosition]
    );

    if (!markerPosition || is3D) return null;

    return (
        <AssetMarker longitude={markerPosition.longitude} latitude={markerPosition.latitude} onDragEnd={handleMarkerDragEnd} setIsPanelOpen={setIsPanelOpen} />
    );
};

export default AssetMarkerContainer;
