import { Box, Divider, styled } from '@mui/material';
import { useCallback, useRef, useState } from 'react';
import type { MapRef } from 'react-map-gl/maplibre';
import DeletePolygonButton from './delete-polygon/DeletePolygonButton';
import DrawPolygonButton from './draw-polygon/DrawPolygonButton';
import SearchInput from './search-input/SearchInput';
import { MapVisualHelper } from '../../utils/MapVisualHelper';
import EditPolygonButton from './edit-polygon/EditPolygonButton';
import { usePolygonHandlers } from '../../hooks/usePolygonHandlers';
import maplibregl from 'maplibre-gl';
import type MapboxDraw from '@mapbox/mapbox-gl-draw';
import HideLayersButton from './hide-map-layers/HideLayersButton';

const SearchContainer = styled(Box)({
    position: 'absolute',
    top: '1rem',
    left: '1rem',
    display: 'flex',
    flexDirection: 'row',
    gap: '1rem',
    zIndex: 1,
});

const SearchGroup = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[2],
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
        </SearchContainer>
    );
};

export default SearchPanel;
