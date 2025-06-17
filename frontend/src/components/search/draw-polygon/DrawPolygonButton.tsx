import type MapboxDraw from '@mapbox/mapbox-gl-draw';
import type { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';
import { useCallback, useEffect, useState } from 'react';
import type { MapRef } from 'react-map-gl/maplibre';
import ControlButton from '../../../shared/control-button/ControlButton';

interface DrawPolygonButtonProps {
    onPolygonDrawn: (geojson: FeatureCollection<Geometry>) => void;
    mapRef: React.RefObject<MapRef>;
    drawRef: React.RefObject<MapboxDraw>;
}

const DrawPolygonButton = ({ onPolygonDrawn, mapRef, drawRef }: DrawPolygonButtonProps) => {
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        if (!isActive && drawRef.current) {
            let geojson: FeatureCollection<Geometry> = { type: 'FeatureCollection', features: [] };
            if (drawRef.current && drawRef.current.getAll) {
                const drawing = drawRef.current.getAll() as unknown as FeatureCollection<Geometry, GeoJsonProperties>;
                const features = drawing.features;
                if (Array.isArray(features)) {
                    geojson = {
                        type: 'FeatureCollection',
                        features: features,
                    };
                    onPolygonDrawn(geojson);
                }
            }
        }
    }, [drawRef, isActive, onPolygonDrawn]);

    const handleModeChange = useCallback(
        (event: { mode: string }) => {
            if (!mapRef.current) return;
            const map = mapRef.current.getMap();
            if (event.mode !== 'draw_polygon') {
                setIsActive(false);
                map.off('draw.modechange', handleModeChange);
            }
        },
        [mapRef]
    );

    const handleClick = useCallback(() => {
        if (!mapRef.current || !drawRef.current) return;
        const map = mapRef.current.getMap();
        const currentMode = drawRef.current.getMode();

        if (currentMode === 'draw_polygon') {
            setIsActive(false);
            drawRef.current.changeMode('simple_select');
        } else {
            setIsActive(true);
            drawRef.current.deleteAll();
            drawRef.current.changeMode('draw_polygon');
            map.on('draw.modechange', handleModeChange);
        }
    }, [mapRef, drawRef, handleModeChange]);

    return (
        <ControlButton onClick={handleClick} isActive={isActive} aria-label="Draw Polygon" aria-pressed={isActive}>
            <img src={isActive ? '/icons/polygon-white.svg' : '/icons/polygon.svg'} alt="Draw polygon" width={24} height={24} />
        </ControlButton>
    );
};

export default DrawPolygonButton;
