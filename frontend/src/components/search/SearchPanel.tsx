import type MapboxDraw from '@mapbox/mapbox-gl-draw';
import { Box, Divider, styled } from '@mui/material';
import type { FeatureCollection, Geometry, Polygon } from 'geojson';
import { useCallback, useRef, useState } from 'react';
import type { MapRef } from 'react-map-gl/maplibre';
import useMapboxDraw from '../../hooks/useMapboxDraw';
import DeletePolygonButton from './delete-polygon/DeletePolygonButton';
import DrawPolygonButton from './draw-polygon/DrawPolygonButton';
import PolygonLayer from './polygon-layer/PolygonLayer';
import SearchInput from './search-input/SearchInput';
import { MapMask } from '../../utils/MapMask';
import EditPolygonButton from './edit-polygon/EditPolygonButton';
import maplibregl from 'maplibre-gl';
import { createRoot } from 'react-dom/client';
import ConfirmPolygonButton from '../map-controls/confirm-polygon/ConfirmPolygonButton';
import { getPolygonConfirmationPopupPositionFromPolygon } from '../../utils/ConfirmPolygonPositionHelper';

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
}

const SearchPanel = ({ mapRef }: SearchPanelProps) => {
    const drawRef = useMapboxDraw(mapRef) as React.RefObject<MapboxDraw>;
    const setPopUpRef = useRef<maplibregl.Popup | null>(null);
    const [layerData, setLayerData] = useState<FeatureCollection<Geometry> | null>(null);
    const [polygonDrawn, setPolygonDrawn] = useState(false);
    const [polygonConfirmed, setPolygonConfirmed] = useState(false);

    const handleSearch = useCallback(
        async (query: string) => {
            if (!query.trim() || !mapRef.current) return;

            try {
                const response = await fetch('/data/mock-search-response.json');
                const data = await response.json();

                mapRef.current.getMap().flyTo({
                    center: data.coordinates as [number, number],
                    zoom: data.zoom,
                    duration: 2000,
                });
            } catch (error) {
                console.error('Error searching location:', error);
            }
        },
        [mapRef]
    );

    const handlePolygonDrawn = useCallback(async (drawnGeojson: FeatureCollection<Geometry>) => {
        setPolygonDrawn(true);
        setPolygonConfirmed(false);

        // Find first feature and mask (assuming it's always a Polygon)
        const polygon = drawnGeojson.features[0].geometry as Polygon;
        const popupNode = document.createElement('div');
        const root = createRoot(popupNode);

        const popup = new maplibregl.Popup({
            closeButton: false,
            closeOnClick: false,
            offset: [100, 0],
        })
            .setLngLat(getPolygonConfirmationPopupPositionFromPolygon(polygon))
            .setDOMContent(popupNode)
            .addTo(mapRef.current.getMap()!);

        setPopUpRef.current = popup;

        root.render(
            <ConfirmPolygonButton
                onConfirm={() => {
                    popup.remove();
                    setPopUpRef.current = null;
                    handlePolygonConfirmed(drawnGeojson);
                }}
            />
        );

        // drawRef.current.changeMode('static');
        // try {
        //     const response = await fetch('/data/sample-polygons.json', {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json',
        //         },
        //         body: JSON.stringify(drawnGeojson),
        //     });

        //     const data = await response.json();
        //     setLayerData(data);
        // } catch (error) {
        //     console.error('Error processing polygon data:', error);
        // }
    }, []);

    const handlePolygonEdited = useCallback(async (drawnGeojson: FeatureCollection<Geometry>) => {
        setPolygonDrawn(true);

        // Find first feature and mask (assuming it's always a Polygon)
        const firstFeatureAsPolygon = drawnGeojson.features[0].geometry as Polygon;
        MapMask.apply(mapRef.current.getMap(), firstFeatureAsPolygon);
    }, []);

    const handlePolygonConfirmed = useCallback(async (drawnGeojson: FeatureCollection<Geometry>) => {
        setPolygonConfirmed(true);
        const firstFeatureAsPolygon = drawnGeojson.features[0].geometry as Polygon;
        MapMask.apply(mapRef.current.getMap(), firstFeatureAsPolygon);
    }, []);

    const handlePolygonDeleted = useCallback(async () => {
        setPolygonDrawn(false);
        setPolygonConfirmed(false);
        setLayerData(null);
        MapMask.remove(mapRef.current.getMap());

        if (setPopUpRef.current) {
            setPopUpRef.current.remove();
            setPopUpRef.current = null;
        }
    }, []);

    return (
        <SearchContainer>
            <SearchGroup role="group" aria-label="Search controls" sx={{ minWidth: 400 }}>
                <SearchInput onSearch={handleSearch} />
            </SearchGroup>

            <SearchGroup role="group" aria-label="Drawing controls">
                <DeletePolygonButton drawRef={drawRef} isVisible={polygonDrawn && polygonConfirmed} onPolygonDeleted={handlePolygonDeleted} />
                <StyledDivider orientation="vertical" flexItem />
                <EditPolygonButton mapRef={mapRef} drawRef={drawRef} setPopUpRef={setPopUpRef} isVisible={polygonDrawn && polygonConfirmed} onPolygonEdited={handlePolygonEdited} />
                <DrawPolygonButton mapRef={mapRef} drawRef={drawRef} isVisible={!polygonConfirmed} onPolygonDrawn={handlePolygonDrawn} polygonDrawn={polygonDrawn} />
            </SearchGroup>

            {layerData && <PolygonLayer data={layerData} />}
        </SearchContainer>
    );
};

export default SearchPanel;
