import type MapboxDraw from '@mapbox/mapbox-gl-draw';
import ControlButton from '../../../shared/control-button/ControlButton';

/**
 * Props for the DeletePolygonButton component.
 */
interface DeletePolygonButtonProps {
    /**
     * Reference to the Mapbox Draw instance.
     */
    drawRef: React.RefObject<MapboxDraw | null>;

    /**
     * Controls whether the delete button should be shown.
     */
    isVisible: boolean;

    /**
     * Callback triggered after a polygon is deleted.
     */
    onPolygonDeleted: () => void;

    /**
     * Function to hide the map's layer control when deletion occurs.
     */
    hideLayerControl: () => void;
}

/**
 * A control button that allows the user to delete the current polygon
 * drawn on the map using Mapbox Draw.
 *
 * Once clicked, it removes all features from the draw instance,
 * calls a deletion callback, and hides the layer control panel.
 *
 * @param {DeletePolygonButtonProps} props - Component props.
 * @returns {JSX.Element | null} The rendered delete button or null if hidden.
 */
const DeletePolygonButton = ({
    drawRef,
    isVisible,
    onPolygonDeleted,
    hideLayerControl,
}: DeletePolygonButtonProps) => {
    /**
     * Handles click on the delete button. Deletes all drawn polygons,
     * calls the onPolygonDeleted callback, and hides the layer control.
     */
    const handleClick = () => {
        if (!drawRef.current) return;

        drawRef.current.deleteAll();
        onPolygonDeleted();
        hideLayerControl();
    };

    if (!isVisible) return null;

    return (
        <ControlButton onClick={handleClick} aria-label="Delete polygon" showTooltip={true}>
            <img
                src="/icons/delete-polygon.svg"
                alt="Delete polygon icon"
                width={24}
                height={24}
            />
        </ControlButton>
    );
};

export default DeletePolygonButton;
