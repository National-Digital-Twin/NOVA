import { Box, styled, Typography } from '@mui/material';
import { useState } from 'react';
import ControlButton from '../../../shared/control-button/ControlButton';

const StyledPanel = styled('div')(({ theme }) => ({
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: '220px',
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[3],
    zIndex: 1,
}));

const LegendTitle = styled(Typography)(({ theme }) => ({
    marginBottom: theme.spacing(1),
}));

const LegendSubtitle = styled(Typography)(({ theme }) => ({
    marginBottom: theme.spacing(1),
    color: theme.palette.text.secondary,
}));

const LegendItem = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
}));

const ColorLine = styled(Box, {
    shouldForwardProp: prop => prop !== 'color',
})<{ color: string }>(({ color, theme }) => ({
    width: '2rem',
    height: '4px',
    backgroundColor: color,
    marginRight: theme.spacing(1),
}));

const MapLegendPanel = () => {
    const [showPanel, setShowPanel] = useState(false);

    return (
        <div style={{ position: 'relative' }}>
            <ControlButton onClick={() => setShowPanel(!showPanel)} aria-label="Show map legend" aria-expanded={showPanel} aria-controls="map-legend-panel">
                <img src="/icons/legend.svg" alt="Legend" width={24} height={24} />
            </ControlButton>

            {showPanel && (
                <StyledPanel id="map-legend-panel" role="dialog" aria-label="Map legend" style={{ right: 'calc(100% + 1rem)' }}>
                    <LegendTitle variant="subtitle1">Legend</LegendTitle>
                    <LegendSubtitle variant="subtitle2">Location Suitability</LegendSubtitle>
                    <LegendItem>
                        <ColorLine color="#4CAF50" data-testid="color-line" />
                        <span>Most Suitable</span>
                    </LegendItem>
                    <LegendItem>
                        <ColorLine color="#FF9800" data-testid="color-line" />
                        <span>Moderate Suitability</span>
                    </LegendItem>
                    <LegendItem>
                        <ColorLine color="#F44336" data-testid="color-line" />
                        <span>Least Suitable</span>
                    </LegendItem>
                </StyledPanel>
            )}
        </div>
    );
};

export default MapLegendPanel;
