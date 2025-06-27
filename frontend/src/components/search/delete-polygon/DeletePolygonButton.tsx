import { useCallback } from 'react';
import ControlIcon from '../../../shared/control-icon/ControlIcon';
import { useMapStore } from '../../../stores/useMapStore';

interface DeletePolygonButtonProps {
    isVisible: boolean;
    onPolygonDeleted: () => void;
}

const DeletePolygonButton = ({ isVisible, onPolygonDeleted }: DeletePolygonButtonProps) => {
    const drawRef = useMapStore((s) => s.drawRef);
    const setCachedHeatmap = useMapStore((s) => s.setCachedHeatmap);
    const setMarkerPosition = useMapStore((s) => s.setMarkerPosition);
    const setShowLayerControl = useMapStore((s) => s.setShowLayerControl);

    const handleClick = useCallback(() => {
        if (!drawRef) return;
        drawRef.deleteAll();
        setCachedHeatmap(null);
        setMarkerPosition(null);
        onPolygonDeleted();
        setShowLayerControl(false);
    }, [drawRef, setCachedHeatmap, setMarkerPosition, onPolygonDeleted, setShowLayerControl]);

    if (!isVisible) return null;

    return (
        <ControlIcon onClick={handleClick} aria-label="Delete polygon" showTooltip={true}>
            <img src="/icons/delete-polygon.svg" alt="Delete polygon icon" width={24} height={24} />
        </ControlIcon>
    );
};

export default DeletePolygonButton;
