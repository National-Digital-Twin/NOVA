import { useEffect, useState } from 'react';
import { useMapStore } from '../stores/useMapStore';
import type { MapMouseEvent } from 'maplibre-gl';
import { preventPolygonEdit } from '../utils/MapEditGuards';

export function useMarkerPlacement() {
    const placing = useMapStore((s) => s.placing);
    const setPlacing = useMapStore((s) => s.setPlacing);
    const setMarkerPosition = useMapStore((s) => s.setMarkerPosition);
    const setMarkerBearing = useMapStore((s) => s.setMarkerBearing);
    const mapRef = useMapStore((s) => s.mapRef);
    const drawRef = useMapStore((s) => s.drawRef);

    const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

    // Track cursor position for preview icon
    useEffect(() => {
        if (!placing) {
            setMousePos(null);
            return;
        }

        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [placing]);

    // Provide a stable map click handler
    const handleMapClick = (e: MapMouseEvent & { originalEvent: MouseEvent }) => {
        if (!placing) return;

        const { lng, lat } = e.lngLat;
        setMarkerPosition({ longitude: lng, latitude: lat });
        const map = mapRef?.getMap?.();
        if (map) {
            setMarkerBearing(map.getBearing());
            preventPolygonEdit(map, drawRef, e.point);
        }

        setPlacing(false);
        e.originalEvent.stopPropagation?.();
        e.preventDefault();
    };

    return {
        mousePos,
        handleMapClick,
    };
}
