import { Box, styled } from '@mui/material';
import ControlButton from '../../../shared/control-button/ControlButton';
import { useMapStore } from '../../../stores/useMapStore';
import { MapVisualHelper } from '../../../utils/MapVisualHelper';
import { MarkerStatus } from '../../asset-marker/AssetMarkerStatus';

const StyledContainer = styled(Box)({
    position: 'relative',
});

const ExitConnectGridViewButton = () => {
    const setGridConnectViewActive = useMapStore((s) => s.setGridConnectViewActive);
    const markerPosition = useMapStore((s) => s.markerPosition);
    const setMarkerStatus = useMapStore((s) => s.setMarkerStatus);

    const exitGridConnectView = () => {
        setGridConnectViewActive(false);
        setMarkerStatus(MarkerStatus.Final);
        MapVisualHelper.removeGridLayers();
        if (markerPosition && markerPosition.latitude && markerPosition.longitude)
            MapVisualHelper.flyToLocation(markerPosition.latitude, markerPosition.longitude, 7);
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
