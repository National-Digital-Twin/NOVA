import { Box, styled, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import type { MapRef } from 'react-map-gl/maplibre';
import ControlIcon from '../../../shared/control-icon/ControlIcon';

const StyledPanel = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[3],
    minWidth: '220px',
    padding: theme.spacing(2),
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1,
}));

const LegendTitle = styled(Typography)(({ theme }) => ({
    marginBottom: theme.spacing(1),
}));

const LegendSubtitle = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
}));

const LegendItem = styled(Box)(({ theme }) => ({
    alignItems: 'center',
    display: 'flex',
    marginBottom: theme.spacing(1),
}));

const ColorLine = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'color',
})<{ color: string }>(({ color, theme }) => ({
    backgroundColor: color,
    height: '4px',
    marginRight: theme.spacing(1),
    width: '2rem',
}));

interface MapLegendPanelProps {
    mapRef: React.RefObject<MapRef>;
}

const MapLegendPanel = ({ mapRef }: MapLegendPanelProps) => {
    const [showPanel, setShowPanel] = useState(false);
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

    if (!isHeatmapPresent) return null;

    return (
        <div style={{ position: 'relative' }}>
            <ControlIcon onClick={() => setShowPanel(!showPanel)} aria-label="Show map legend" aria-expanded={showPanel} aria-controls="map-legend-panel">
                <img src="/icons/legend.svg" alt="Legend" width={24} height={24} />
            </ControlIcon>

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
