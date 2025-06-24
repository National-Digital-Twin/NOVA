import { Box, Button, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import type { Asset, Variation } from './AddAsset';
import AssetDetails from './AssetDetails';
import AssetTypeSelector from './AssetTypeSelector';
import AssetVariantSelector from './AssetVariantSelector';

const AddAssetPanelContainer = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[3],
    display: 'flex',
    flexDirection: 'column',
    left: 0,
    position: 'absolute',
    top: 'calc(100% + 16px)',
    width: 320,
    zIndex: 1000,
}));

const PanelContent = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    padding: theme.spacing(3),
}));

const PanelFooter = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
    justifyContent: 'center',
    padding: theme.spacing(0, 0, 3),
}));

interface AddAssetPanelProps {
    onClose: () => void;
    onSelect: (variant: Variation) => void;
}

const AddAssetPanel = ({ onClose, onSelect }: AddAssetPanelProps) => {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [selectedVariant, setSelectedVariant] = useState<Variation | null>(null);

    useEffect(() => {
        fetch('/data/assets.json')
            .then((res) => res.json())
            .then((data) => {
                setAssets(data);
                if (data.length > 0) {
                    setSelectedAsset(data[0]);
                    if (data[0].variations.length > 0) {
                        setSelectedVariant(data[0].variations[0]);
                    }
                }
            });
    }, []);

    const handleAssetChange = (assetId: string) => {
        const asset = assets.find((a) => a.id === assetId);
        if (asset) {
            setSelectedAsset(asset);
            setSelectedVariant(asset.variations.length > 0 ? asset.variations[0] : null);
        }
    };

    if (!selectedAsset) {
        return (
            <AddAssetPanelContainer>
                <PanelContent>
                    <CircularProgress />
                </PanelContent>
            </AddAssetPanelContainer>
        );
    }

    return (
        <AddAssetPanelContainer>
            <PanelContent>
                <AssetTypeSelector assets={assets} selectedAsset={selectedAsset} onChange={handleAssetChange} />
                {selectedVariant && <AssetDetails selectedAsset={selectedAsset} selectedVariant={selectedVariant} />}
                <AssetVariantSelector selectedAsset={selectedAsset} selectedVariant={selectedVariant} onChange={setSelectedVariant} />
            </PanelContent>
            <PanelFooter>
                <Button onClick={onClose}>CANCEL</Button>
                <Button variant="contained" color="secondary" onClick={() => selectedVariant && onSelect(selectedVariant)} disabled={!selectedVariant}>
                    SELECT
                </Button>
            </PanelFooter>
        </AddAssetPanelContainer>
    );
};

export default AddAssetPanel;
