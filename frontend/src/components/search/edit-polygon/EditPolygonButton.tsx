import type MapboxDraw from '@mapbox/mapbox-gl-draw';
import ControlButton from '../../../shared/control-button/ControlButton';
import type { FeatureCollection, Geometry } from 'geojson';
import { MapVisualHelper } from '../../../utils/MapVisualHelper';
import type { MapRef } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import ConfirmPolygonButton from '../../map-controls/confirm-polygon/ConfirmPolygonButton';
import { createRoot } from 'react-dom/client';
import { useState } from 'react';

interface EditPolygonButtonProps {
    /**
     * Callback triggered after a polygon has been edited and confirmed by the user.
     */
    onPolygonEdited: (geojson: FeatureCollection<Geometry>) => void;

    /**
     * Function to hide the map's layer control while editing is active.
     */
    hideLayerControl: () => void;

    /**
     * Reference to the MapLibre map instance.
     */
    mapRef: React.RefObject<MapRef>;

    /**
     * Reference to the Mapbox Draw instance.
     */
    drawRef: React.RefObject<MapboxDraw | null>;

    /**
     * Ref to hold and manage the popup instance for confirmation.
     */
    polygonConfirmationPopUpRef: React.RefObject<maplibregl.Popup | null>;

    /**
     * Controls visibility of the edit button.
     */
    isVisible: boolean;
}

/**
 * EditPolygonButton renders a control button for initiating polygon editing
 * using Mapbox Draw on a MapLibre map. It enables direct selection of the polygon,
 * displays a confirmation popup after dragging, and updates the polygon's geometry.
 */
const EditPolygonButton = ({ onPolygonEdited, hideLayerControl, mapRef, drawRef, polygonConfirmationPopUpRef, isVisible }: EditPolygonButtonProps) => {
    const [isActive, setIsActive] = useState(false);

    /**
     * Handles the edit button click. It activates direct_select mode,
     * sets up a one-time drag completion listener, and displays a confirmation popup.
     */
    const handleClick = () => {
        if (isActive) return; // Exit if already in edit mode

        const draw = drawRef.current;
        const map = mapRef.current?.getMap();
        if (!map || !draw) return;

        setIsActive(true);
        hideLayerControl();
        MapVisualHelper.removeDimmedMask(map);
        MapVisualHelper.removeExistingPopup(polygonConfirmationPopUpRef);

        const polygon = MapVisualHelper.getFirstPolygon(draw);
        const polygonFeatureId = MapVisualHelper.getFeatureCollection(draw).features[0]?.id;

        if (!polygon || !polygonFeatureId) {
            console.warn('No valid polygon to edit');
            return;
        }

        draw.changeMode('direct_select', { featureId: polygonFeatureId });

        /**
         * Called once after user finishes dragging the polygon.
         * Displays a confirmation popup, updates the geometry, and handles future edits.
         */
        const handleUserFinishDragging = () => {
            const latestPolygon = MapVisualHelper.getFirstPolygon(draw);
            if (!latestPolygon) return;

            const popupNode = document.createElement('div');
            const popup = new maplibregl.Popup({
                closeButton: false,
                closeOnClick: false,
                offset: [0, 10],
            })
                .setLngLat(MapVisualHelper.getConfirmationPopupCoordinates(latestPolygon))
                .setDOMContent(popupNode)
                .addTo(map);

            polygonConfirmationPopUpRef.current = popup;

            createRoot(popupNode).render(
                <ConfirmPolygonButton
                    onConfirm={() => {
                        draw.changeMode('simple_select', { featureIds: [] });
                        MapVisualHelper.removeExistingPopup(polygonConfirmationPopUpRef);
                        setIsActive(false);
                        onPolygonEdited(MapVisualHelper.getFeatureCollection(draw));
                    }}
                />
            );

            /**
             * Keeps the confirmation popup anchored to the polygon's new position after edits.
             */
            const updatePopupPosition = () => {
                const updatedPolygon = MapVisualHelper.getFirstPolygon(draw);
                if (updatedPolygon) {
                    popup.setLngLat(MapVisualHelper.getConfirmationPopupCoordinates(updatedPolygon));
                }
            };

            updatePopupPosition();
            map.on('draw.update', updatePopupPosition);
            map.on('draw.selectionchange', updatePopupPosition);

            map.off('mouseup', handleUserFinishDragging);
            map.off('touchend', handleUserFinishDragging);
        };

        map.once('mouseup', handleUserFinishDragging);
        map.once('touchend', handleUserFinishDragging);
    };

    if (!isVisible) return null;

    return (
        <ControlButton onClick={handleClick} isActive={isActive} aria-label="Edit polygon" showTooltip={true}>
            <img src={isActive ? '/icons/edit-polygon-white.svg' : '/icons/edit-polygon.svg'} alt="Edit polygon icon" width={24} height={24} />
        </ControlButton>
    );
};

export default EditPolygonButton;
