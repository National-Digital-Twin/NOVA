import { Box, styled } from '@mui/material';
import ControlButton from '../../../shared/control-button/ControlButton';
import { useMapStore } from '../../../stores/useMapStore';
import { MapVisualHelper } from '../../../utils/MapVisualHelper';
import { MarkerStatus } from '../../asset-marker/AssetMarker';

const StyledContainer = styled(Box)({
    position: 'relative',
});

interface ExitConnectGridViewButtonProps {
}

const ExitConnectGridViewButton = ({ }: ExitConnectGridViewButtonProps) => {
    const setGridConnectViewActive = useMapStore((s) => s.setGridConnectViewActive);
    const mapRef = useMapStore((s) => s.mapRef);
    const flyToLocation = useMapStore((s) => s.flyToLocation);
    const markerPosition = useMapStore((s) => s.markerPosition);
    const setMarkerStatus = useMapStore((s) => s.setMarkerStatus);

    const removeGridLayers = () => {
        removeLayer(MapVisualHelper.connectionLineLayerId);
        removeLayer(MapVisualHelper.powerLineLayerId);
        removeLayer(MapVisualHelper.substationLayerId);
    }

    const removeLayer = (layerId: string) => {
        const map = mapRef?.getMap();
        if (!map) return;

        if (map.getSource(layerId) && map.getLayer(layerId)) {
            map.removeLayer(layerId);
            map.removeSource(layerId);
        }
    }

    const exitGridConnectView = () => {
        setGridConnectViewActive(false);
        setMarkerStatus(MarkerStatus.Final);
        removeGridLayers();
        if (markerPosition && markerPosition.latitude && markerPosition.longitude) flyToLocation(markerPosition.latitude, markerPosition.longitude, 7);
    };

    return (
        <StyledContainer>
            <ControlButton onClick={exitGridConnectView} aria-label="Exit connect grid view">
                <span style={{ marginRight: '8px', color: '#e60000', fontWeight: 'bold' }}>Exit connect grid view</span>
                <img src="/icons/delete-polygon.svg" alt="Exit icon" width={24} height={24} />
            </ControlButton>
        </StyledContainer>
    );
};

export default ExitConnectGridViewButton;
