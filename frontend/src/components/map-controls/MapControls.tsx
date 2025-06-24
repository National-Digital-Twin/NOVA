import { Box, styled } from '@mui/material';
import type { MapRef } from 'react-map-gl/maplibre';
import type { MapStyle } from '../../types/map';
import CompassButton from './compass/CompassButton';
import MapLegendPanel from './map-legend/MapLegendPanel';
import MapStylePanel from './map-style/MapStylePanel';
import ViewToggleButton from './view-toggle/ViewToggleButton';
import ZoomInButton from './zoom-in/ZoomInButton';
import ZoomOutButton from './zoom-out/ZoomOutButton';

const ControlsContainer = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    position: 'absolute',
    right: '1rem',
    top: '1rem',
    zIndex: 1,
});

const ControlGroup = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[2],
    display: 'flex',
    flexDirection: 'column',
}));

const ControlDivider = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.divider,
    height: 2,
    width: '100%',
}));

interface MapControlsProps {
    mapRef: React.RefObject<MapRef>;
    onStyleChange: (style: MapStyle) => void;
    currentStyle: MapStyle;
}

const MapControls = ({ mapRef, onStyleChange, currentStyle }: MapControlsProps) => {
    return (
        <ControlsContainer>
            <ControlGroup role="group" aria-label="View controls">
                <CompassButton mapRef={mapRef} />
                <ControlDivider />
                <ViewToggleButton mapRef={mapRef} />
            </ControlGroup>

            <ControlGroup role="group" aria-label="Zoom controls">
                <ZoomInButton mapRef={mapRef} />
                <ControlDivider />
                <ZoomOutButton mapRef={mapRef} />
            </ControlGroup>

            <ControlGroup role="group" aria-label="Map style controls">
                <MapStylePanel onStyleChange={onStyleChange} currentStyle={currentStyle} />
            </ControlGroup>

            <ControlGroup role="group" aria-label="Map legend controls">
                <MapLegendPanel mapRef={mapRef} />
            </ControlGroup>
        </ControlsContainer>
    );
};

export default MapControls;
