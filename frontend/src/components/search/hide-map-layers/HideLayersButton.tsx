import { useEffect, useState } from 'react';
import type { MapRef } from 'react-map-gl/maplibre';
import ControlIcon from '../../../shared/control-icon/ControlIcon';
import { MapVisualHelper } from '../../../utils/MapVisualHelper';

interface HideLayersButtonProps {
    mapRef: React.RefObject<MapRef>;
}

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

    return (
        <ControlIcon onClick={handleClick} isActive={!isActive} aria-label="Toggle polygon" showTooltip={true}>
            <img src={isActive ? '/icons/hide-layers-white.svg' : '/icons/hide-layers.svg'} alt="Toggle layer visibility icon" width={24} height={24} />
        </ControlIcon>
    );
};

export default HideLayersButton;
