import { render, screen } from '@testing-library/react';
import type { Feature, Point } from 'geojson';
import { describe, expect, it, vi } from 'vitest';
import RandomHeatmapLayer from './RandomHeatmapLayer';

interface SourceProps {
    children: React.ReactNode;
    data: {
        features: Feature<Point>[];
    };
}

interface LayerProps {
    id: string;
    type: string;
    minzoom?: number;
    maxzoom?: number;
    paint: {
        'heatmap-weight'?: string[];
        'heatmap-intensity'?: (string | number | (string | number)[])[];
        'heatmap-color'?: (string | number | (string | number)[])[];
        'heatmap-radius'?: (string | number | (string | number)[])[];
        'heatmap-opacity'?: (string | number | (string | number)[])[];
        'circle-radius'?: (string | number | (string | number)[])[];
        'circle-color'?: (string | number | (string | number)[])[];
        'circle-stroke-width'?: number;
        'circle-stroke-color'?: string;
        'circle-opacity'?: (string | number | (string | number)[])[];
    };
}

vi.mock('react-map-gl/maplibre', () => ({
    Source: ({ children, data }: SourceProps) => (
        <div data-testid="map-source" data-features={JSON.stringify(data.features)}>
            {children}
        </div>
    ),
    Layer: ({ id, type, minzoom, maxzoom, paint }: LayerProps) => (
        <div data-testid={`map-layer-${id}`} data-type={type} data-minzoom={minzoom} data-maxzoom={maxzoom} data-paint={JSON.stringify(paint)} />
    ),
}));

describe('RandomHeatmapLayer', () => {
    it('renders the source and layer components', () => {
        render(<RandomHeatmapLayer />);
        expect(screen.getByTestId('map-source')).toBeInTheDocument();
        expect(screen.getByTestId('map-layer-random-heatmap')).toBeInTheDocument();
        expect(screen.getByTestId('map-layer-random-heatmap-points')).toBeInTheDocument();
    });

    it('generates the correct number of points', () => {
        render(<RandomHeatmapLayer />);
        const source = screen.getByTestId('map-source');
        const features = JSON.parse(source.getAttribute('data-features') || '[]');
        expect(features).toHaveLength(100);
    });

    it('generates valid point features', () => {
        render(<RandomHeatmapLayer />);
        const source = screen.getByTestId('map-source');
        const features = JSON.parse(source.getAttribute('data-features') || '[]') as Feature<Point>[];

        features.forEach(feature => {
            expect(feature).toHaveProperty('type', 'Feature');
            expect(feature).toHaveProperty('properties');
            expect(feature).toHaveProperty('geometry');

            const properties = feature.properties;
            expect(properties).not.toBeNull();
            if (properties) {
                expect(properties).toHaveProperty('intensity');
                expect(typeof properties.intensity).toBe('number');
                expect(properties.intensity).toBeGreaterThanOrEqual(0);
                expect(properties.intensity).toBeLessThanOrEqual(1);
            }

            expect(feature.geometry).toHaveProperty('type', 'Point');
            expect(feature.geometry).toHaveProperty('coordinates');
            expect(Array.isArray(feature.geometry.coordinates)).toBe(true);
            expect(feature.geometry.coordinates).toHaveLength(2);
        });
    });

    it('applies correct paint properties to the heatmap layer', () => {
        render(<RandomHeatmapLayer />);
        const layer = screen.getByTestId('map-layer-random-heatmap');
        const paint = JSON.parse(layer.getAttribute('data-paint') || '{}') as LayerProps['paint'];
        const maxzoom = layer.getAttribute('data-maxzoom');

        expect(maxzoom).toBe('10');
        expect(paint).toHaveProperty('heatmap-weight', ['get', 'intensity']);

        const checkInterpolate = (property: string, expected: (string | number | (string | number)[])[]) => {
            const value = paint[property as keyof LayerProps['paint']];
            if (!Array.isArray(value)) {
                throw new Error(`Expected ${property} to be an array`);
            }
            expect(value[0]).toBe('interpolate');
            expect(value[1]).toEqual(['linear']);
            expect(value[2]).toEqual(['zoom']);
            expect(value.slice(3)).toEqual(expected.slice(3));
        };

        checkInterpolate('heatmap-intensity', ['interpolate', 'linear', ['zoom'], 0, 1, 10, 5]);
        checkInterpolate('heatmap-radius', ['interpolate', 'linear', ['zoom'], 0, 2, 15, 10]);
        checkInterpolate('heatmap-opacity', ['interpolate', 'linear', ['zoom'], 8, 1, 10, 0.2]);

        const colorRamp = paint['heatmap-color'];
        expect(colorRamp).toContain('rgba(33,102,172,0)');
        expect(colorRamp).toContain('rgb(103,169,207)');
        expect(colorRamp).toContain('rgb(209,229,240)');
        expect(colorRamp).toContain('rgb(253,219,199)');
        expect(colorRamp).toContain('rgb(239,138,98)');
        expect(colorRamp).toContain('rgb(178,24,43)');
    });

    it('applies correct paint properties to the circle layer', () => {
        render(<RandomHeatmapLayer />);
        const layer = screen.getByTestId('map-layer-random-heatmap-points');
        const paint = JSON.parse(layer.getAttribute('data-paint') || '{}') as LayerProps['paint'];
        const minzoom = layer.getAttribute('data-minzoom');

        expect(minzoom).toBe('8');
        expect(paint).toHaveProperty('circle-stroke-width', 1);
        expect(paint).toHaveProperty('circle-stroke-color', 'rgba(255,255,255,0.5)');

        const checkInterpolate = (property: string, expected: (string | number | (string | number)[])[]) => {
            const value = paint[property as keyof LayerProps['paint']];
            if (!Array.isArray(value)) {
                throw new Error(`Expected ${property} to be an array`);
            }
            expect(value[0]).toBe('interpolate');
            expect(value[1]).toEqual(['linear']);
            expect(value[2]).toEqual(['zoom']);
            expect(value.slice(3)).toEqual(expected.slice(3));
        };

        checkInterpolate('circle-radius', ['interpolate', 'linear', ['zoom'], 8, 2, 15, 10]);
        checkInterpolate('circle-opacity', ['interpolate', 'linear', ['zoom'], 8, 0, 15, 1]);

        expect(paint).toHaveProperty('circle-color', 'rgba(103,169,207,0.8)');
    });

    it('generates points within the Isle of Wight bounds', () => {
        render(<RandomHeatmapLayer />);
        const source = screen.getByTestId('map-source');
        const features = JSON.parse(source.getAttribute('data-features') || '[]') as Feature<Point>[];

        const BOUNDS = { minLng: -1.58, maxLng: -1.06, minLat: 50.58, maxLat: 50.77 };
        const TOLERANCE = 0.02;

        features.forEach(feature => {
            const [lng, lat] = feature.geometry.coordinates;
            expect(lng).toBeGreaterThanOrEqual(BOUNDS.minLng - TOLERANCE);
            expect(lng).toBeLessThanOrEqual(BOUNDS.maxLng + TOLERANCE);
            expect(lat).toBeGreaterThanOrEqual(BOUNDS.minLat - TOLERANCE);
            expect(lat).toBeLessThanOrEqual(BOUNDS.maxLat + TOLERANCE);
        });
    });
});
