import type MapboxDraw from '@mapbox/mapbox-gl-draw';
import ControlButton from '../../../shared/control-button/ControlButton';
import type { FeatureCollection, Geometry } from 'geojson';
import { MapVisualHelper } from '../../../utils/MapVisualHelper';
import type { MapRef } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import ConfirmPolygonButton from '../../map-controls/confirm-polygon/ConfirmPolygonButton';
import { createRoot } from 'react-dom/client';

interface EditPolygonButtonProps {
    onPolygonEdited: (geojson: FeatureCollection<Geometry>) => void;
    hideLayerControl: () => void;
    mapRef: React.RefObject<MapRef>;
    drawRef: React.RefObject<MapboxDraw | null>;
    polygonConfirmationPopUpRef: React.RefObject<maplibregl.Popup | null>;
    isVisible: boolean;
}

const EditPolygonButton = ({
    onPolygonEdited,
    hideLayerControl,
    mapRef,
    drawRef,
    polygonConfirmationPopUpRef,
    isVisible,
}: EditPolygonButtonProps) => {
    const handleClick = () => {
        const draw = drawRef.current;
        const map = mapRef.current?.getMap();
        if (!map || !draw) return;

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

        const handleUserFinishDragging = () => {
            const latestPolygon = MapVisualHelper.getFirstPolygon(draw);
            if (!latestPolygon) return;

            const popupNode = document.createElement('div');
            const popup = new maplibregl.Popup({
                closeButton: false,
                closeOnClick: false,
                offset: [0, 10]
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
                        onPolygonEdited(MapVisualHelper.getFeatureCollection(draw));
                    }}
                />
            );

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
        <ControlButton onClick={handleClick} aria-label="Edit polygon" showTooltip={true}>
            <img src="/icons/edit-polygon.svg" alt="Edit polygon" width={24} height={24} />
        </ControlButton>
    );
};

export default EditPolygonButton;
