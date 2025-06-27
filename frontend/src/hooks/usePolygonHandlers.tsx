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
}

export function usePolygonHandlers({ mapRef, drawRef, popupRef }: UsePolygonHandlersProps) {
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
            });
        },
        [setPolygonStatus, showConfirmationPopup, handlePolygonConfirmed, popupRef]
    );


    const startPolygonDraw = useCallback(() => {
        const map = mapRef.current;
        const draw = drawRef.current;
        if (!map || !draw) return;
    
        // Prevent re-entering draw mode
        if (draw.getMode().startsWith('draw')) return;
    
        // Prevent drawing if a polygon already exists
        const existingPolygon = MapVisualHelper.getFirstPolygon(draw);
        if (existingPolygon) return;
    
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



    
    const handlePolygonEdited = useCallback(
        (geojson: FeatureCollection<Geometry>) => {
            setPolygonStatus('editing')

            const polygon = MapVisualHelper.extractFirstPolygon(geojson);
            if (polygon) {
                MapVisualHelper.applyDimmedMaskAndPanToPolygon(mapRef.current!.getMap(), polygon);
            }

            MapVisualHelper.remove3DAssets(mapRef.current.getMap());
        },
        [setPolygonStatus, mapRef]
    );





    const startPolygonEdit = useCallback(() => {
        const draw = drawRef.current;
        const map = mapRef.current?.getMap();
        if (!map || !draw) return;
    
        MapVisualHelper.removeDimmedMask(map);
        MapVisualHelper.removeExistingPopup(popupRef);
    
        MapVisualHelper.removeHeatmapLayer(mapRef);
        useMapStore.getState().setCachedHeatmap(null); // access the store directly
    
        map.getCanvas().style.cursor = 'grab';
    
        const polygon = MapVisualHelper.getFirstPolygon(draw);
        const polygonFeatureId = MapVisualHelper.getFeatureCollection(draw).features[0]?.id;
    
        if (!polygon || !polygonFeatureId) return;
    
        draw.changeMode('direct_select', { featureId: polygonFeatureId });
        setPolygonStatus('editing');
    
        const handleUserFinishDragging = () => {
            const latestPolygon = MapVisualHelper.getFirstPolygon(draw);
            if (!latestPolygon) return;
    
            const popupNode = document.createElement('div');
            const popup = new maplibregl.Popup({
                closeButton: false,
                closeOnClick: false,
                offset: [0, 10],
            })
                .setLngLat(MapVisualHelper.getConfirmationPopupCoordinates(latestPolygon, mapRef.current))
                .setDOMContent(popupNode)
                .addTo(map);
    
            popupRef.current = popup;
    
            const handleConfirm = () => {
                draw.changeMode('simple_select', { featureIds: [] });
                MapVisualHelper.removeExistingPopup(popupRef);
                setPolygonStatus('confirmed');
                handlePolygonEdited(MapVisualHelper.getFeatureCollection(draw));
            };
    
            createRoot(popupNode).render(<ConfirmPolygonButton onConfirm={handleConfirm} />);
    
            const updatePopupPosition = () => {
                const updatedPolygon = MapVisualHelper.getFirstPolygon(draw);
                if (updatedPolygon) {
                    popup.setLngLat(MapVisualHelper.getConfirmationPopupCoordinates(updatedPolygon, mapRef.current));
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
    }, [drawRef, mapRef, popupRef, handlePolygonEdited, setPolygonStatus]);










    const handlePolygonDeleted = useCallback(() => {
        setPolygonStatus('none');

        const draw = drawRef.current;
        if (draw) {
            draw.deleteAll();
        }

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
        startPolygonDraw,
        startPolygonEdit
    };
}
