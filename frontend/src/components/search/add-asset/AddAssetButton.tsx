import { Box, styled } from '@mui/material';
import { useState } from 'react';
import ControlButton from '../../../shared/control-button/ControlButton';
import type { Variation } from './AddAsset';
import AddAssetPanel from './AddAssetPanel';

const StyledContainer = styled(Box)({
    position: 'relative',
});

interface AddAssetButtonProps {
    onAssetSelect: (variant: Variation) => void;
}

const AddAssetButton = ({ onAssetSelect }: AddAssetButtonProps) => {
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    const handleTogglePanel = () => {
        setIsPanelOpen(!isPanelOpen);
    };

    const handleClosePanel = () => {
        setIsPanelOpen(false);
    };

    const handleAssetSelect = (variant: Variation) => {
        onAssetSelect(variant);
        setIsPanelOpen(false);
    };

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
