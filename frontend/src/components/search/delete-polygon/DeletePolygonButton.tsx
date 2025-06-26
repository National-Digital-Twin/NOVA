import type MapboxDraw from '@mapbox/mapbox-gl-draw';
import { useCallback } from 'react';
import ControlIcon from '../../../shared/control-icon/ControlIcon';
import { useMapStore } from '../../../stores/useMapStore';

interface DeletePolygonButtonProps {
    drawRef: React.RefObject<MapboxDraw | null>;
    isVisible: boolean;
    onPolygonDeleted: () => void;
    hideLayerControl: () => void;
}

const DeletePolygonButton = ({ drawRef, isVisible, onPolygonDeleted, hideLayerControl }: DeletePolygonButtonProps) => {
    const setCachedHeatmap = useMapStore((s) => s.setCachedHeatmap);
    const setMarkerPosition = useMapStore((s) => s.setMarkerPosition);
    
    const handleClick = useCallback(() => {
        if (!drawRef.current) return;
        drawRef.current.deleteAll();
        setCachedHeatmap(null);
        setMarkerPosition(null);
        onPolygonDeleted();
        hideLayerControl();
    }, [drawRef, setCachedHeatmap, setMarkerPosition, onPolygonDeleted, hideLayerControl]);

    if (!isVisible) return null;

    return (
        <ControlIcon onClick={handleClick} aria-label="Delete polygon" showTooltip={true}>
            <img src="/icons/delete-polygon.svg" alt="Delete polygon icon" width={24} height={24} />
        </ControlIcon>
    );
};

export default DeletePolygonButton;
