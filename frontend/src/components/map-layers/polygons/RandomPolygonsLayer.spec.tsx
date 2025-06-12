import { render, screen } from '@testing-library/react';
import type { Feature, Polygon } from 'geojson';
import { describe, expect, it, vi } from 'vitest';
import RandomPolygonsLayer from './RandomPolygonsLayer';

interface SourceProps {
    children: React.ReactNode;
    data: {
        features: Feature<Polygon>[];
    };
}

interface LayerProps {
    paint: {
        'fill-color': string[];
        'fill-opacity': string[];
        'fill-outline-color': string;
    };
}

vi.mock('react-map-gl/maplibre', () => ({
    Source: ({ children, data }: SourceProps) => (
        <div data-testid="map-source" data-features={JSON.stringify(data.features)}>
            {children}
        </div>
    ),
    Layer: ({ paint }: LayerProps) => <div data-testid="map-layer" data-paint={JSON.stringify(paint)} />,
}));

describe('RandomPolygonsLayer', () => {
    it('renders the source and layer components', () => {
        render(<RandomPolygonsLayer />);
        expect(screen.getByTestId('map-source')).toBeInTheDocument();
        expect(screen.getByTestId('map-layer')).toBeInTheDocument();
    });

    it('generates the correct number of polygons', () => {
        render(<RandomPolygonsLayer />);
        const source = screen.getByTestId('map-source');
        const features = JSON.parse(source.getAttribute('data-features') || '[]');
        expect(features).toHaveLength(10);
    });

    it('generates valid polygon features', () => {
        render(<RandomPolygonsLayer />);
        const source = screen.getByTestId('map-source');
        const features = JSON.parse(source.getAttribute('data-features') || '[]') as Feature<Polygon>[];

        features.forEach(feature => {
            expect(feature).toHaveProperty('type', 'Feature');
            expect(feature).toHaveProperty('properties');
            expect(feature).toHaveProperty('geometry');

            expect(feature.properties).toHaveProperty('color', 'rgb(0, 255, 0)');
            expect(feature.properties).toHaveProperty('opacity', 0.6);

            expect(feature.geometry).toHaveProperty('type', 'Polygon');
            expect(feature.geometry).toHaveProperty('coordinates');
            expect(Array.isArray(feature.geometry.coordinates)).toBe(true);
            expect(feature.geometry.coordinates[0].length).toBeGreaterThanOrEqual(6);
        });
    });

    it('applies correct paint properties to the layer', () => {
        render(<RandomPolygonsLayer />);
        const layer = screen.getByTestId('map-layer');
        const paint = JSON.parse(layer.getAttribute('data-paint') || '{}') as LayerProps['paint'];

        expect(paint).toHaveProperty('fill-color', ['get', 'color']);
        expect(paint).toHaveProperty('fill-opacity', ['get', 'opacity']);
        expect(paint).toHaveProperty('fill-outline-color', '#000');
    });

    it('generates polygons within the Isle of Wight bounds', () => {
        render(<RandomPolygonsLayer />);
        const source = screen.getByTestId('map-source');
        const features = JSON.parse(source.getAttribute('data-features') || '[]') as Feature<Polygon>[];

        const BOUNDS = { minLng: -1.58, maxLng: -1.06, minLat: 50.58, maxLat: 50.77 };
        const TOLERANCE = 0.02;

        features.forEach(feature => {
            const coordinates = feature.geometry.coordinates[0];
            coordinates.forEach(([lng, lat]) => {
                expect(lng).toBeGreaterThanOrEqual(BOUNDS.minLng - TOLERANCE);
                expect(lng).toBeLessThanOrEqual(BOUNDS.maxLng + TOLERANCE);
                expect(lat).toBeGreaterThanOrEqual(BOUNDS.minLat - TOLERANCE);
                expect(lat).toBeLessThanOrEqual(BOUNDS.maxLat + TOLERANCE);
            });
        });
    });

    it('renders without crashing', () => {
        render(<RandomPolygonsLayer />);
    });
});
