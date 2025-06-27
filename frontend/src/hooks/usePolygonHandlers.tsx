import { useCallback } from 'react';
import type { MapRef } from 'react-map-gl/maplibre';
import type { FeatureCollection, Geometry, Polygon } from 'geojson';
import maplibregl from 'maplibre-gl';
import { createRoot } from 'react-dom/client';
import { MapVisualHelper } from '../utils/MapVisualHelper';
import ConfirmPolygonButton from '../components/map-controls/confirm-polygon/ConfirmPolygonButton';
import { useMapStore } from '../stores/useMapStore';

interface UsePolygonHandlersProps {
    mapRef: React.RefObject<MapRef>;
    popupRef: React.RefObject<maplibregl.Popup | null>;
    setPolygonDrawn: (val: boolean) => void;
    setPolygonConfirmed: (val: boolean) => void;
}

export function usePolygonHandlers({ mapRef, popupRef, setPolygonDrawn, setPolygonConfirmed }: UsePolygonHandlersProps) {
    const setShowLayerControl = useMapStore((s) => s.setShowLayerControl);
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
            setPolygonConfirmed(true);

            const polygon = MapVisualHelper.extractFirstPolygon(geojson);
            if (polygon) {
                MapVisualHelper.applyDimmedMaskAndPanToPolygon(mapRef.current!.getMap(), polygon);
            }
        },
        [mapRef, setPolygonConfirmed]
    );

    const handlePolygonDrawn = useCallback(
        (geojson: FeatureCollection<Geometry>) => {
            setPolygonDrawn(true);
            setPolygonConfirmed(false);

            const polygon = MapVisualHelper.extractFirstPolygon(geojson);
            if (!polygon) return;

            showConfirmationPopup(polygon, () => {
                MapVisualHelper.removeExistingPopup(popupRef);
                handlePolygonConfirmed(geojson);
                setShowLayerControl(true);
            });
        },
        [setPolygonDrawn, setPolygonConfirmed, showConfirmationPopup, handlePolygonConfirmed, popupRef, setShowLayerControl]
    );

    const handlePolygonEdited = useCallback(
        (geojson: FeatureCollection<Geometry>) => {
            setPolygonDrawn(true);

            const polygon = MapVisualHelper.extractFirstPolygon(geojson);
            if (polygon) {
                MapVisualHelper.applyDimmedMaskAndPanToPolygon(mapRef.current!.getMap(), polygon);
            }

            MapVisualHelper.remove3DAssets(mapRef.current.getMap());
            setShowLayerControl(true);
        },
        [setPolygonDrawn, mapRef, setShowLayerControl]
    );

    const handlePolygonDeleted = useCallback(() => {
        setPolygonDrawn(false);
        setPolygonConfirmed(false);

        const map = mapRef.current?.getMap();
        if (map) {
            MapVisualHelper.removeDimmedMask(map);
            MapVisualHelper.removeExistingPopup(popupRef);
            MapVisualHelper.removeHeatmapLayer(mapRef);
            MapVisualHelper.remove3DAssets(mapRef.current.getMap());
        }
    }, [mapRef, popupRef, setPolygonDrawn, setPolygonConfirmed]);

    return {
        handlePolygonDrawn,
        handlePolygonConfirmed,
        handlePolygonEdited,
        handlePolygonDeleted,
    };
}
