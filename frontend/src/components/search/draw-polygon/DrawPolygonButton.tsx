import { useState } from 'react';
import type MapboxDraw from '@mapbox/mapbox-gl-draw';
import type { MapRef } from 'react-map-gl/maplibre';
import ControlIcon from '../../../shared/control-icon/ControlIcon';

interface DrawPolygonButtonProps {
    isVisible: boolean;
    mapRef: React.RefObject<MapRef>;
    drawRef: React.RefObject<MapboxDraw | null>;
    startPolygonDraw: () => void;
}

const DrawPolygonButton = ({ isVisible, startPolygonDraw }: DrawPolygonButtonProps) => {
    const [isActive, setIsActive] = useState(false);

    const handleClick = () => {
        setIsActive(true);
        startPolygonDraw();
    };

    if (!isVisible) return null;

    return (
        <ControlIcon
            onClick={handleClick}
            isActive={isActive}
            aria-label="Draw polygon"
            aria-pressed={isActive}
            showTooltip={true}
        >
            <img
                src={isActive ? '/icons/polygon-white.svg' : '/icons/polygon.svg'}
                alt="Draw polygon icon"
                width={24}
                height={24}
            />
        </ControlIcon>
    );
};

export default DrawPolygonButton;
