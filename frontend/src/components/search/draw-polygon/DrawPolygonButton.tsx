import type MapboxDraw from '@mapbox/mapbox-gl-draw';
import type { FeatureCollection, Geometry } from 'geojson';
import { useCallback, useEffect, useState } from 'react';
import type { MapRef } from 'react-map-gl/maplibre';
import ControlButton from '../../../shared/control-button/ControlButton';
import maplibregl from 'maplibre-gl';
import { MapVisualHelper } from '../../../utils/MapVisualHelper';

interface DrawPolygonButtonProps {
    /**
     * Callback triggered when a polygon has been successfully drawn and detected.
     */
    onPolygonDrawn: (geojson: FeatureCollection<Geometry>) => void;

    /**
     * Reference to the MapLibre map instance.
     */
    mapRef: React.RefObject<MapRef>;

    /**
     * Reference to the Mapbox Draw instance.
     */
    drawRef: React.RefObject<MapboxDraw>;

    /**
     * Controls whether the button should be visible.
     */
    isVisible: boolean;

    /**
     * Tracks whether a polygon has already been drawn (to avoid duplicate drawing).
     */
    polygonDrawn: boolean;
}

/**
 * DrawPolygonButton renders a map control button that allows users to draw a single polygon on a MapLibre map
 * using Mapbox Draw. Once a polygon is drawn, it triggers a confirmation popup, disables further editing,
 * and prevents users from drawing multiple polygons unless the existing one is removed.
 */
const DrawPolygonButton = ({ onPolygonDrawn, mapRef, drawRef, isVisible, polygonDrawn }: DrawPolygonButtonProps) => {
    const [isActive, setIsActive] = useState(false);

    /**
     * Updates local active state based on whether a polygon is drawn.
     */
    useEffect(() => {
        setIsActive(polygonDrawn);
    }, [polygonDrawn]);

    /**
     * Prevents users from re-entering edit mode by clicking on the polygon.
     * This avoids the default Mapbox Draw behaviour of enabling polygon editing on selection.
     */
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

    /**
     * Starts the polygon drawing mode and listens for the mode change event,
     * indicating a polygon has been completed. Once complete, the polygon is saved
     * and further editing is disabled.
     */
    const handleClick = useCallback(() => {
        if (!mapRef.current || !drawRef.current || polygonDrawn) return;

        const map = mapRef.current;
        const draw = drawRef.current;

        map.getCanvas().style.cursor = 'crosshair';
        setIsActive(true);
        draw.changeMode('draw_polygon');

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
        <ControlButton onClick={handleClick} isActive={isActive} aria-label="Draw Polygon" aria-pressed={isActive} showTooltip={true}>
            <img src={isActive ? '/icons/polygon-white.svg' : '/icons/polygon.svg'} alt="Draw polygon icon" width={24} height={24} />
        </ControlButton>
    );
};

export default DrawPolygonButton;
