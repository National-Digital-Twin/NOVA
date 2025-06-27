import { useMapStore } from '../../../stores/useMapStore';
import ControlIcon from '../../../shared/control-icon/ControlIcon';

interface DeletePolygonButtonProps {
    deletePolygon: () => void;
}

const DeletePolygonButton = ({ deletePolygon }: DeletePolygonButtonProps) => {
    const polygonStatus = useMapStore((s) => s.polygonStatus);
    const isVisible = polygonStatus === 'editing' || polygonStatus === 'confirmed';

    if (!isVisible) return null;

    return (
        <ControlIcon onClick={deletePolygon} aria-label="Delete polygon" showTooltip={true}>
            <img src="/icons/delete-polygon.svg" alt="Delete polygon icon" width={24} height={24} />
        </ControlIcon>
    );
};

export default DeletePolygonButton;