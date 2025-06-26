import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { Asset } from './AddAsset';
import AddAssetPanel from './AddAssetPanel';

let markerVariant: any = null;
const setMarkerVariant = vi.fn((variant) => {
    markerVariant = variant;
});

vi.mock('../../../stores/useMapStore', () => ({
    useMapStore: (selector: any) =>
        selector({
            markerVariant,
            setMarkerVariant,
        }),
}));

vi.mock('./AssetTypeSelector', () => ({
    default: ({ selectedAsset, onChange, assets }: any) => (
        <div data-testid="asset-type-selector">
            <select
                value={selectedAsset?.id}
                onChange={(e) => onChange(e.target.value)}
            >
                {assets?.map((asset: any) => (
                    <option key={asset.id} value={asset.id}>
                        {asset.name}
                    </option>
                ))}
            </select>
        </div>
    ),
}));

vi.mock('./AssetDetails', () => ({
    default: ({ selectedVariant }: any) => (
        <div data-testid="asset-details">
            <div>Preview</div>
            <div>Specifications</div>
            {selectedVariant && <img src={selectedVariant.image} alt="preview" />}
        </div>
    ),
}));

vi.mock('./AssetVariantSelector', () => ({
    default: ({ selectedAsset, selectedVariant, onChange }: any) => (
        <div data-testid="asset-variant-selector">
            {selectedAsset?.variations.map((variant: any) => (
                <label key={variant.name}>
                    <input
                        type="radio"
                        name="variant"
                        value={variant.name}
                        checked={selectedVariant?.name === variant.name}
                        onChange={() => {
                            onChange(variant);
                            markerVariant = variant;
                        }}
                    />
                    {variant.name}
                </label>
            ))}
        </div>
    ),
}));

