import type MapboxDraw from '@mapbox/mapbox-gl-draw';
import ControlButton from '../../../shared/control-button/ControlButton';

interface DeletePolygonButtonProps {
    drawRef: React.RefObject<MapboxDraw | null>;
}

const DeletePolygonButton = ({ drawRef }: DeletePolygonButtonProps) => {
    const handleClick = () => {
        if (!drawRef.current) return;
        drawRef.current.deleteAll();
    };

    return (
        <ControlButton onClick={handleClick} aria-label="Delete polygon">
            <img src="/icons/delete.svg" alt="Delete polygon" width={24} height={24} />
        </ControlButton>
    );
};

export default DeletePolygonButton;
