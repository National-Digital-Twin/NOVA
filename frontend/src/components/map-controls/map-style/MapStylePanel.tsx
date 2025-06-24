import { FormControl, FormControlLabel, Radio, RadioGroup, styled, Typography } from '@mui/material';
import { useState } from 'react';
import type { MapStyle } from '../../../types/map';
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

const MapStyleTitle = styled(Typography)(({ theme }) => ({
    marginBottom: theme.spacing(1),
}));

interface MapStylePanelProps {
    currentStyle: MapStyle;
    onStyleChange: (style: MapStyle) => void;
}

const MapStylePanel = ({ currentStyle, onStyleChange }: MapStylePanelProps) => {
    const [showPanel, setShowPanel] = useState(false);

    const handleStyleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newStyle = event.target.value as MapStyle;
        if (newStyle !== currentStyle) {
            onStyleChange(newStyle);
        }
        setShowPanel(false);
    };

    return (
        <div style={{ position: 'relative' }}>
            <ControlIcon onClick={() => setShowPanel(!showPanel)} aria-label="Change map style" aria-expanded={showPanel} aria-controls="map-style-panel">
                <img src="/icons/layers.svg" alt="Layers" width={24} height={24} />
            </ControlIcon>

            {showPanel && (
                <StyledPanel id="map-style-panel" role="dialog" aria-label="Map style options" style={{ right: 'calc(100% + 1rem)' }}>
                    <FormControl component="fieldset">
                        <MapStyleTitle variant="subtitle1">Map Styles</MapStyleTitle>
                        <RadioGroup value={currentStyle} onChange={handleStyleChange}>
                            <FormControlLabel value="basic" control={<Radio />} label="Basic" />
                            <FormControlLabel value="osm" control={<Radio />} label="Streets" />
                            <FormControlLabel value="hybrid" control={<Radio />} label="Satellite" />
                            <FormControlLabel value="bright" control={<Radio />} label="Bright" />
                        </RadioGroup>
                    </FormControl>
                </StyledPanel>
            )}
        </div>
    );
};

export default MapStylePanel;
