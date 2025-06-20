import React, { useState, useMemo, useId } from 'react';
import {
    Paper, Accordion, AccordionSummary, AccordionDetails, Checkbox, TextField,
    Button, Typography, Divider, InputAdornment, IconButton, Box
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import maplibregl from 'maplibre-gl';
import type { MapRef } from 'react-map-gl/maplibre';
import { MapVisualHelper } from '../../utils/MapVisualHelper';

interface LayerControlPanelProps {
    mapRef: React.RefObject<MapRef>;
}

const layers = {
    'Environmental protected sites': [
        { name: 'Areas of outstanding natural beauty' },
        { name: 'Special protection areas' },
        { name: 'Sites of special scientific interest' },
        { name: 'Special areas of conservation' },
    ],
    Weather: [{ name: 'Wind speed' }],
    Residential: [{ name: 'Built up areas' }],
    'Network infrastructure': [],
    Consumption: [],
};

const LayerControlPanel = ({ mapRef }: LayerControlPanelProps) => {
    const defaultExpandedCategory = Object.entries(layers).find(([, items]) => items.length > 0)?.[0] || '';
    const idPrefix = useId();
    const [searchTerm, setSearchTerm] = useState('');
    const [open, setOpen] = useState(true);
    const [checkedLayers, setCheckedLayers] = useState<Record<string, boolean>>(() => {
        const initial: Record<string, boolean> = {};
        Object.values(layers).forEach((group) => {
            group.forEach((item) => { initial[item.name] = true; });
        });
        return initial;
    });
    const [expandedPanels, setExpandedPanels] = useState<string[]>(defaultExpandedCategory ? [defaultExpandedCategory] : []);

    const handleCheckboxChange = (layerName: string) => {
        setCheckedLayers((prev) => ({
            ...prev,
            [layerName]: !prev[layerName],
        }));
    };

    const handleAccordionToggle = (category: string) => {
        setExpandedPanels((prev) => (prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]));
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (value.trim() === '') return;

        const lower = value.toLowerCase();
        const matching = Object.entries(layers)
            .filter(([, items]) => items.some((item) => item.name.toLowerCase().includes(lower)))
            .map(([category]) => category);

        setExpandedPanels(matching);
    };

    const clearSearch = () => {
        setSearchTerm('');
        setExpandedPanels(defaultExpandedCategory ? [defaultExpandedCategory] : []);
    };

    const handleApply = async () => {
        if (!mapRef.current) {
            console.error('Map instance not available.');
            return;
        }

        try {
            const response = await fetch('/data/sample-polygons.json');
            if (!response.ok) throw new Error('Failed to fetch GeoJSON');
            const geojson = await response.json();

            MapVisualHelper.addOrUpdateHeatmapLayer(mapRef, geojson);
        } catch (error) {
            console.error('Error fetching or applying GeoJSON:', error);
        }
    };

    const filteredLayerEntries = useMemo(() => {
        return Object.entries(layers).map(([category, items]) => {
            const filteredItems = items.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
            if (filteredItems.length === 0) return null;

            return (
                <Accordion
                    key={category}
                    expanded={expandedPanels.includes(category)}
                    onChange={() => handleAccordionToggle(category)}
                    className="layer-accordion"
                    disableGutters
                >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} className="layer-accordion-summary">
                        <Typography>{category}</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0.5, pb: 0 }}>
                        {filteredItems.map((item) => {
                            const checkboxId = `${idPrefix}-${item.name.replace(/\s+/g, '-')}`;
                            return (
                                <Box key={item.name} className="layer-item">
                                    <label htmlFor={checkboxId}>
                                        <Typography variant="body2">{item.name}</Typography>
                                        <Checkbox
                                            id={checkboxId}
                                            checked={checkedLayers[item.name] || false}
                                            onChange={() => handleCheckboxChange(item.name)}
                                        />
                                    </label>
                                </Box>
                            );
                        })}
                    </AccordionDetails>
                </Accordion>
            );
        });
    }, [searchTerm, expandedPanels, checkedLayers, idPrefix]);

    const hasSearchResults = filteredLayerEntries.some(Boolean);

    return (
        <>
            <Box className="layer-panel-toggle" sx={{ left: open ? '430px' : '1rem' }}>
                <IconButton onClick={() => setOpen(!open)}>
                    <ArrowBackIosNewIcon fontSize="small" sx={{ transform: !open ? 'rotate(180deg)' : 'none' }} />
                </IconButton>
            </Box>

            {open && (
                <Paper className="layer-panel" elevation={4}>
                    <Box className="layer-panel-header">
                        <LayersOutlinedIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="subtitle1">Layers</Typography>
                    </Box>

                    <Box className="layer-panel-search">
                        <TextField
                            fullWidth
                            variant="outlined"
                            size="small"
                            placeholder="Search for layers"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ fontSize: 20, color: 'grey.600' }} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: searchTerm && (
                                        <InputAdornment position="end">
                                            <IconButton size="small" onClick={clearSearch} aria-label="Clear search">
                                                <HighlightOffIcon />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                    sx: { borderRadius: 2 },
                                },
                            }}
                        />
                    </Box>

                    <Box className="layer-panel-selectable-layers">
                        {hasSearchResults ? (
                            filteredLayerEntries
                        ) : (
                            <Box sx={{ px: 2, pt: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    No results
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    <Divider sx={{ my: 2, opacity: 0.3 }} />

                    <Box className="layer-panel-footer">
                        <Button variant="contained" onClick={handleApply} sx={{ px: 4 }}>
                            APPLY
                        </Button>
                    </Box>
                </Paper>
            )}
        </>
    );
};

export default LayerControlPanel;
