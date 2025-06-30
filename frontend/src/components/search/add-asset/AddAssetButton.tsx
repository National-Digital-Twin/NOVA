import { Box, styled } from '@mui/material';
import ControlButton from '../../../shared/control-button/ControlButton';
import AddAssetPanel from './AddAssetPanel';
import { useMapStore } from '../../../stores/useMapStore';

const StyledContainer = styled(Box)({
    position: 'relative',
});

interface AddAssetButtonProps {
    isPanelOpen: boolean;
    setIsPanelOpen: (isPanelOpen: boolean) => void;
}

const AddAssetButton = ({ isPanelOpen, setIsPanelOpen }: AddAssetButtonProps) => {
    const setPlacing = useMapStore((s) => s.setPlacing);
    const markerPlaced = useMapStore((s) => s.markerPosition);
    const cachedHeatmap = useMapStore((s) => s.cachedHeatmap);

    const handleTogglePanel = () => {
        setIsPanelOpen(!isPanelOpen);
    };

    const handleClosePanel = () => {
        setIsPanelOpen(false);
    };

    const handleAssetSelect = () => {
        setPlacing(true);
        setIsPanelOpen(false);
    };

    if (!cachedHeatmap) return null;

    // Hide add asset button if marker already placed
    if (markerPlaced) return null;

    return (
        <StyledContainer>
            <ControlButton onClick={handleTogglePanel} aria-label="Add asset">
                <span style={{ marginRight: '8px' }}>Add asset</span>
                <img src="/icons/add.svg" alt="Add asset" width={18} height={18} />
            </ControlButton>
            {isPanelOpen && <AddAssetPanel onClose={handleClosePanel} onSelect={handleAssetSelect} />}
        </StyledContainer>
    );
};

export default AddAssetButton;
