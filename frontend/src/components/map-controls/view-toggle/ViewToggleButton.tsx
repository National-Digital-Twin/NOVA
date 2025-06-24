import { Typography } from '@mui/material';
import type { MapRef } from 'react-map-gl/maplibre';
import ControlIcon from '../../../shared/control-icon/ControlIcon';
import { MAPTILER_TOKEN, type MapStyle } from '../../../types/map';
import { useRef } from 'react';
import { MapVisualHelper } from '../../../utils/MapVisualHelper';

interface ViewToggleButtonProps {
    mapRef: React.RefObject<MapRef>;
    onStyleChange: (style: MapStyle) => void;
    is3D: boolean;
    setIs3D: (value: boolean) => void;
    currentStyle: MapStyle;
}

const ViewToggleButton = ({ mapRef, onStyleChange, is3D, setIs3D, currentStyle }: ViewToggleButtonProps) => {
    // Use a ref so we always have the latest saved style without re-renders
    const savedStyleRef = useRef<MapStyle>(currentStyle);
    const isTransitioning = useRef(false);

    const handleClick = () => {
        const map = mapRef.current?.getMap();
        if (!map || isTransitioning.current || map.isMoving()) return;
        isTransitioning.current = true;

        const changingTo3d = !is3D;
        setIs3D(changingTo3d);

        if (changingTo3d) {
            savedStyleRef.current = currentStyle;
            onStyleChange('satellite');
        } else {
            onStyleChange(savedStyleRef.current);
            map.setTerrain(null);
        }

        map.once('styledata', () => {
            map.easeTo({
                pitch: changingTo3d ? 60 : 0,
                duration: 400,
            });

            map.once('moveend', () => {
                if (changingTo3d) {
                    if (!map.getSource('terrain')) {
                        map.addSource('terrain', {
                            type: 'raster-dem',
                            url: `https://api.maptiler.com/tiles/terrain-rgb/tiles.json?key=${MAPTILER_TOKEN}`,
                            tileSize: 256, // Used to reduce network traffic
                            maxzoom: 10,
                        });
                    }
                    map.setTerrain({ source: 'terrain' });
                }
                // Done transitioning
                isTransitioning.current = false;
            });
        });
    };

    return (
        <ControlIcon onClick={handleClick} aria-label={is3D ? 'Switch to 2D' : 'Switch to 3D'} disabled={isTransitioning.current}>
            <Typography>{is3D ? '2D' : '3D'}</Typography>
        </ControlIcon>
    );
};

export default ViewToggleButton;
