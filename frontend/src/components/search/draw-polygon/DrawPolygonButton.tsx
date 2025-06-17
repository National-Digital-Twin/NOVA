import type MapboxDraw from '@mapbox/mapbox-gl-draw';
import type { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';
import { useCallback, useEffect, useState } from 'react';
import type { MapRef } from 'react-map-gl/maplibre';
import ControlButton from '../../../shared/control-button/ControlButton';
import maplibregl from 'maplibre-gl';

interface DrawPolygonButtonProps {
    onPolygonDrawn: (geojson: FeatureCollection<Geometry>) => void;
    mapRef: React.RefObject<MapRef>;
    drawRef: React.RefObject<MapboxDraw>;
    isVisible: boolean;
    polygonDrawn: boolean;
}

const DrawPolygonButton = ({ onPolygonDrawn, mapRef, drawRef, isVisible, polygonDrawn }: DrawPolygonButtonProps) => {
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        if (!isVisible) {
            setIsActive(false);
        }

        if (polygonDrawn) {
            setIsActive(true);
        } else {
            setIsActive(false);
        }
    }, [isVisible, polygonDrawn]);

    const handleClick = useCallback(() => {
        if (!mapRef.current || !drawRef.current) return;

        // Prevent drawing again if polygon already exists
        if (polygonDrawn) return;

        const map = mapRef.current;
        const draw = drawRef.current;

        if (!isActive) {
            setIsActive(true);
            draw.changeMode('draw_polygon');

            const handleModeChange = () => {
                const drawing = drawRef.current.getAll() as unknown as FeatureCollection<Geometry, GeoJsonProperties>;
                if (drawing.features.length > 0 && drawing.features[0].geometry.type === 'Polygon') {
                    draw.changeMode('simple_select', { featureIds: [] });
                    map.off('draw.modechange', handleModeChange);
                    onPolygonDrawn(drawing);
                }
            };

            map.on('draw.modechange', handleModeChange);
        }
    }, [mapRef, drawRef, isActive, onPolygonDrawn, polygonDrawn]);

    // Prevent edit when user clicks on the drawn polygon
    // This is to avoid the default behavior of Mapbox Draw which allows editing the polygon.
    const handlePreventEdit = (e: maplibregl.MapMouseEvent & { target: maplibregl.Map }) => {
        const features = mapRef.current.queryRenderedFeatures([e.point.x, e.point.y], {
            layers: ['gl-draw-polygon-fill.cold'],
        });

        if (features.length > 0) {
            drawRef.current.changeMode('simple_select', { featureIds: [] });
            e.preventDefault();
        }
    };

    mapRef.current.on('click', handlePreventEdit);
    mapRef.current.on('contextmenu', handlePreventEdit); // right click support    

    if (!isVisible) return null;

    return (
        <ControlButton onClick={handleClick} isActive={isActive} aria-label="Draw Polygon" aria-pressed={isActive} showTooltip={true}>
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
