import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { useMapStore } from '../../stores/useMapStore';
import type { Variation } from '../search/add-asset/AddAsset';

const PopupContainer = styled(Box)(({ theme }) => ({
    position: 'absolute',
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[2],
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    minWidth: 240,
    top: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    marginTop: theme.spacing(1),
}));

const AssetSpecificationPopup = () => {
    const selectedVariantName = useMapStore((s) => s.markerVariant?.name);
    const cachedAssets = useMapStore((s) => s.cachedAssets);

    const [variant, setVariant] = useState<Variation | null>(null);
    const [assetName, setAssetName] = useState<string | null>(null);

    useEffect(() => {
        if (!selectedVariantName || !cachedAssets) return;

        for (const asset of cachedAssets) {
            const match = asset.variations.find((v) => v.name === selectedVariantName);
            if (match) {
                setVariant(match);
                setAssetName(asset.name);
                break;
            }
        }
    }, [selectedVariantName, cachedAssets]);

    if (!variant || !assetName) return null;

    return (
        <PopupContainer>
            <Typography variant="subtitle1" fontWeight="bold">
                {assetName}: {variant.name}
            </Typography>
            {variant.specification.map((spec) => (
                <Typography key={spec.name} variant="body2">
                    {spec.name}: {spec.value}
                </Typography>
            ))}
        </PopupContainer>
    );
};

export default AssetSpecificationPopup;
