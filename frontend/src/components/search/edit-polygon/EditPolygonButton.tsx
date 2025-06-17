import type MapboxDraw from '@mapbox/mapbox-gl-draw';
import ControlButton from '../../../shared/control-button/ControlButton';
import type { FeatureCollection, Geometry, Polygon } from 'geojson';
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
    setPopUpRef: React.RefObject<maplibregl.Popup | null>;
    isVisible: boolean;
}

const EditPolygonButton = ({ onPolygonEdited, hideLayerControl, mapRef, drawRef, setPopUpRef, isVisible }: EditPolygonButtonProps) => {
    const handleClick = () => {
        if (!mapRef.current || !drawRef.current) return;

        hideLayerControl();

        const draw = drawRef.current;
        const map = mapRef.current.getMap();

        MapVisualHelper.removeDimmedMask(map);

        if (setPopUpRef.current) {
            setPopUpRef.current.remove();
            setPopUpRef.current = null;
        }

        const featureCollection = draw.getAll() as unknown as FeatureCollection<Geometry>;
        const features = featureCollection.features;

        if (features.length === 0) {
            console.warn('No polygon to edit');
            return;
        }

        const polygon = features[0];
        draw.changeMode('direct_select', { featureId: polygon.id });

        const handleUserFinishDragging = () => {
            const drawing = draw.getAll() as unknown as FeatureCollection<Geometry>;
            if (drawing.features.length === 0) return;

            const polygon = drawing.features[0].geometry as Polygon;
            const popupNode = document.createElement('div');

            const popup = new maplibregl.Popup({
                closeButton: false,
                closeOnClick: false,
                offset: [0, 10],
                className: 'no-arrow-popup',
            })
                .setLngLat(MapVisualHelper.getConfirmationPopupCoordinates(polygon))
                .setDOMContent(popupNode)
                .addTo(map);

            setPopUpRef.current = popup;

            const root = createRoot(popupNode);

            root.render(
                <ConfirmPolygonButton
                    onConfirm={() => {
                        draw.changeMode('simple_select', { featureIds: [] });
                        popup.remove();
                        setPopUpRef.current = null;
                        onPolygonEdited(draw.getAll() as unknown as FeatureCollection<Geometry>);
                    }}
                />
            );

            const updatePopupPosition = () => {
                const updated = draw.getAll() as unknown as FeatureCollection<Geometry>;
                popup.setLngLat(MapVisualHelper.getConfirmationPopupCoordinates(updated.features[0].geometry as Polygon));
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
