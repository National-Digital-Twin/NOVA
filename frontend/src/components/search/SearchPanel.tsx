import { Box, Divider, styled } from '@mui/material';
import type MapboxDraw from '@mapbox/mapbox-gl-draw';
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
import AddAssetButton from './add-asset/AddAssetButton';

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
    drawRef: React.RefObject<MapboxDraw | null>;
    hideLayerControl: () => void;
    mapRef: React.RefObject<MapRef>;
    isPanelOpen: boolean;
    setIsPanelOpen: (isPanelOpen: boolean) => void;
    showLayerControl: () => void;
}

const SearchPanel = ({ drawRef, hideLayerControl, mapRef, isPanelOpen, setIsPanelOpen, showLayerControl }: SearchPanelProps) => {
    const popupRef = useRef<maplibregl.Popup | null>(null);
    const [polygonDrawn, setPolygonDrawn] = useState(false);
    const [polygonConfirmed, setPolygonConfirmed] = useState(false);

    const {
        handlePolygonEdited,
        handlePolygonDeleted,
        startPolygonDraw,
    } = usePolygonHandlers({ mapRef, popupRef, drawRef, showLayerControl });

    const handleLocationSelect = useCallback(
        (lat: number, long: number, zoom: number) => {
            MapVisualHelper.flyToLocation(mapRef, lat, long, zoom);
        },
        [mapRef]
    );

    return (
        <SearchContainer>
            <SearchGroup role="group" aria-label="Search controls" sx={{ minWidth: 400 }}>
                <SearchInput onSearchResultClick={handleLocationSelect} />
            </SearchGroup>

            <SearchGroup role="group" aria-label="Drawing controls">
                {polygonConfirmed && (
                    <>
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
                    </>
                )}

                <DrawPolygonButton
                    mapRef={mapRef}
                    drawRef={drawRef}
                    isVisible={!polygonConfirmed}
                    startPolygonDraw={startPolygonDraw}
                />

                <HideLayersButton mapRef={mapRef} />
            </SearchGroup>

            <SearchGroup>
                <AddAssetButton isPanelOpen={isPanelOpen} setIsPanelOpen={setIsPanelOpen} />
            </SearchGroup>
        </SearchContainer>
    );
};

export default SearchPanel;
