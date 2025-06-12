
export const MAPTILER_TOKEN = import.meta.env.VITE_MAPTILER_API_KEY;

export type MapStyle = 'basic' | 'osm' | 'hybrid' | 'bright';

export const MAP_STYLES: Record<MapStyle, string> = {
    basic: `https://api.maptiler.com/maps/basic-v2/style.json?key=${MAPTILER_TOKEN}`,
    osm: `https://api.maptiler.com/maps/openstreetmap/style.json?key=${MAPTILER_TOKEN}`,
    hybrid: `https://api.maptiler.com/maps/hybrid/style.json?key=${MAPTILER_TOKEN}`,
    bright: `https://api.maptiler.com/maps/bright-v2/style.json?key=${MAPTILER_TOKEN}`,
};
