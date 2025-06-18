import { render, screen } from '@testing-library/react';
import type { FeatureCollection, Polygon } from 'geojson';
import { describe, expect, it, vi } from 'vitest';
import PolygonLayer from './PolygonLayer';

interface LayerProps {
    id: string;
    type: string;
    filter: [string, string[], string];
    paint: {
        'fill-color'?: string;
        'fill-opacity'?: number;
        'line-color'?: string;
        'line-width'?: number;
    };
}

vi.mock('react-map-gl/maplibre', () => ({
    Source: ({ data, children }: { data: FeatureCollection<Polygon>; children: React.ReactNode }) => (
        <div data-testid="source" data-features={JSON.stringify(data.features)}>
            {children}
        </div>
    ),
    Layer: ({ id, type, filter, paint }: LayerProps) => (
        <div data-testid={`layer-${id}`} data-type={type} data-filter={JSON.stringify(filter)} data-paint={JSON.stringify(paint)} />
    ),
}));

describe('PolygonLayer', () => {
    const mockData: FeatureCollection<Polygon> = {
        type: 'FeatureCollection',
        features: [
            {
                type: 'Feature',
                geometry: {
                    type: 'Polygon',
                    coordinates: [
                        [
                            [0, 0],
                            [0, 1],
                            [1, 1],
                            [1, 0],
                            [0, 0],
                        ],
                    ],
                },
                properties: {
                    name: 'Least Suitable',
                },
            },
            {
                type: 'Feature',
                geometry: {
                    type: 'Polygon',
                    coordinates: [
                        [
                            [1, 1],
                            [1, 2],
                            [2, 2],
                            [2, 1],
                            [1, 1],
                        ],
                    ],
                },
                properties: {
                    name: 'Moderate Suitability',
                },
            },
            {
                type: 'Feature',
                geometry: {
                    type: 'Polygon',
                    coordinates: [
                        [
                            [2, 2],
                            [2, 3],
                            [3, 3],
                            [3, 2],
                            [2, 2],
                        ],
                    ],
                },
                properties: {
                    name: 'Most Suitable',
                },
            },
        ],
    };

    it('renders the source component with the provided data', () => {
        render(<PolygonLayer data={mockData} />);
        const source = screen.getByTestId('source');
        const features = JSON.parse(source.getAttribute('data-features') || '[]');
        expect(features).toHaveLength(3);
    });

    it('renders fill and outline layers for each area', () => {
        render(<PolygonLayer data={mockData} />);

        const layers = screen.getAllByTestId(/^layer-/);
        expect(layers).toHaveLength(6);

        const leastSuitableFill = screen.getByTestId('layer-Least Suitable-fill');
        const leastSuitableOutline = screen.getByTestId('layer-Least Suitable-outline');
        const moderateFill = screen.getByTestId('layer-Moderate Suitability-fill');
        const moderateOutline = screen.getByTestId('layer-Moderate Suitability-outline');
        const mostSuitableFill = screen.getByTestId('layer-Most Suitable-fill');
        const mostSuitableOutline = screen.getByTestId('layer-Most Suitable-outline');

        expect(leastSuitableFill).toBeInTheDocument();
        expect(leastSuitableOutline).toBeInTheDocument();
        expect(moderateFill).toBeInTheDocument();
        expect(moderateOutline).toBeInTheDocument();
        expect(mostSuitableFill).toBeInTheDocument();
        expect(mostSuitableOutline).toBeInTheDocument();
    });

    it('applies correct styling to fill layers', () => {
        render(<PolygonLayer data={mockData} />);

        const leastSuitableFill = screen.getByTestId('layer-Least Suitable-fill');
        const moderateFill = screen.getByTestId('layer-Moderate Suitability-fill');
        const mostSuitableFill = screen.getByTestId('layer-Most Suitable-fill');

        [leastSuitableFill, moderateFill, mostSuitableFill].forEach((layer) => {
            expect(layer).toHaveAttribute('data-type', 'fill');
            const paint = JSON.parse(layer.getAttribute('data-paint') || '{}');
            expect(paint).toHaveProperty('fill-opacity', 0.3);
        });

        const leastSuitablePaint = JSON.parse(leastSuitableFill.getAttribute('data-paint') || '{}');
        const moderatePaint = JSON.parse(moderateFill.getAttribute('data-paint') || '{}');
        const mostSuitablePaint = JSON.parse(mostSuitableFill.getAttribute('data-paint') || '{}');

        expect(leastSuitablePaint['fill-color']).toBe('#F44336');
        expect(moderatePaint['fill-color']).toBe('#FF9800');
        expect(mostSuitablePaint['fill-color']).toBe('#4CAF50');
    });

    it('applies correct styling to outline layers', () => {
        render(<PolygonLayer data={mockData} />);

        const leastSuitableOutline = screen.getByTestId('layer-Least Suitable-outline');
        const moderateOutline = screen.getByTestId('layer-Moderate Suitability-outline');
        const mostSuitableOutline = screen.getByTestId('layer-Most Suitable-outline');

        [leastSuitableOutline, moderateOutline, mostSuitableOutline].forEach((layer) => {
            expect(layer).toHaveAttribute('data-type', 'line');
            const paint = JSON.parse(layer.getAttribute('data-paint') || '{}');
            expect(paint).toHaveProperty('line-width', 2);
        });

        const leastSuitablePaint = JSON.parse(leastSuitableOutline.getAttribute('data-paint') || '{}');
        const moderatePaint = JSON.parse(moderateOutline.getAttribute('data-paint') || '{}');
        const mostSuitablePaint = JSON.parse(mostSuitableOutline.getAttribute('data-paint') || '{}');

        expect(leastSuitablePaint['line-color']).toBe('#F44336');
        expect(moderatePaint['line-color']).toBe('#FF9800');
        expect(mostSuitablePaint['line-color']).toBe('#4CAF50');
    });

    it('handles empty feature collection', () => {
        const emptyData: FeatureCollection<Polygon> = {
            type: 'FeatureCollection',
            features: [],
        };

        render(<PolygonLayer data={emptyData} />);
        const source = screen.getByTestId('source');
        const features = JSON.parse(source.getAttribute('data-features') || '[]');
        expect(features).toHaveLength(0);
    });
});
