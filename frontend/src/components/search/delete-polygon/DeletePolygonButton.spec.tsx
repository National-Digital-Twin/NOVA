import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DeletePolygonButton from './DeletePolygonButton';

vi.mock('@mapbox/mapbox-gl-draw');

describe('DeletePolygonButton', () => {
    const deleteAllMock = vi.fn();
    const onPolygonDeletedMock = vi.fn();
    const hideLayerControlMock = vi.fn();

    const mockDrawRef = {
        current: {
            deleteAll: deleteAllMock,
        },
    } as unknown as React.RefObject<MapboxDraw>;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('does not render when isVisible is false', () => {
        render(<DeletePolygonButton drawRef={mockDrawRef} isVisible={false} onPolygonDeleted={onPolygonDeletedMock} hideLayerControl={hideLayerControlMock} />);

        expect(screen.queryByLabelText('Delete polygon')).not.toBeInTheDocument();
    });

    it('renders the button when isVisible is true', () => {
        render(<DeletePolygonButton drawRef={mockDrawRef} isVisible={true} onPolygonDeleted={onPolygonDeletedMock} hideLayerControl={hideLayerControlMock} />);

        expect(screen.getByLabelText('Delete polygon')).toBeInTheDocument();
    });

    it('handles null drawRef.current gracefully', () => {
        const nullDrawRef = { current: null } as unknown as React.RefObject<MapboxDraw>;

        render(<DeletePolygonButton drawRef={nullDrawRef} isVisible={true} onPolygonDeleted={onPolygonDeletedMock} hideLayerControl={hideLayerControlMock} />);

        const button = screen.getByLabelText('Delete polygon button');
        fireEvent.click(button);

        expect(onPolygonDeletedMock).not.toHaveBeenCalled();
        expect(hideLayerControlMock).not.toHaveBeenCalled();
    });
});
