import type MapboxDraw from '@mapbox/mapbox-gl-draw';
import type { FeatureCollection, Geometry } from 'geojson';
import { useCallback, useEffect, useState } from 'react';
import type { MapRef } from 'react-map-gl/maplibre';
import ControlButton from '../../../shared/control-button/ControlButton';
import maplibregl from 'maplibre-gl';
import { MapVisualHelper } from '../../../utils/MapVisualHelper';

interface DrawPolygonButtonProps {
    onPolygonDrawn: (geojson: FeatureCollection<Geometry>) => void;
    mapRef: React.RefObject<MapRef>;
    drawRef: React.RefObject<MapboxDraw>;
    isVisible: boolean;
    polygonDrawn: boolean;
}

const DrawPolygonButton = ({
    onPolygonDrawn,
    mapRef,
    drawRef,
    isVisible,
    polygonDrawn
}: DrawPolygonButtonProps) => {
    const [isActive, setIsActive] = useState(false);

    // Update active state from props
    useEffect(() => {
        setIsActive(polygonDrawn);
    }, [polygonDrawn]);

    // Prevent editing existing polygon
    useEffect(() => {
        if (!polygonDrawn || !mapRef.current || !drawRef.current) return;
    
        const map = mapRef.current;
        const draw = drawRef.current;
    
        const preventEdit = (e: maplibregl.MapMouseEvent & { target: maplibregl.Map }) => {
            const features = map.queryRenderedFeatures([e.point.x, e.point.y], {
                layers: ['gl-draw-polygon-fill.cold'],
            });
    
            if (features.length > 0) {
                draw.changeMode('simple_select', { featureIds: [] });
                e.preventDefault();
            }
        };
    
        map.on('click', preventEdit);
        map.on('contextmenu', preventEdit);
    
        return () => {
            map.off('click', preventEdit);
            map.off('contextmenu', preventEdit);
        };
    }, [polygonDrawn, mapRef, drawRef]);

    const handleClick = useCallback(() => {
        if (!mapRef.current || !drawRef.current || polygonDrawn) return;

        const map = mapRef.current;
        const draw = drawRef.current;

        setIsActive(true);
        draw.changeMode('draw_polygon');

        const handleModeChange = () => {
            const polygon = MapVisualHelper.getFirstPolygon(draw);
            if (polygon) {
                draw.changeMode('simple_select', { featureIds: [] });
                map.off('draw.modechange', handleModeChange);
                onPolygonDrawn(MapVisualHelper.getFeatureCollection(draw));
            }
        };

        map.on('draw.modechange', handleModeChange);
    }, [mapRef, drawRef, polygonDrawn, onPolygonDrawn]);

    if (!isVisible) return null;

    return (
        <ControlButton
            onClick={handleClick}
            isActive={isActive}
            aria-label="Draw Polygon"
            aria-pressed={isActive}
            showTooltip={true}
        >
            <img
                src={isActive ? '/icons/polygon-white.svg' : '/icons/polygon.svg'}
                alt="Draw polygon"
                width={24}
                height={24}
            />
        </ControlButton>
    );
};

export default DrawPolygonButton;
