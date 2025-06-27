import type MapboxDraw from '@mapbox/mapbox-gl-draw';
import type { FeatureCollection, Geometry } from 'geojson';
import { useCallback, useEffect, useState } from 'react';
import type { MapRef } from 'react-map-gl/maplibre';
import ControlIcon from '../../../shared/control-icon/ControlIcon';
import { MapVisualHelper } from '../../../utils/MapVisualHelper';
import { useMapStore } from '../../../stores/useMapStore';

interface DrawPolygonButtonProps {
    onPolygonDrawn: (geojson: FeatureCollection<Geometry>) => void;
    mapRef: React.RefObject<MapRef>;
    drawRef: React.RefObject<MapboxDraw | null>;
    isVisible: boolean;
    polygonDrawn: boolean;
}

const DrawPolygonButton = ({ onPolygonDrawn, mapRef, drawRef, isVisible, polygonDrawn }: DrawPolygonButtonProps) => {
    const [isActive, setIsActive] = useState(false);
    const preventPolygonEdit = useMapStore((s) => s.preventPolygonEdit);

    useEffect(() => {
        setIsActive(polygonDrawn);
    }, [polygonDrawn]);

    useEffect(() => {
        if (!polygonDrawn) return;

        const map = mapRef.current;

        map.on('click', preventPolygonEdit);
        map.on('contextmenu', preventPolygonEdit);

        return () => {
            map.off('click', preventPolygonEdit);
            map.off('contextmenu', preventPolygonEdit);
        };
    }, [polygonDrawn, mapRef, drawRef, preventPolygonEdit]);

    const handleClick = useCallback(() => {
        if (!mapRef.current || !drawRef || polygonDrawn) return;

        const map = mapRef.current;
        const draw = drawRef.current;

        if (!draw) return;

        const mode = draw.getMode();
        if (mode.startsWith('draw')) {
            return;
        }

        setIsActive(true);
        draw.changeMode('draw_polygon');
        map.getCanvas().style.cursor = 'crosshair';

        const handleModeChange = () => {
            const polygon = MapVisualHelper.getFirstPolygon(draw);
            if (polygon) {
                draw.changeMode('simple_select', { featureIds: [] });
                map.off('draw.modechange', handleModeChange);
                onPolygonDrawn(MapVisualHelper.getFeatureCollection(draw));
                map.getCanvas().style.cursor = 'grab';
            }
        };

        map.on('draw.modechange', handleModeChange);
    }, [mapRef, drawRef, polygonDrawn, onPolygonDrawn]);

    if (!isVisible) return null;

    return (
        <ControlIcon onClick={handleClick} isActive={isActive} aria-label="Draw polygon" aria-pressed={isActive} showTooltip={true}>
            <img src={isActive ? '/icons/polygon-white.svg' : '/icons/polygon.svg'} alt="Draw polygon icon" width={24} height={24} />
        </ControlIcon>
    );
};

export default DrawPolygonButton;
