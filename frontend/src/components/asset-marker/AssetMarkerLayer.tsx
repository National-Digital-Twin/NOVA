import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import maplibregl, { type MapLayerMouseEvent } from 'maplibre-gl';
import { useMapStore } from '../../stores/useMapStore';
import windTurbineIcon from '../../assets/Windturbine_blue_unselected.svg';
import AssetControls from './AssetControls';
import { preventPolygonEdit } from '../../utils/MapEditGuards';

const AssetMarkerLayer = () => {
  const mapRef           = useMapStore((s) => s.mapRef);
  const drawRef          = useMapStore((s) => s.drawRef);
  const markerPosition   = useMapStore((s) => s.markerPosition);
  const setMarkerPosition = useMapStore((s) => s.setMarkerPosition);
  const setPlacing       = useMapStore((s) => s.setPlacing);

  const [showControls, setShowControls] = useState(false);
  const [screenPos,    setScreenPos]    = useState<{ x: number; y: number } | null>(null);
  const controlsRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const map = mapRef?.getMap?.();
    if (!map || !markerPosition) return;

    const sourceId = 'asset-marker';
    const layerId  = 'asset-layer';
    const imageId  = 'wind-turbine-icon';

    // 1️⃣ Add the turbine icon to the style if needed
    if (!map.hasImage(imageId)) {
      const img = new Image(110, 110);
      img.src = windTurbineIcon;
      img.onload = () => {
        if (!map.hasImage(imageId)) map.addImage(imageId, img);
      };
    }

    // 2️⃣ Create or update a GeoJSON source
    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
    }
    const src = map.getSource(sourceId) as maplibregl.GeoJSONSource;
    src.setData({
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [markerPosition.longitude!, markerPosition.latitude!],
        },
        properties: {},
      }],
    });

    // 3️⃣ Add the symbol layer just above your heatmap
    if (!map.getLayer(layerId)) {
      map.addLayer({
        id: layerId,
        type: 'symbol',
        source: sourceId,
        layout: {
          'icon-image': imageId,
          'icon-size': 0.7,
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
        },
      }, 'heatmap-layer');
      // immediately bump it on top
      map.moveLayer(layerId);
    }

    // 4️⃣ Keep it on top whenever the map goes idle or the style reloads
    const keepOnTop = () => {
      const ids = map.getStyle().layers?.map(l => l.id) || [];
      const ai = ids.indexOf(layerId), hi = ids.indexOf('heatmap-layer');
      if (ai >= 0 && hi >= 0 && ai < hi) {
        map.moveLayer(layerId, 'heatmap-layer');
      }
    };
    map.once('idle', keepOnTop);
    map.on('idle', keepOnTop);

    // 5️⃣ Recompute the screen position on move/zoom
    const updateScreenPos = () => {
      const p = map.project([markerPosition.longitude!, markerPosition.latitude!]);
      setScreenPos({ x: p.x, y: p.y });
    };
    updateScreenPos();
    map.on('move', updateScreenPos);
    map.on('zoom', updateScreenPos);

    // ──────────────────────────────────────────────────────────────────────────
    // ❶ CAPTURE-PHASE LISTENER on the raw canvas:
    //    intercept _before_ MapLibre's own handlers, stop propagation if this hit our layer
    const canvas = map.getCanvas();
    const stopClickIfOnAsset = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const hits = map.queryRenderedFeatures([x, y], { layers: [layerId] });
      if (hits.length) {
        e.stopImmediatePropagation();
        e.preventDefault();
      }
    };
    canvas.addEventListener('click', stopClickIfOnAsset, { capture: true });
    // ──────────────────────────────────────────────────────────────────────────

    // ❷ Now our regular layer-click handler (fires only if capture didn’t swallow it):
    const onClick = (e: MapLayerMouseEvent) => {
      // also prevent any polygon‐edit behavior underneath
      const rect = map.getCanvas().getBoundingClientRect();
      const x = e.originalEvent.clientX - rect.left;
      const y = e.originalEvent.clientY - rect.top;
      preventPolygonEdit(map, drawRef, { x, y });

      setShowControls(v => !v);
    };
    map.on('click', layerId, onClick);

    return () => {
      // teardown everything
      canvas.removeEventListener('click', stopClickIfOnAsset, { capture: true });
      map.off('click', layerId, onClick);
      map.off('move', updateScreenPos);
      map.off('zoom', updateScreenPos);
      map.off('idle', keepOnTop);
      if (map.getLayer(layerId))  map.removeLayer(layerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    };
  }, [mapRef, markerPosition, drawRef]);

  // 6️⃣ Dismiss the controls popup when clicking anywhere outside it
  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (controlsRef.current && !controlsRef.current.contains(e.target as Node)) {
        setShowControls(false);
      }
    };
    if (showControls) document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [showControls]);

  if (!showControls || !screenPos) return null;

  return createPortal(
    <div
      ref={controlsRef}
      style={{
        position: 'absolute',
        left: screenPos.x,
        top: screenPos.y,
        transform: 'translate(-50%, -100%)',
        zIndex: 1000,
      }}
    >
      <AssetControls
        onBoltClick={() => console.log('Bolt clicked')}
        onDeleteClick={() => setMarkerPosition(null)}
        onEditClick={() => {
          setMarkerPosition(null);
          // open your edit UI here if needed
        }}
        onMoveClick={() => {
          setMarkerPosition(null);
          setPlacing(true);
        }}
      />
    </div>,
    document.body
  );
};

export default AssetMarkerLayer;
