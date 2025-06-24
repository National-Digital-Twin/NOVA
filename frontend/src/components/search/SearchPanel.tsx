import type MapboxDraw from '@mapbox/mapbox-gl-draw';
import { Box, Divider, styled } from '@mui/material';
import type { Feature, FeatureCollection, Point } from 'geojson';
import maplibregl from 'maplibre-gl';
import { useCallback, useRef, useState } from 'react';
import type { MapRef } from 'react-map-gl/maplibre';
import DeletePolygonButton from './delete-polygon/DeletePolygonButton';
import DrawPolygonButton from './draw-polygon/DrawPolygonButton';
import EditPolygonButton from './edit-polygon/EditPolygonButton';
import HideLayersButton from './hide-map-layers/HideLayersButton';
import SearchInput from './search-input/SearchInput';
import { MapVisualHelper } from '../../utils/MapVisualHelper';
import { usePolygonHandlers } from '../../hooks/usePolygonHandlers';
import type { Variation } from './add-asset/AddAsset';
import AddAssetButton from './add-asset/AddAssetButton';
import AssetLayer from './asset-layer/AssetLayer';

const SearchContainer = styled(Box)({
    display: 'flex',
    flexDirection: 'row',
    gap: '1rem',
    left: '1rem',
    position: 'absolute',
    top: '1rem',
    zIndex: 1,
});

const SearchGroup = styled(Box)(({ theme }) => ({
    alignItems: 'center',
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[2],
    display: 'flex',
    flexDirection: 'row',
    position: 'relative',
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
    backgroundColor: theme.palette.divider,
}));

interface SearchPanelProps {
    mapRef: React.RefObject<MapRef>;
    drawRef: React.RefObject<MapboxDraw | null>;
    showLayerControl: () => void;
    hideLayerControl: () => void;
}

const SearchPanel = ({ mapRef, drawRef, showLayerControl, hideLayerControl }: SearchPanelProps) => {
    const popupRef = useRef<maplibregl.Popup | null>(null);
    const [polygonDrawn, setPolygonDrawn] = useState(false);
    const [polygonConfirmed, setPolygonConfirmed] = useState(false);
    const [assetFeatures, setAssetFeatures] = useState<FeatureCollection<Point>>({ type: 'FeatureCollection', features: [] });

    const { handlePolygonDrawn, handlePolygonEdited, handlePolygonDeleted } = usePolygonHandlers({
        mapRef,
        popupRef,
        setPolygonDrawn,
        setPolygonConfirmed,
        showLayerControl,
    });

    const handleLocationSelect = useCallback(
        (lat: number, long: number, zoom: number) => {
            MapVisualHelper.flyToLocation(mapRef, lat, long, zoom);
        },
        [mapRef]
    );

    const handleAssetSelect = useCallback(
        (variant: Variation) => {
            if (!mapRef.current) return;

            const map = mapRef.current.getMap();
            const center = map.getCenter();

            const newFeature: Feature<Point> = {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [center.lng, center.lat],
                },
                properties: {
                    icon: variant.icon,
                },
            };

            setAssetFeatures((prevFeatures) => ({
                ...prevFeatures,
                features: [...prevFeatures.features, newFeature],
            }));
        },
        [mapRef]
    );

    return (
        <SearchContainer>
            <SearchGroup role="group" aria-label="Search controls" sx={{ minWidth: 400 }}>
                <SearchInput onSearchResultClick={handleLocationSelect} />
            </SearchGroup>

            <SearchGroup role="group" aria-label="Drawing controls">
                <DeletePolygonButton
                    drawRef={drawRef}
                    isVisible={polygonDrawn && polygonConfirmed}
                    onPolygonDeleted={handlePolygonDeleted}
                    hideLayerControl={hideLayerControl}
                />
                <StyledDivider orientation="vertical" flexItem />
                <EditPolygonButton
                    mapRef={mapRef}
                    drawRef={drawRef}
                    polygonConfirmationPopUpRef={popupRef}
                    isVisible={polygonDrawn && polygonConfirmed}
                    onPolygonEdited={handlePolygonEdited}
                    hideLayerControl={hideLayerControl}
                />
                <DrawPolygonButton
                    mapRef={mapRef}
                    drawRef={drawRef}
                    isVisible={!polygonConfirmed}
                    onPolygonDrawn={handlePolygonDrawn}
                    polygonDrawn={polygonDrawn}
                />
                <StyledDivider orientation="vertical" flexItem />
                <HideLayersButton mapRef={mapRef} />
            </SearchGroup>

            <SearchGroup>
                <AddAssetButton onAssetSelect={handleAssetSelect} />
            </SearchGroup>

            {assetFeatures.features.length > 0 && <AssetLayer data={assetFeatures} />}
        </SearchContainer>
    );
};

export default SearchPanel;
