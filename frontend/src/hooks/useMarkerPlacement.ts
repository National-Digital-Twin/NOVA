import { useEffect, useState } from 'react';
import { useMapStore } from '../stores/useMapStore';
import type { MapMouseEvent } from 'maplibre-gl';
import { MapVisualHelper } from '../utils/MapVisualHelper';

export function useMarkerPlacement() {
    const placing = useMapStore((s) => s.placing);
    const setPlacing = useMapStore((s) => s.setPlacing);
    const setMarkerPosition = useMapStore((s) => s.setMarkerPosition);
    const setMarkerBearing = useMapStore((s) => s.setMarkerBearing);
    const mapRef = useMapStore((s) => s.mapRef);
    const drawRef = useMapStore((s) => s.drawRef);

    const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
    const [isInsidePolygon, setIsInsidePolygon] = useState(true);

    useEffect(() => {
        if (!placing || !mapRef?.getMap) return;

        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });

            if (!mapRef || !drawRef) return;
        
            const map = mapRef.getMap?.();
            if (!map) return;
        
            const rect = map.getCanvas().getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
    
            const { lng, lat } = map.unproject([x, y]);
            const inside = MapVisualHelper.isPointInsideUserDrawnPolygon(drawRef, lng, lat);
            setIsInsidePolygon(inside);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [placing, drawRef, mapRef]);

    const handleMapClick = (e: MapMouseEvent & { originalEvent: MouseEvent }) => {
        if (!placing || !isInsidePolygon) return;

        const { lng, lat } = e.lngLat;
        setMarkerPosition({ longitude: lng, latitude: lat });

        const map = mapRef?.getMap?.();
        if (map) {
            setMarkerBearing(map.getBearing());
        }

        setPlacing(false);
        e.originalEvent.stopPropagation?.();
        e.preventDefault();
    };

    return {
        mousePos,
        handleMapClick,
        isInsidePolygon,
    };
}
