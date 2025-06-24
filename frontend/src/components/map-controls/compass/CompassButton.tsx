import { useCallback, useEffect, useState } from 'react';
import type { MapRef } from 'react-map-gl/maplibre';
import ControlIcon from '../../../shared/control-icon/ControlIcon';

interface CompassButtonProps {
    mapRef: React.RefObject<MapRef>;
}

const CompassButton = ({ mapRef }: CompassButtonProps) => {
    const [bearing, setBearing] = useState(0);

    useEffect(() => {
        const map = mapRef.current?.getMap();
        if (!map) return;

        const updateBearing = () => {
            setBearing(map.getBearing());
        };

        map.on('move', updateBearing);
        updateBearing();

        return () => {
            map.off('move', updateBearing);
        };
    }, [mapRef]);

    const handleClick = useCallback(() => {
        const map = mapRef.current?.getMap();
        if (map) {
            map.easeTo({
                bearing: 0,
                duration: 1000,
            });
        }
    }, [mapRef]);

    return (
        <ControlIcon onClick={handleClick} aria-label="Reset View">
            <img src="/icons/compass.svg" alt="Reset view" style={{ transform: `rotate(${-bearing}deg)` }} />
        </ControlIcon>
    );
};

export default CompassButton;
