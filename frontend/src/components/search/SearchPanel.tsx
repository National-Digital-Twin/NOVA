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
import { usePolygonHandlers } from '../../hooks/usePolygonHandlers';
import AddAssetButton from './add-asset/AddAssetButton';
import { useMapStore } from '../../stores/useMapStore';

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
    mapRef: React.RefObject<MapRef>;
    isPanelOpen: boolean;
    setIsPanelOpen: (isPanelOpen: boolean) => void;
}

const SearchPanel = ({ drawRef, mapRef, isPanelOpen, setIsPanelOpen }: SearchPanelProps) => {
    const popupRef = useRef<maplibregl.Popup | null>(null);
    const [polygonDrawn, setPolygonDrawn] = useState(false);
    const [polygonConfirmed, setPolygonConfirmed] = useState(false);
    const flyToLocation = useMapStore((s) => s.flyToLocation);

    const { handlePolygonDrawn, handlePolygonEdited, handlePolygonDeleted } = usePolygonHandlers({
        mapRef,
        popupRef,
        setPolygonDrawn,
        setPolygonConfirmed
    });

    const handleLocationSelect = useCallback(
        (lat: number, long: number, zoom: number) => {
            flyToLocation(lat, long, zoom);
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
                            isVisible={polygonDrawn && polygonConfirmed}
                            onPolygonDeleted={handlePolygonDeleted}
                        />
                        <StyledDivider orientation="vertical" flexItem />
                        <EditPolygonButton
                            mapRef={mapRef}
                            drawRef={drawRef}
                            polygonConfirmationPopUpRef={popupRef}
                            isVisible={polygonDrawn && polygonConfirmed}
                            onPolygonEdited={handlePolygonEdited}
                        />
                    </>
                )}

                <DrawPolygonButton
                    mapRef={mapRef}
                    drawRef={drawRef}
                    isVisible={!polygonConfirmed}
                    onPolygonDrawn={handlePolygonDrawn}
                    polygonDrawn={polygonDrawn}
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
