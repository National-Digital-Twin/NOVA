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
}

function createConfirmationPopup(polygon: Polygon, onConfirm: () => void, map: maplibregl.Map) {
    const popupNode = document.createElement('div');
    createRoot(popupNode).render(<ConfirmPolygonButton onConfirm={onConfirm} />);
    return new maplibregl.Popup({ closeButton: false, closeOnClick: false })
        .setLngLat(MapVisualHelper.getConfirmationPopupCoordinates(polygon, map))
        .setDOMContent(popupNode)
        .addTo(map);
}

export function usePolygonHandlers({ mapRef, drawRef }: UsePolygonHandlersProps) {
    const polygonStatus = useMapStore((s) => s.polygonStatus);
    const setPopupRef = useMapStore((s) => s.setPolygonConfirmPopup);
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

    const handlePolygonConfirmed = useCallback((geojson: FeatureCollection<Geometry>) => {
        setPolygonStatus('confirmed');

        const polygon = MapVisualHelper.extractFirstPolygon(geojson);
        if (polygon) {
            MapVisualHelper.applyDimmedMaskAndPanToPolygon(mapRef.current!.getMap(), polygon);
        }
    }, [mapRef, setPolygonStatus]);

    const showConfirmationPopup = useCallback((polygon: Polygon, onConfirm: () => void) => {
        const popup = createConfirmationPopup(polygon, onConfirm, mapRef.current!.getMap());
        setPopupRef(popup);
    }, [mapRef, setPopupRef]);

    const handlePolygonDrawn = useCallback((geojson: FeatureCollection<Geometry>) => {
        setPolygonStatus('pendingConfirmation');

        const polygon = MapVisualHelper.extractFirstPolygon(geojson);
        if (!polygon) return;

        showConfirmationPopup(polygon, () => {
            MapVisualHelper.removeExistingPopup(useMapStore.getState().polygonConfirmPopup);
            handlePolygonConfirmed(geojson);
        });
    }, [setPolygonStatus, showConfirmationPopup, handlePolygonConfirmed]);

    const startPolygonDraw = useCallback(() => {
        const map = mapRef.current;
        const draw = drawRef.current;
        if (!map || !draw) return;

        if (draw.getMode().startsWith('draw')) return;
        if (MapVisualHelper.getFirstPolygon(draw)) return;

        draw.changeMode('draw_polygon');
        map.getCanvas().style.cursor = 'crosshair';
        setPolygonStatus('drawing');

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
    }, [mapRef, drawRef, handlePolygonDrawn, setPolygonStatus]);

    const handlePolygonEdited = useCallback((geojson: FeatureCollection<Geometry>) => {
        setPolygonStatus('confirmed');

        const polygon = MapVisualHelper.extractFirstPolygon(geojson);
        if (polygon) {
            MapVisualHelper.applyDimmedMaskAndPanToPolygon(mapRef.current!.getMap(), polygon);
        }

        MapVisualHelper.remove3DAssets(mapRef.current.getMap());
    }, [setPolygonStatus, mapRef]);

    const startPolygonEdit = useCallback(() => {
        const draw = drawRef.current;
        const map = mapRef.current?.getMap();
        if (!map || !draw) return;

        MapVisualHelper.removeDimmedMask(map);
        MapVisualHelper.removeExistingPopup(useMapStore.getState().polygonConfirmPopup);
        MapVisualHelper.removeHeatmapLayer(mapRef);
        useMapStore.getState().setCachedHeatmap(null);

        map.getCanvas().style.cursor = 'grab';

        const polygon = MapVisualHelper.getFirstPolygon(draw);
        const polygonFeatureId = MapVisualHelper.getFeatureCollection(draw).features[0]?.id;
        if (!polygon || !polygonFeatureId) return;

        draw.changeMode('direct_select', { featureId: polygonFeatureId });
        setPolygonStatus('editing');

        const handleUserFinishDragging = () => {
            const latestPolygon = MapVisualHelper.getFirstPolygon(draw);
            if (!latestPolygon) return;

            const popup = createConfirmationPopup(latestPolygon, () => {
                draw.changeMode('simple_select', { featureIds: [] });
                MapVisualHelper.removeExistingPopup(useMapStore.getState().polygonConfirmPopup);
                setPolygonStatus('confirmed');
                handlePolygonEdited(MapVisualHelper.getFeatureCollection(draw));
            }, map);

            setPopupRef(popup);

            const updatePopupPosition = () => {
                const updatedPolygon = MapVisualHelper.getFirstPolygon(draw);
                if (updatedPolygon) {
                    popup.setLngLat(MapVisualHelper.getConfirmationPopupCoordinates(updatedPolygon, map));
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
    }, [drawRef, mapRef, handlePolygonEdited, setPolygonStatus, setPopupRef]);

    const handlePolygonDeleted = useCallback(() => {
        setPolygonStatus('none');

        const draw = drawRef.current;
        if (draw) draw.deleteAll();

        const map = mapRef.current?.getMap();
        if (map) {
            MapVisualHelper.removeDimmedMask(map);
            MapVisualHelper.removeExistingPopup(useMapStore.getState().polygonConfirmPopup);
            MapVisualHelper.removeHeatmapLayer(mapRef);
            MapVisualHelper.remove3DAssets(mapRef.current.getMap());
        }
    }, [mapRef, setPolygonStatus]);

    return {
        handlePolygonDrawn,
        handlePolygonConfirmed,
        handlePolygonEdited,
        handlePolygonDeleted,
        startPolygonDraw,
        startPolygonEdit,
    };
}
