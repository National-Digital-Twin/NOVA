import { screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/test-utils';
import WindTurbines from './WindTurbines';

vi.mock('react-map-gl/mapbox', () => ({
    __esModule: true,
    Source: ({ children, id, type, data }) => (
        <div data-testid="map-source" id={id} type={type} data={JSON.stringify(data)}>
            {children}
        </div>
    ),
    Layer: ({ id, type }) => <div data-testid="map-layer" id={id} type={type} />,
}));

describe('WindTurbines', () => {
    it('renders nothing when not visible', () => {
        const { container } = renderWithTheme(<WindTurbines visible={false} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders source and layers when visible', () => {
        renderWithTheme(<WindTurbines visible={true} />);
        expect(screen.getByTestId('map-source')).toBeInTheDocument();
        const layers = screen.getAllByTestId('map-layer');
        expect(layers).toHaveLength(2);
    });

    it('renders with correct source properties', () => {
        renderWithTheme(<WindTurbines visible={true} />);
        const source = screen.getByTestId('map-source');
        expect(source).toHaveAttribute('id', 'wind-turbines-source');
        expect(source).toHaveAttribute('type', 'geojson');
    });

    it('renders with correct layer properties', () => {
        renderWithTheme(<WindTurbines visible={true} />);
        const layers = screen.getAllByTestId('map-layer');

        expect(layers[0]).toHaveAttribute('id', 'wind-turbines-heat');
        expect(layers[0]).toHaveAttribute('type', 'heatmap');

        expect(layers[1]).toHaveAttribute('id', 'wind-turbines-point');
        expect(layers[1]).toHaveAttribute('type', 'circle');
    });

    it('generates random points within IOW bounds', () => {
        renderWithTheme(<WindTurbines visible={true} />);
        const source = screen.getByTestId('map-source');
        const data = JSON.parse(source.getAttribute('data'));

        expect(data.features).toBeDefined();
        expect(data.features.length).toBe(100);

        data.features.forEach(feature => {
            const [lng, lat] = feature.geometry.coordinates;
            expect(lng).toBeGreaterThanOrEqual(-1.5937);
            expect(lng).toBeLessThanOrEqual(-1.0623);
            expect(lat).toBeGreaterThanOrEqual(50.5761);
            expect(lat).toBeLessThanOrEqual(50.7696);
        });
    });

    it('generates features with correct properties', () => {
        renderWithTheme(<WindTurbines visible={true} />);
        const source = screen.getByTestId('map-source');
        const data = JSON.parse(source.getAttribute('data'));

        data.features.forEach((feature, index) => {
            expect(feature.type).toBe('Feature');
            expect(feature.properties).toEqual({
                id: index,
                name: `Wind Turbine ${index + 1}`,
                intensity: expect.any(Number),
            });
            expect(feature.properties.intensity).toBeGreaterThanOrEqual(0.5);
            expect(feature.properties.intensity).toBeLessThanOrEqual(1);
            expect(feature.geometry.type).toBe('Point');
            expect(feature.geometry.coordinates).toHaveLength(2);
        });
    });
});
