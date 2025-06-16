import type MapboxDraw from '@mapbox/mapbox-gl-draw';
import type { Feature, FeatureCollection, GeoJsonProperties, Geometry, Polygon } from 'geojson';
import { useCallback, useState } from 'react';
import type { MapRef } from 'react-map-gl/maplibre';
import ControlButton from '../../../shared/control-button/ControlButton';
import type { GeoJSONSource } from 'maplibre-gl';

interface DrawPolygonButtonProps {
    onPolygonDrawn: (geojson: FeatureCollection<Geometry>) => void;
    mapRef: React.RefObject<MapRef>;
    drawRef: React.RefObject<MapboxDraw>;
    isVisible: boolean;
}

const DrawPolygonButton = ({ onPolygonDrawn, mapRef, drawRef, isVisible }: DrawPolygonButtonProps) => {
    const [isActive, setIsActive] = useState(false);


    const handleClick = useCallback(() => {
        if (!mapRef.current || !drawRef.current) return;

        const map = mapRef.current;
        const draw = drawRef.current;

        if (!isActive) {
            setIsActive(true);
            draw.changeMode('draw_polygon');

            const handleModeChange = () => {
                const drawing = drawRef.current.getAll() as unknown as FeatureCollection<Geometry, GeoJsonProperties>;
                if (drawing.features.length > 0 && drawing.features[0].geometry.type === 'Polygon') {
                    setIsActive(false);
                    draw.changeMode('simple_select', { featureIds: [] });
                    map.off('draw.modechange', handleModeChange);
                    onPolygonDrawn(drawing);

                    const maskPolygon: Feature<Polygon> = {
                        type: 'Feature',
                        geometry: {
                            type: 'Polygon',
                            coordinates: [
                                [
                                    [-180, -85],
                                    [180, -85],
                                    [180, 85],
                                    [-180, 85],
                                    [-180, -85]
                                ],
                                drawing.features[0].geometry.coordinates[0]
                            ]
                        },
                        properties: {}
                    };

                    const sourceId = 'mask';
                    const layerId = 'mask-layer';

                    if (!map.getSource(sourceId)) {
                        map.getMap().addSource(sourceId, {
                            type: 'geojson',
                            data: maskPolygon
                        });
                    } else {
                        const source = map.getSource(sourceId) as GeoJSONSource;
                        source.setData(maskPolygon);
                    }

                    if (!map.getLayer(layerId)) {
                        map.getMap().addLayer({
                            id: layerId,
                            type: 'fill',
                            source: sourceId,
                            paint: {
                                'fill-color': '#000000',
                                'fill-opacity': 0.5
                            }
                        });
                    }
                }
            };

            map.on('draw.modechange', handleModeChange);
        }
    }, [mapRef, drawRef, isActive, onPolygonDrawn]);

    // Prevent edit when user clicks on the drawn polygon
    // This is to avoid the default behavior of Mapbox Draw which allows editing the polygon.
    if (mapRef.current) {
        mapRef.current.on('click', (e) => {
            const map = mapRef.current;
            const draw = drawRef.current;
            if (!map || !draw) return;

            const features = map.queryRenderedFeatures(e.point, {
                layers: ['gl-draw-polygon-fill.cold']
            });

            if (features.length > 0) {
                draw.changeMode('simple_select', { featureIds: [] });
                e.preventDefault();
            }
        });
    }

    if (!isVisible) return null;

    return (
        <ControlButton onClick={handleClick} isActive={isActive} aria-label="Draw Polygon" aria-pressed={isActive}>
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
