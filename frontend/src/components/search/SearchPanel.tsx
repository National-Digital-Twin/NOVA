import { Box, styled } from '@mui/material';
import type MapboxDraw from '@mapbox/mapbox-gl-draw';
import { useCallback } from 'react';
import { type MapRef } from 'react-map-gl/maplibre';
import DeletePolygonButton from './delete-polygon/DeletePolygonButton';
import DrawPolygonButton from './draw-polygon/DrawPolygonButton';
import EditPolygonButton from './edit-polygon/EditPolygonButton';
import HideLayersButton from './hide-map-layers/HideLayersButton';
import SearchInput from './search-input/SearchInput';
import { usePolygonHandlers } from '../../hooks/usePolygonHandlers';
import AddAssetButton from './add-asset/AddAssetButton';
import { useMapStore } from '../../stores/useMapStore';
import { MapVisualHelper } from '../../utils/MapVisualHelper';

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

interface SearchPanelProps {
    drawRef: React.RefObject<MapboxDraw | null>;
    mapRef: React.RefObject<MapRef>;
    isPanelOpen: boolean;
    setIsPanelOpen: (isPanelOpen: boolean) => void;
}

const SearchPanel = ({ drawRef, mapRef, isPanelOpen, setIsPanelOpen }: SearchPanelProps) => {
    const cachedHeatmap = useMapStore((s) => s.cachedHeatmap);

    const { handlePolygonDeleted, startPolygonDraw, startPolygonEdit } = usePolygonHandlers({ mapRef, drawRef });

    const handleLocationSelect = useCallback((lat: number, long: number, zoom: number) => {
        MapVisualHelper.flyToLocation(lat, long, zoom);
    }, []);

    return (
        <SearchContainer>
            <SearchGroup role="group" aria-label="Search controls" sx={{ minWidth: 400 }}>
                <SearchInput onSearchResultClick={handleLocationSelect} />
            </SearchGroup>

            <SearchGroup role="group" aria-label="Drawing controls">
                <DrawPolygonButton startPolygonDraw={startPolygonDraw} />
                <DeletePolygonButton deletePolygon={handlePolygonDeleted} />
                <EditPolygonButton startPolygonEdit={startPolygonEdit} />
                <HideLayersButton mapRef={mapRef} cachedHeatmap={cachedHeatmap} />
            </SearchGroup>

            <SearchGroup>
                <AddAssetButton isPanelOpen={isPanelOpen} setIsPanelOpen={setIsPanelOpen} />
            </SearchGroup>
        </SearchContainer>
    );
};

export default SearchPanel;
