import type MapboxDraw from '@mapbox/mapbox-gl-draw';
import ControlButton from '../../../shared/control-button/ControlButton';

interface DeletePolygonButtonProps {
    drawRef: React.RefObject<MapboxDraw | null>;
    isVisible: boolean;
    onPolygonDeleted: () => void;
    hideLayerControl: () => void;
}

const DeletePolygonButton = ({ drawRef, isVisible, onPolygonDeleted, hideLayerControl }: DeletePolygonButtonProps) => {

    const handleClick = () => {
        if (!drawRef.current) return;
        drawRef.current.deleteAll();
        onPolygonDeleted();
        hideLayerControl();
    };

    if (!isVisible) return null;

    return (
        <ControlButton onClick={handleClick} aria-label="Delete polygon" showTooltip={true}>
            <img src="/icons/delete-polygon.svg" alt="Delete polygon" width={24} height={24} />
        </ControlButton>
    );
};

export default DeletePolygonButton;