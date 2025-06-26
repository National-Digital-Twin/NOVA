import type { MapRef } from 'react-map-gl/maplibre';
import ControlIcon from '../../../shared/control-icon/ControlIcon';
import { MapVisualHelper } from '../../../utils/MapVisualHelper';
import { useMapStore } from '../../../stores/useMapStore';
import { useState } from 'react';

interface HideLayersButtonProps {
    mapRef: React.RefObject<MapRef>;
}

const HideLayersButton = ({ mapRef }: HideLayersButtonProps) => {
    const [hiddenLayerIds, setHiddenLayerIds] = useState<string[] | null>(null);
    const [isActive, setIsActive] = useState(true);
    const cachedHeatmap = useMapStore((s) => s.cachedHeatmap);

    const handleClick = () => {
        const map = mapRef.current?.getMap();
        if (!map) return;

        setIsActive(!isActive);

        if (isActive) {
            const toHide = MapVisualHelper.hideNonBaseLayers(map);
            setHiddenLayerIds(toHide);
        } else {
            if (hiddenLayerIds) {
                MapVisualHelper.showLayers(map, hiddenLayerIds);
            }
        }
    };

    if (!cachedHeatmap) return null;

    return (
        <ControlIcon onClick={handleClick} isActive={isActive} aria-label="Toggle polygon" showTooltip={true}>
            <img src={!isActive ? '/icons/hide-layers-white.svg' : '/icons/hide-layers.svg'} alt="Toggle layer visibility icon" width={24} height={24} />
        </ControlIcon>
    );
};

export default HideLayersButton;
