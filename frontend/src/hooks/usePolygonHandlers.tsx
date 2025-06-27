import { useCallback, useEffect } from 'react';
import type { MapRef } from 'react-map-gl/maplibre';
import type { FeatureCollection, Geometry, Polygon } from 'geojson';
import maplibregl from 'maplibre-gl';
import { createRoot } from 'react-dom/client';
import { MapVisualHelper } from '../utils/MapVisualHelper';
import ConfirmPolygonButton from '../components/map-controls/confirm-polygon/ConfirmPolygonButton';
import type MapboxDraw from '@mapbox/mapbox-gl-draw';
import { useMapStore } from '../stores/useMapStore';

interface UsePolygonHandlersProps {
    mapRef: React.RefObject<MapRef>;
    drawRef: React.RefObject<MapboxDraw | null>;
    popupRef: React.RefObject<maplibregl.Popup | null>;
    showLayerControl: () => void;
}

export function usePolygonHandlers({ mapRef, drawRef, popupRef, showLayerControl }: UsePolygonHandlersProps) {
    const polygonStatus = useMapStore((s) => s.polygonStatus);
    const preventPolygonEdit = useMapStore((s) => s.preventPolygonEdit);
    const setPolygonStatus = useMapStore((s) => s.setPolygonStatus);

    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;
    
        const shouldPreventEdit =
            polygonStatus === 'pendingConfirmation' || polygonStatus === 'confirmed';
    
        if (!shouldPreventEdit) return;
    
        map.on('click', preventPolygonEdit);
        map.on('contextmenu', preventPolygonEdit);
    
        return () => {
            map.off('click', preventPolygonEdit);
            map.off('contextmenu', preventPolygonEdit);
        };
    }, [mapRef, polygonStatus, preventPolygonEdit]);


    const showConfirmationPopup = useCallback(
        (polygon: Polygon, onConfirm: () => void) => {
            const popupNode = document.createElement('div');
            createRoot(popupNode).render(<ConfirmPolygonButton onConfirm={onConfirm} />);

            const popup = new maplibregl.Popup({
                closeButton: false,
                closeOnClick: false,
            })
                .setLngLat(MapVisualHelper.getConfirmationPopupCoordinates(polygon, mapRef.current))
                .setDOMContent(popupNode)
                .addTo(mapRef.current!.getMap());

            popupRef.current = popup;
        },
        [mapRef, popupRef]
    );

    const handlePolygonConfirmed = useCallback(
        (geojson: FeatureCollection<Geometry>) => {
            setPolygonStatus('confirmed');

            const polygon = MapVisualHelper.extractFirstPolygon(geojson);
            if (polygon) {
                MapVisualHelper.applyDimmedMaskAndPanToPolygon(mapRef.current!.getMap(), polygon);
            }
        },
        [mapRef, setPolygonStatus]
    );

    const handlePolygonDrawn = useCallback(
        (geojson: FeatureCollection<Geometry>) => {
            setPolygonStatus('pendingConfirmation');

            const polygon = MapVisualHelper.extractFirstPolygon(geojson);
            if (!polygon) return;

            showConfirmationPopup(polygon, () => {
                MapVisualHelper.removeExistingPopup(popupRef);
                handlePolygonConfirmed(geojson);
                showLayerControl();
            });
        },
        [setPolygonStatus, showConfirmationPopup, handlePolygonConfirmed, popupRef, showLayerControl]
    );


    const startPolygonDraw = useCallback(() => {
        const map = mapRef.current;
        const draw = drawRef.current;

        if (!map || !draw) return;

        if (draw.getMode().startsWith('draw')) return;

        draw.changeMode('draw_polygon');
        map.getCanvas().style.cursor = 'crosshair';

        const handleModeChange = () => {
            const polygon = MapVisualHelper.getFirstPolygon(draw);
            if (polygon) {
                draw.changeMode('simple_select', { featureIds: [] });
                map.off('draw.modechange', handleModeChange);

                const geojson = MapVisualHelper.getFeatureCollection(draw);
                handlePolygonDrawn(geojson);
                map.getCanvas().style.cursor = 'grab';
            }
        };

        map.on('draw.modechange', handleModeChange);
    }, [mapRef, drawRef, handlePolygonDrawn]);


    const handlePolygonEdited = useCallback(
        (geojson: FeatureCollection<Geometry>) => {
            setPolygonStatus('editing')

            const polygon = MapVisualHelper.extractFirstPolygon(geojson);
            if (polygon) {
                MapVisualHelper.applyDimmedMaskAndPanToPolygon(mapRef.current!.getMap(), polygon);
            }

            MapVisualHelper.remove3DAssets(mapRef.current.getMap());
            showLayerControl();
        },
        [setPolygonStatus, mapRef, showLayerControl]
    );

    const handlePolygonDeleted = useCallback(() => {
        setPolygonStatus('none');

        const map = mapRef.current?.getMap();
        if (map) {
            MapVisualHelper.removeDimmedMask(map);
            MapVisualHelper.removeExistingPopup(popupRef);
            MapVisualHelper.removeHeatmapLayer(mapRef);
            MapVisualHelper.remove3DAssets(mapRef.current.getMap());
        }
    }, [mapRef, popupRef, setPolygonStatus]);

    return {
        handlePolygonDrawn,
        handlePolygonConfirmed,
        handlePolygonEdited,
        handlePolygonDeleted,
        startPolygonDraw
    };
}
