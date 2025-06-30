import AssetMarker from './AssetMarker';
import { useMapStore } from '../../stores/useMapStore';

interface Props {
    is3D: boolean;
    setIsPanelOpen?: (isPanelOpen: boolean) => void;
}

const AssetMarkerContainer = ({ is3D, setIsPanelOpen }: Props) => {
    const markerPosition = useMapStore((s) => s.markerPosition);
    if (!markerPosition || is3D) return null;

    return <AssetMarker longitude={markerPosition.longitude} latitude={markerPosition.latitude} setIsPanelOpen={setIsPanelOpen} />;
};

export default AssetMarkerContainer;
