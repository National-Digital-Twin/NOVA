import type { MapRef } from 'react-map-gl/maplibre';
import ControlIcon from '../../../shared/control-icon/ControlIcon';

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
        <ControlIcon onClick={handleClick} aria-label="Zoom Out">
            <img src="/icons/remove.svg" alt="Zoom out" width={24} height={24} />
        </ControlIcon>
    );
};

export default ZoomOutButton;
