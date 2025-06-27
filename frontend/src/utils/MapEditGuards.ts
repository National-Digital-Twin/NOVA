import type maplibregl from 'maplibre-gl';
import type MapboxDraw from '@mapbox/mapbox-gl-draw';

export function preventPolygonEdit(
  map: maplibregl.Map,
  draw: MapboxDraw | null,
  point: { x: number; y: number }
) {
  if (!map || !draw) return;

  const mode = draw.getMode?.();
  if (mode?.startsWith('draw')) return;

  const features = map.queryRenderedFeatures([point.x, point.y]);

  const polygonFeatures = features.filter((f) =>
    f.layer?.id?.startsWith('gl-draw-polygon-')
  );

  if (polygonFeatures.length > 0) {
    draw.changeMode('simple_select', { featureIds: [] });
    map.getCanvas().style.cursor = 'default';
  }
}