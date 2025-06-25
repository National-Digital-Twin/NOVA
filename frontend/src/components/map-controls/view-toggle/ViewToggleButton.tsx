import { Typography } from '@mui/material';
import type { MapRef } from 'react-map-gl/maplibre';
import ControlIcon from '../../../shared/control-icon/ControlIcon';
import { MAPTILER_TERRAIN_SOURCE_URL, type MapStyle } from '../../../types/map';
import { useRef } from 'react';
import { MapVisualHelper } from '../../../utils/MapVisualHelper';

interface ViewToggleButtonProps {
    mapRef: React.RefObject<MapRef>;
    onStyleChange: (style: MapStyle) => void;
    is3D: boolean;
    setIs3D: (value: boolean) => void;
    currentStyle: MapStyle;
}

const TERRAIN_SOURCE_ID = 'terrain';

const ViewToggleButton = ({ mapRef, onStyleChange, is3D, setIs3D, currentStyle }: ViewToggleButtonProps) => {
    const savedStyleRef = useRef<MapStyle>(currentStyle);
    const isTransitioning = useRef(false);

    const reapplyHeatmap = () => {
        const cached = MapVisualHelper.getCachedHeatmapGeojson();
        if (cached) {
            MapVisualHelper.addOrUpdateHeatmapLayer(mapRef, cached);
        }
    };

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
        }

        map.once('styledata', () => {
            if (!changingTo3d) {
                map.setTerrain(null); // Now effective
                MapVisualHelper.remove3DAssets(map);
                reapplyHeatmap();
            } else {
                reapplyHeatmap();
            }

            map.easeTo({
                pitch: changingTo3d ? 60 : 0,
                duration: 400,
            });

            map.once('moveend', () => {
                if (changingTo3d) {
                    if (!map.getSource(TERRAIN_SOURCE_ID)) {
                        map.addSource(TERRAIN_SOURCE_ID, {
                            type: 'raster-dem',
                            url: MAPTILER_TERRAIN_SOURCE_URL,
                            tileSize: 256,
                            maxzoom: 10,
                        });
                    }
                    map.setTerrain({ source: TERRAIN_SOURCE_ID });
                }

                isTransitioning.current = false;
            });

            if (changingTo3d) {
                map.once('idle', () => {
                    MapVisualHelper.visualiseAssetsIn3d(map);
                });
            }
        });
    };

    return (
        <ControlIcon onClick={handleClick} aria-label={is3D ? 'Switch to 2D' : 'Switch to 3D'} disabled={isTransitioning.current}>
            <Typography>{is3D ? '2D' : '3D'}</Typography>
        </ControlIcon>
    );
};

export default ViewToggleButton;
