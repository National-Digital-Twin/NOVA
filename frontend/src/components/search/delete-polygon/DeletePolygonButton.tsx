import type MapboxDraw from '@mapbox/mapbox-gl-draw';
import ControlButton from '../../../shared/control-button/ControlButton';

interface DeletePolygonButtonProps {
    onPolygonDeleted: () => void;
    drawRef: React.RefObject<MapboxDraw | null>;
    isVisible: boolean; 
}

const DeletePolygonButton = ({ drawRef, isVisible, onPolygonDeleted }: DeletePolygonButtonProps) => {

    const handleClick = () => {
        if (!drawRef.current) return;
        drawRef.current.deleteAll();
        onPolygonDeleted();
    };

    if (!isVisible) return null;

    return (
        <ControlButton onClick={handleClick} aria-label="Delete polygon">
            <img src="/icons/delete.svg" alt="Delete polygon" width={24} height={24} />
        </ControlButton>
    );
};

export default DeletePolygonButton;