describe('AddAssetPanel', () => {
    const mockAssets: Asset[] = [
        {
            id: 'windTurbine',
            name: 'Wind Turbine',
            variations: [
                {
                    name: 'Vestas',
                    image: '/images/turbine-one.png',
                    icon: '/images/turbine-icon.png',
                    specification: [
                        { name: 'Model', value: 'V150-6.0' },
                        { name: 'Rated Power', value: '6000 KW' },
                    ],
                },
                {
                    name: 'Siemens',
                    image: '/images/turbine-two.png',
                    icon: '/images/turbine-icon.png',
                    specification: [
                        { name: 'Model', value: 'SWT-6.0' },
                        { name: 'Rated Power', value: '6000 KW' },
                    ],
                },
            ],
        },
        {
            id: 'solarPanel',
            name: 'Solar Panel',
            variations: [
                {
                    name: 'Roof',
                    image: '/images/solar-one.png',
                    icon: '/images/solar-icon.png',
                    specification: [
                        { name: 'Model', value: 'R-100' },
                        { name: 'Capacity', value: '350 Wp' },
                    ],
                },
                {
                    name: 'Farm',
                    image: '/images/solar-two.png',
                    icon: '/images/solar-icon.png',
                    specification: [
                        { name: 'Model', value: 'F-200' },
                        { name: 'Capacity', value: '400 Wp' },
                    ],
                },
            ],
        },
    ];

    const mockOnClose = vi.fn();
    const mockOnSelect = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        markerVariant = null;
    });

    it('shows loading state initially', () => {
        vi.spyOn(window, 'fetch').mockImplementation(() => new Promise(() => {}));

        render(<AddAssetPanel onClose={mockOnClose} onSelect={mockOnSelect} />);

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('loads assets data and renders components', async () => {
        vi.spyOn(window, 'fetch').mockResolvedValueOnce({
            json: async () => mockAssets,
        } as Response);

        render(<AddAssetPanel onClose={mockOnClose} onSelect={mockOnSelect} />);

        await waitFor(() => {
            expect(screen.getByTestId('asset-type-selector')).toBeInTheDocument();
        });

        expect(screen.getByTestId('asset-details')).toBeInTheDocument();
        expect(screen.getByTestId('asset-variant-selector')).toBeInTheDocument();
    });

    it('calls onClose when cancel button is clicked', async () => {
        vi.spyOn(window, 'fetch').mockResolvedValueOnce({
            json: async () => mockAssets,
        } as Response);

        const user = userEvent.setup();
        render(<AddAssetPanel onClose={mockOnClose} onSelect={mockOnSelect} />);

        await waitFor(() => screen.getByText('CANCEL'));
        await user.click(screen.getByText('CANCEL'));
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onSelect when select button is clicked', async () => {
        vi.spyOn(window, 'fetch').mockResolvedValueOnce({
            json: async () => mockAssets,
        } as Response);

        markerVariant = mockAssets[0].variations[0];

        const user = userEvent.setup();
        render(<AddAssetPanel onClose={mockOnClose} onSelect={mockOnSelect} />);

        await waitFor(() => screen.getByText('SELECT'));
        await user.click(screen.getByText('SELECT'));

        expect(mockOnSelect).toHaveBeenCalledWith(mockAssets[0].variations[0]);
    });

    it('disables select button when no variant is selected', async () => {
        const assetsWithoutVariations = [
            {
                id: 'windTurbine',
                name: 'Wind Turbine',
                variations: [],
            },
        ];

        vi.spyOn(window, 'fetch').mockResolvedValueOnce({
            json: async () => assetsWithoutVariations,
        } as Response);

        markerVariant = null;

        render(<AddAssetPanel onClose={mockOnClose} onSelect={mockOnSelect} />);

        await waitFor(() => {
            const selectButton = screen.getByText('SELECT');
            expect(selectButton).toBeDisabled();
        });
    });

    it('shows loading state when fetch returns empty array', async () => {
        await act(async () => {
            vi.spyOn(window, 'fetch').mockResolvedValueOnce({
                json: async () => [],
            } as Response);

            render(<AddAssetPanel onClose={mockOnClose} onSelect={mockOnSelect} />);
        });

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('handles fetch error response gracefully', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        await act(async () => {
            vi.spyOn(window, 'fetch').mockResolvedValueOnce({
                ok: false,
                status: 404,
                json: async () => ({ error: 'Not found' }),
            } as Response);

            render(<AddAssetPanel onClose={mockOnClose} onSelect={mockOnSelect} />);
        });

        expect(screen.getByRole('progressbar')).toBeInTheDocument();

        consoleSpy.mockRestore();
    });

    it('changes asset type and selects first variant of new asset', async () => {
        vi.spyOn(window, 'fetch').mockResolvedValueOnce({
            json: async () => mockAssets,
        } as Response);

        const user = userEvent.setup();
        render(<AddAssetPanel onClose={mockOnClose} onSelect={mockOnSelect} />);

        await waitFor(() => {
            expect(screen.getByTestId('asset-type-selector')).toBeInTheDocument();
        });

        const selector = screen.getByTestId('asset-type-selector').querySelector('select');
        await user.selectOptions(selector!, ['solarPanel']);

        markerVariant = mockAssets[1].variations[0];

        await user.click(screen.getByText('SELECT'));

        expect(mockOnSelect).toHaveBeenCalledWith(mockAssets[1].variations[0]);
    });

    it('handles asset with no variations correctly', async () => {
        const assetsWithOneEmpty = [
            {
                id: 'windTurbine',
                name: 'Wind Turbine',
                variations: [
                    {
                        name: 'Vestas',
                        image: '/images/turbine-one.png',
                        icon: '/images/turbine-icon.png',
                        specification: [
                            { name: 'Model', value: 'V150-6.0' },
                            { name: 'Rated Power', value: '6000 KW' },
                        ],
                    },
                ],
            },
            {
                id: 'emptyAsset',
                name: 'Empty Asset',
                variations: [],
            },
        ];

        vi.spyOn(window, 'fetch').mockResolvedValueOnce({
            json: async () => assetsWithOneEmpty,
        } as Response);

        const user = userEvent.setup();
        render(<AddAssetPanel onClose={mockOnClose} onSelect={mockOnSelect} />);

        await waitFor(() => {
            expect(screen.getByTestId('asset-type-selector')).toBeInTheDocument();
        });

        const selector = screen.getByTestId('asset-type-selector').querySelector('select');
        await user.selectOptions(selector!, ['emptyAsset']);

        markerVariant = null;

        const selectButton = screen.getByText('SELECT');
        expect(selectButton).toBeDisabled();

        expect(screen.queryByTestId('asset-details')).not.toBeInTheDocument();
    });
});
