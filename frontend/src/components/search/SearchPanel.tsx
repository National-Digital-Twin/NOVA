import { Box, Divider, styled } from '@mui/material';
import type { FeatureCollection, Geometry } from 'geojson';
import { useCallback, useRef, useState } from 'react';
import type { MapRef } from 'react-map-gl/maplibre';
import useMapboxDraw from '../../hooks/useMapboxDraw';
import DeletePolygonButton from './delete-polygon/DeletePolygonButton';
import DrawPolygonButton from './draw-polygon/DrawPolygonButton';
import PolygonLayer from './polygon-layer/PolygonLayer';
import SearchInput from './search-input/SearchInput';
import { MapVisualHelper } from '../../utils/MapVisualHelper';
import EditPolygonButton from './edit-polygon/EditPolygonButton';
import { usePolygonHandlers } from '../../hooks/usePolygonHandlers';
import maplibregl from 'maplibre-gl';
import type MapboxDraw from '@mapbox/mapbox-gl-draw';

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
    showLayerControl: () => void;
    hideLayerControl: () => void;
}

const SearchPanel = ({ mapRef, showLayerControl, hideLayerControl }: SearchPanelProps) => {
    const drawRef = useMapboxDraw(mapRef) as React.RefObject<MapboxDraw>;
    const popupRef = useRef<maplibregl.Popup | null>(null);

    const [layerData, setLayerData] = useState<FeatureCollection<Geometry> | null>(null);
    const [polygonDrawn, setPolygonDrawn] = useState(false);
    const [polygonConfirmed, setPolygonConfirmed] = useState(false);

    const { handlePolygonDrawn, handlePolygonEdited, handlePolygonDeleted } = usePolygonHandlers({
        mapRef,
        popupRef,
        setPolygonDrawn,
        setPolygonConfirmed,
        showLayerControl,
        clearLayerData: () => setLayerData(null),
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
            </SearchGroup>

            {layerData && <PolygonLayer data={layerData} />}
        </SearchContainer>
    );
};

export default SearchPanel;
