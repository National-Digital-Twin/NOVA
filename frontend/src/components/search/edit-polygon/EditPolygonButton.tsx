import type MapboxDraw from '@mapbox/mapbox-gl-draw';
import type { FeatureCollection, Geometry } from 'geojson';
import maplibregl from 'maplibre-gl';
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { MapRef } from 'react-map-gl/maplibre';
import ControlIcon from '../../../shared/control-icon/ControlIcon';
import { MapVisualHelper } from '../../../utils/MapVisualHelper';
import ConfirmPolygonButton from '../../map-controls/confirm-polygon/ConfirmPolygonButton';

interface EditPolygonButtonProps {
    onPolygonEdited: (geojson: FeatureCollection<Geometry>) => void;
    hideLayerControl: () => void;
    mapRef: React.RefObject<MapRef>;
    drawRef: React.RefObject<MapboxDraw | null>;
    polygonConfirmationPopUpRef: React.RefObject<maplibregl.Popup | null>;
    isVisible: boolean;
}

const EditPolygonButton = ({ onPolygonEdited, hideLayerControl, mapRef, drawRef, polygonConfirmationPopUpRef, isVisible }: EditPolygonButtonProps) => {
    const [isActive, setIsActive] = useState(false);

    const handleClick = () => {
        if (isActive) return;

        const draw = drawRef.current;
        const map = mapRef.current?.getMap();
        if (!map || !draw) return;

        setIsActive(true);
        hideLayerControl();
        MapVisualHelper.removeDimmedMask(map);
        MapVisualHelper.removeExistingPopup(polygonConfirmationPopUpRef);
        MapVisualHelper.removeHeatmapLayer(mapRef);

        map.getCanvas().style.cursor = 'grab';

        const polygon = MapVisualHelper.getFirstPolygon(draw);
        const polygonFeatureId = MapVisualHelper.getFeatureCollection(draw).features[0]?.id;

        if (!polygon || !polygonFeatureId) {
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
                offset: [0, 10],
            })
                .setLngLat(MapVisualHelper.getConfirmationPopupCoordinates(latestPolygon, mapRef.current))
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

            const updatePopupPosition = () => {
                const updatedPolygon = MapVisualHelper.getFirstPolygon(draw);
                if (updatedPolygon) {
                    popup.setLngLat(MapVisualHelper.getConfirmationPopupCoordinates(updatedPolygon, mapRef.current));
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
        <ControlIcon onClick={handleClick} aria-label="Edit Polygon">
            <img src={'/icons/edit-polygon.svg'} alt="Edit polygon icon" width={24} height={24} />
        </ControlIcon>
    );
};

export default EditPolygonButton;
