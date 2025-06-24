import { Typography } from '@mui/material';
import { useState } from 'react';
import type { MapRef } from 'react-map-gl/maplibre';
import ControlIcon from '../../../shared/control-icon/ControlIcon';
import type { MapStyle } from '../../../types/map';

interface ViewToggleButtonProps {
    mapRef: React.RefObject<MapRef>;
    onStyleChange: (style: MapStyle) => void;
}

const ViewToggleButton = ({ mapRef, onStyleChange }: ViewToggleButtonProps) => {
    const [is3D, setIs3D] = useState(false);

    const handleClick = () => {
        const map = mapRef.current?.getMap();
        if (!map) return;

        const going3D = !is3D;
        setIs3D(going3D);

        // Switch map style
        onStyleChange(going3D ? 'hybrid' : 'basic');

        // Animate camera pitch
        map.easeTo({
            pitch: going3D ? 60 : 0,
            zoom: going3D ? Math.min(Math.max(map.getZoom(), 6), 15) : map.getZoom(),
            duration: 100,
        });
    };

    return (
        <ControlIcon onClick={handleClick} aria-label={is3D ? 'Switch to 2D' : 'Switch to 3D'}>
            <Typography fontSize={20}>{is3D ? '2D' : '3D'}</Typography>
        </ControlIcon>
    );
};

export default ViewToggleButton;