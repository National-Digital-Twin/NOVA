import type MapboxDraw from '@mapbox/mapbox-gl-draw';
import ControlButton from '../../../shared/control-button/ControlButton';
import type { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';
import { MapMask } from '../../../utils/MapMask';
import type { MapRef } from 'react-map-gl/maplibre';

interface EditPolygonButtonProps {
    onPolygonEdited: (geojson: FeatureCollection<Geometry>) => void;
    mapRef: React.RefObject<MapRef>;
    drawRef: React.RefObject<MapboxDraw | null>;
    isVisible: boolean;
}

const EditPolygonButton = ({ onPolygonEdited, mapRef, drawRef, isVisible }: EditPolygonButtonProps) => {

    const handleClick = () => {
        if (!mapRef.current || !drawRef.current) return;

        const draw = drawRef.current;
        const map = mapRef.current.getMap();

        // Remove the mask so user can edit
        MapMask.remove(map);

        // Get the drawn features
        const featureCollection = draw.getAll() as unknown as FeatureCollection<Geometry>;
        const features = featureCollection.features;

        if (features.length === 0) {
            console.warn('No polygon to edit');
            return;
        }

        const polygon = features[0];
        draw.changeMode('direct_select', { featureId: polygon.id });

        const handleModeChange = () => {
            if (!mapRef.current || !drawRef.current) return;
            const drawing = drawRef.current.getAll() as unknown as FeatureCollection<Geometry, GeoJsonProperties>;
            if (drawing.features.length > 0 && drawing.features[0].geometry.type === 'Polygon') {
                draw.changeMode('simple_select', { featureIds: [] });
                map.off('draw.modechange', handleModeChange);
                onPolygonEdited(drawing);
            }
        };

        map.on('draw.modechange', handleModeChange);
    };

    if (!isVisible) return null;

    return (
        <ControlButton onClick={handleClick} aria-label="Edit polygon">
            <img src="/icons/edit-polygon.svg" alt="Edit polygon" width={24} height={24} />
        </ControlButton>
    );
};

export default EditPolygonButton;