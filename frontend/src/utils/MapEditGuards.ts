// src/utils/MapEditGuards.ts

import type maplibregl from 'maplibre-gl';
import type MapboxDraw from '@mapbox/mapbox-gl-draw';

/**
 * Stops any editing if the user clicked on an existing polygon.
 */
export function preventPolygonEdit(map: maplibregl.Map, draw: MapboxDraw | null, point: { x: number; y: number }) {
    if (!map || !draw) return;

    const mode = draw.getMode?.();
    if (mode?.startsWith('draw')) return;

    const features = map.queryRenderedFeatures([point.x, point.y]);
    const poly = features.find((f) => f.layer?.id?.startsWith('gl-draw-polygon-'));
    if (poly) {
        draw.changeMode('simple_select', { featureIds: [] });
        map.getCanvas().style.cursor = 'default';
    }
}

/**
 * Disables *all* interaction (click, mouse, touch) on every Mapbox-Draw layer.
 * Call once after map + draw are initialized.
 */
export function disableDrawLayerClicks(map: maplibregl.Map, draw: MapboxDraw | null) {
    if (!map || !draw) return;

    // events that Mapbox-Draw listens for
    const EVENTS = ['click', 'mousedown', 'mouseup', 'touchstart', 'touchend'] as const;

    const swallow = (e: maplibregl.MapLayerMouseEvent | maplibregl.MapLayerTouchEvent) => {
        // prevent Mapbox-Draw from ever handling this click
        e.preventDefault();
        e.originalEvent.stopImmediatePropagation?.();
    };

    // attach to every draw layer
    map.getStyle().layers?.forEach((layer) => {
        if (layer.id.startsWith('gl-draw-')) {
            for (const ev of EVENTS) {
                map.on(ev, layer.id, swallow);
            }
        }
    });
}
