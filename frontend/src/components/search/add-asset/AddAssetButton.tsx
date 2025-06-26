import { Box, styled } from '@mui/material';
import { useEffect, useState } from 'react';
import type { MapRef } from 'react-map-gl/maplibre';
import ControlButton from '../../../shared/control-button/ControlButton';
import AddAssetPanel from './AddAssetPanel';

const StyledContainer = styled(Box)({
    position: 'relative',
});

interface AddAssetButtonProps {
    mapRef: React.RefObject<MapRef>;
    isPanelOpen: boolean;
    onAssetSelect: (placing: boolean) => void;
    setIsPanelOpen: (isPanelOpen: boolean) => void;
}

const AddAssetButton = ({ mapRef, isPanelOpen, onAssetSelect, setIsPanelOpen }: AddAssetButtonProps) => {
    const [isHeatmapPresent, setIsHeatmapPresent] = useState(false);

    useEffect(() => {
        const map = mapRef.current?.getMap();
        if (!map) return;

        const checkLayer = () => {
            const hasHeatmap = !!map.getLayer('heatmap-layer');
            setIsHeatmapPresent(hasHeatmap);
        };

        map.on('styledata', checkLayer);
        checkLayer();

        return () => {
            map.off('styledata', checkLayer);
        };
    }, [mapRef]);

    const handleTogglePanel = () => {
        setIsPanelOpen(!isPanelOpen);
    };

    const handleClosePanel = () => {
        setIsPanelOpen(false);
    };

    const handleAssetSelect = () => {
        onAssetSelect(true);
        setIsPanelOpen(false);
    };

    if (!isHeatmapPresent) return null;

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
