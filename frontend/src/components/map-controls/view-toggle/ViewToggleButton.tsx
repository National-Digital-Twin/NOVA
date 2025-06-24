import { Typography } from '@mui/material';
import { useState } from 'react';
import type { MapRef } from 'react-map-gl/maplibre';
import ControlIcon from '../../../shared/control-icon/ControlIcon';

interface ViewToggleButtonProps {
    mapRef: React.RefObject<MapRef>;
}

const ViewToggleButton = ({ mapRef }: ViewToggleButtonProps) => {
    const [is3D, setIs3D] = useState(true);

    const handleClick = () => {
        const map = mapRef.current?.getMap();
        if (map) {
            setIs3D(!is3D);
            map.easeTo({
                pitch: is3D ? 0 : 60,
                duration: 300,
            });
        }
    };

    return (
        <ControlIcon onClick={handleClick} aria-label={is3D ? 'Switch to 2D' : 'Switch to 3D'}>
            <Typography fontSize={20}>{is3D ? '2D' : '3D'}</Typography>
        </ControlIcon>
    );
};

export default ViewToggleButton;
