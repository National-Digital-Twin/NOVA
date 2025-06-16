import type MapboxDraw from '@mapbox/mapbox-gl-draw';
import { Box, Divider, styled } from '@mui/material';
import type { FeatureCollection, Geometry, Polygon } from 'geojson';
import { useCallback, useState } from 'react';
import type { MapRef } from 'react-map-gl/maplibre';
import useMapboxDraw from '../../hooks/useMapboxDraw';
import DeletePolygonButton from './delete-polygon/DeletePolygonButton';
import DrawPolygonButton from './draw-polygon/DrawPolygonButton';
import PolygonLayer from './polygon-layer/PolygonLayer';
import SearchInput from './search-input/SearchInput';
import { MapMask } from '../../utils/MapMask';

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
    const [layerData, setLayerData] = useState<FeatureCollection<Geometry> | null>(null);
    const [polygonDrawn, setPolygonDrawn] = useState(false);

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

        // Find first feature and apply mask assuming it's a Polygon
        const firstFeature = drawnGeojson.features[0];
        if (firstFeature?.geometry.type === 'Polygon') {
            const polygon = firstFeature.geometry as Polygon;
            MapMask.apply(mapRef.current.getMap(), polygon);
        } else {
            console.warn('Expected a Polygon geometry but got:', firstFeature?.geometry.type);
            return;
        }

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

    const handlePolygonDeleted = useCallback(async () => {
        setPolygonDrawn(false);
        setLayerData(null);
        MapMask.remove(mapRef.current.getMap());
    }, []);

    return (
        <SearchContainer>
            <SearchGroup role="group" aria-label="Search controls" sx={{ minWidth: 400 }}>
                <SearchInput onSearch={handleSearch} />
            </SearchGroup>

            <SearchGroup role="group" aria-label="Drawing controls">
                <DrawPolygonButton mapRef={mapRef} drawRef={drawRef} isVisible={!polygonDrawn} onPolygonDrawn={handlePolygonDrawn} />
                <StyledDivider orientation="vertical" flexItem />
                <DeletePolygonButton drawRef={drawRef} isVisible={polygonDrawn} onPolygonDeleted={handlePolygonDeleted}/>
            </SearchGroup>

            {layerData && <PolygonLayer data={layerData} />}
        </SearchContainer>
    );
};

export default SearchPanel;
