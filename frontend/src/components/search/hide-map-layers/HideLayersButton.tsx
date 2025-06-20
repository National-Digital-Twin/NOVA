import { useEffect, useState } from 'react';
import type { MapRef } from 'react-map-gl/maplibre';
import ControlButton from '../../../shared/control-button/ControlButton';
import { MapVisualHelper } from '../../../utils/MapVisualHelper';

/**
 * Props for the HideLayersButton component.
 */
interface HideLayersButtonProps {
    /**
     * Reference to the MapLibre map instance.
     */
    mapRef: React.RefObject<MapRef>;
}

/**
 * A control button that toggles visibility of all non-base layers on the map.
 */
const HideLayersButton = ({ mapRef }: HideLayersButtonProps) => {
    const [hiddenLayerIds, setHiddenLayerIds] = useState<string[] | null>(null);
    const [isActive, setIsActive] = useState(false);
    const [isHeatmapPresent, setIsHeatmapPresent] = useState(false);

    useEffect(() => {
        const map = mapRef.current?.getMap();
        if (!map) return;

        const checkLayer = () => {
            const hasHeatmap = !!map.getLayer('heatmap-layer');
            setIsHeatmapPresent(hasHeatmap);
        };

        map.on('styledata', checkLayer);
        checkLayer();

        return () => {
            map.off('styledata', checkLayer);
        };
    }, [mapRef]);

    const handleClick = () => {
        const map = mapRef.current?.getMap();
        if (!map) return;

        if (hiddenLayerIds === null) {
            const toHide = MapVisualHelper.hideNonBaseLayers(map);
            setHiddenLayerIds(toHide);
            setIsActive(true);
        } else {
            MapVisualHelper.showLayers(map, hiddenLayerIds);
            setHiddenLayerIds(null);
            setIsActive(false);
        }
    };

    if (!isHeatmapPresent) return null;

    // Note that in the below, this button works in reverse to others (i.e., blue when not clicked).
    return (
        <ControlButton onClick={handleClick} isActive={!isActive} aria-label="Toggle layer visibility" showTooltip={true}>
            <img src={isActive ? '/icons/hide-layers-white.svg' : '/icons/hide-layers.svg'} alt="Toggle layer visibility icon" width={24} height={24} />
        </ControlButton>
    );
};

export default HideLayersButton;
