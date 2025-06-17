import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DeletePolygonButton from './DeletePolygonButton';

vi.mock('@mapbox/mapbox-gl-draw');

describe('DeletePolygonButton', () => {
    const mockDrawRef = {
        current: {
            deleteAll: vi.fn(),
            getMode: vi.fn().mockReturnValue('simple_select') as unknown as () => string,
        },
    } as unknown as React.RefObject<MapboxDraw>;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the button with correct aria label', () => {
        render(<DeletePolygonButton drawRef={mockDrawRef} />);
        expect(screen.getByLabelText('Delete polygon')).toBeInTheDocument();
    });

    it('deletes all polygons when clicked', () => {
        render(<DeletePolygonButton drawRef={mockDrawRef} />);
        const button = screen.getByLabelText('Delete polygon');

        fireEvent.click(button);
        expect(mockDrawRef.current?.deleteAll).toHaveBeenCalled();
    });

    it('is enabled when map is initialized', () => {
        render(<DeletePolygonButton drawRef={mockDrawRef} />);
        const button = screen.getByLabelText('Delete polygon');
        expect(button).not.toBeDisabled();
    });

    it('handles null drawRef.current gracefully', () => {
        const nullDrawRef = { current: null } as unknown as React.RefObject<MapboxDraw>;
        render(<DeletePolygonButton drawRef={nullDrawRef} />);
        const button = screen.getByLabelText('Delete polygon');

        fireEvent.click(button);
        expect(button).toBeInTheDocument();
    });
});
