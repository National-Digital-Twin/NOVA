import type { MapRef } from 'react-map-gl/maplibre';
import ControlButton from '../../../shared/control-button/ControlButton';

interface ZoomOutButtonProps {
    mapRef: React.RefObject<MapRef>;
}

const ZoomOutButton = ({ mapRef }: ZoomOutButtonProps) => {
    const handleClick = () => {
        const map = mapRef.current?.getMap();
        if (map) {
            map.zoomOut({ duration: 300 });
        }
    };

    return (
        <ControlButton onClick={handleClick} aria-label="Zoom Out">
            <img src="/icons/remove.svg" alt="Zoom out" width={24} height={24} />
        </ControlButton>
    );
};

export default ZoomOutButton;
