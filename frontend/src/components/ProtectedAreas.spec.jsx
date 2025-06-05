import { screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/test-utils';
import ProtectedAreas from './ProtectedAreas';

vi.mock('react-map-gl/mapbox', () => ({
    __esModule: true,
    Source: ({ children, id, type, data }) => (
        <div data-testid="map-source" id={id} type={type} data={JSON.stringify(data)}>
            {children}
        </div>
    ),
    Layer: ({ id, type }) => <div data-testid="map-layer" id={id} type={type} />,
}));

describe('ProtectedAreas', () => {
    it('renders nothing when not visible', () => {
        const { container } = renderWithTheme(<ProtectedAreas visible={false} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders source and layer when visible', () => {
        renderWithTheme(<ProtectedAreas visible={true} />);
        expect(screen.getByTestId('map-source')).toBeInTheDocument();
        expect(screen.getByTestId('map-layer')).toBeInTheDocument();
    });

    it('renders with correct source properties', () => {
        renderWithTheme(<ProtectedAreas visible={true} />);
        const source = screen.getByTestId('map-source');
        expect(source).toHaveAttribute('id', 'protected-areas-source');
        expect(source).toHaveAttribute('type', 'geojson');
    });

    it('renders with correct layer properties', () => {
        renderWithTheme(<ProtectedAreas visible={true} />);
        const layer = screen.getByTestId('map-layer');
        expect(layer).toHaveAttribute('id', 'protected-areas-fill');
        expect(layer).toHaveAttribute('type', 'fill');
    });
});
