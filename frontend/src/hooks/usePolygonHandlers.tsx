
import { useCallback } from 'react';
import type { MapRef } from 'react-map-gl/maplibre';
import type { FeatureCollection, Geometry, Polygon } from 'geojson';
import maplibregl from 'maplibre-gl';
import { createRoot } from 'react-dom/client';
import { MapVisualHelper } from '../utils/MapVisualHelper';
import ConfirmPolygonButton from '../components/map-controls/confirm-polygon/ConfirmPolygonButton';

interface UsePolygonHandlersProps {
    mapRef: React.RefObject<MapRef>;
    popupRef: React.RefObject<maplibregl.Popup | null>;
    setPolygonDrawn: (val: boolean) => void;
    setPolygonConfirmed: (val: boolean) => void;
    showLayerControl: () => void;
    clearLayerData: () => void;
}

/**
 * Custom React hook that manages polygon interaction logic on a MapLibre map
 * using MapboxDraw. It handles drawing, confirming, editing, and deleting polygons,
 * and updates visual effects such as masking and popup rendering.
 *
 * @param {Object} params - Parameters for configuring the polygon handlers.
 * @param {React.RefObject<MapRef>} params.mapRef - Reference to the MapLibre map instance.
 * @param {React.RefObject<maplibregl.Popup | null>} params.popupRef - Reference for managing the confirmation popup.
 * @param {(val: boolean) => void} params.setPolygonDrawn - State setter for whether a polygon has been drawn.
 * @param {(val: boolean) => void} params.setPolygonConfirmed - State setter for whether the polygon is confirmed.
 * @param {() => void} params.showLayerControl - Function to show the layer control UI.
 * @param {() => void} params.clearLayerData - Function to clear any associated polygon or layer data.
 *
 * @returns {Object} Polygon handlers.
 * @returns {(geojson: FeatureCollection<Geometry>) => void} handlePolygonDrawn - Called after the user draws a polygon. Triggers popup and confirmation.
 * @returns {(geojson: FeatureCollection<Geometry>) => void} handlePolygonConfirmed - Called when the user confirms the polygon. Applies mask and pans map.
 * @returns {(geojson: FeatureCollection<Geometry>) => void} handlePolygonEdited - Called after polygon is edited. Reapplies mask and shows control.
 * @returns {() => void} handlePolygonDeleted - Removes polygon and any visual effects or popup.
 */
export function usePolygonHandlers({
    mapRef,
    popupRef,
    setPolygonDrawn,
    setPolygonConfirmed,
    showLayerControl,
    clearLayerData,
}: UsePolygonHandlersProps) {
    const showConfirmationPopup = useCallback(
        (polygon: Polygon, onConfirm: () => void) => {
            const popupNode = document.createElement('div');
            createRoot(popupNode).render(<ConfirmPolygonButton onConfirm={onConfirm} />);

            const popup = new maplibregl.Popup({
                closeButton: false,
                closeOnClick: false,
                offset: [100, 0],
            })
                .setLngLat(MapVisualHelper.getConfirmationPopupCoordinates(polygon))
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
                showLayerControl();
            });
        },
        [setPolygonDrawn, setPolygonConfirmed, showConfirmationPopup, handlePolygonConfirmed, popupRef, showLayerControl]
    );

    const handlePolygonEdited = useCallback(
        (geojson: FeatureCollection<Geometry>) => {
            setPolygonDrawn(true);

            const polygon = MapVisualHelper.extractFirstPolygon(geojson);
            if (polygon) {
                MapVisualHelper.applyDimmedMaskAndPanToPolygon(mapRef.current!.getMap(), polygon);
            }

            showLayerControl();
        },
        [setPolygonDrawn, mapRef, showLayerControl]
    );

    const handlePolygonDeleted = useCallback(() => {
        setPolygonDrawn(false);
        setPolygonConfirmed(false);
        clearLayerData();

        const map = mapRef.current?.getMap();
        if (map) {
            MapVisualHelper.removeDimmedMask(map);
        }

        MapVisualHelper.removeExistingPopup(popupRef);
    }, [mapRef, popupRef, setPolygonDrawn, setPolygonConfirmed, clearLayerData]);

    return {
        handlePolygonDrawn,
        handlePolygonConfirmed,
        handlePolygonEdited,
        handlePolygonDeleted,
    };
}
