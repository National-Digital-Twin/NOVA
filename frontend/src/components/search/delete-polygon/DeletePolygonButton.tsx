import type MapboxDraw from '@mapbox/mapbox-gl-draw';
import ControlButton from '../../../shared/control-button/ControlButton';
import { useLayerPanel } from '../../layer-selection/LayerPanelContext';

interface DeletePolygonButtonProps {
    onPolygonDeleted: () => void;
    drawRef: React.RefObject<MapboxDraw | null>;
    isVisible: boolean; 
}

const DeletePolygonButton = ({ drawRef, isVisible, onPolygonDeleted }: DeletePolygonButtonProps) => {

    const { hideLayerControl: hideLayerControl } = useLayerPanel();

    const handleClick = () => {
        if (!drawRef.current) return;
        drawRef.current.deleteAll();
        onPolygonDeleted();
        hideLayerControl();
    };

    if (!isVisible) return null;

    return (
        <ControlButton onClick={handleClick} aria-label="Delete polygon">
            <img src="/icons/delete-polygon.svg" alt="Delete polygon" width={24} height={24} />
        </ControlButton>
    );
};

export default DeletePolygonButton;