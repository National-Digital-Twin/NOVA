import React, { useState, useMemo, useId } from 'react';
import {
    Paper,
    Drawer,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Checkbox,
    TextField,
    Button,
    Typography,
    Divider,
    InputAdornment,
    IconButton,
    Box,
    CircularProgress,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import type { MapRef } from 'react-map-gl/maplibre';
import { MapVisualHelper } from '../../utils/MapVisualHelper';

interface LayerControlPanelProps {
    mapRef: React.RefObject<MapRef>;
}

interface UserParam {
    label: string;
    type: 'number';
    default: number;
}

interface LayerItem {
    name: string;
    userAdjustableParameters: UserParam[];
}

const layers: Record<string, LayerItem[]> = {
    'Environmental protected sites': [
        {
            name: 'Areas of outstanding natural beauty',
            userAdjustableParameters: [{ label: 'Distance from layer', type: 'number', default: 2 }],
        },
        {
            name: 'Special protection areas',
            userAdjustableParameters: [{ label: 'Distance from layer', type: 'number', default: 2 }],
        },
        {
            name: 'Sites of special scientific interest',
            userAdjustableParameters: [{ label: 'Distance from layer', type: 'number', default: 2 }],
        },
        {
            name: 'Special areas of conservation',
            userAdjustableParameters: [{ label: 'Distance from layer', type: 'number', default: 2 }],
        },
    ],
    Weather: [
        {
            name: 'Wind speed',
            userAdjustableParameters: [{ label: 'Distance from layer', type: 'number', default: 2 }],
        },
    ],
    Residential: [
        {
            name: 'Built up areas',
            userAdjustableParameters: [{ label: 'Distance from layer', type: 'number', default: 2 }],
        },
    ],
    'Network infrastructure': [],
    Consumption: [],
};

const LayerControlPanel = ({ mapRef }: LayerControlPanelProps) => {
    const idPrefix = useId();

    const [searchTerm, setSearchTerm] = useState('');
    const [open, setOpen] = useState(true);
    const [checkedLayers, setCheckedLayers] = useState<Record<string, boolean>>(() => {
        const init: Record<string, boolean> = {};
        Object.values(layers)
            .flat()
            .forEach((item) => {
                init[item.name] = true;
            });
        return init;
    });

    const defaultExpanded = Object.entries(layers).find(([, items]) => items.length > 0)?.[0] || '';
    const [expandedPanels, setExpandedPanels] = useState<string[]>(defaultExpanded ? [defaultExpanded] : []);

    const [layerSettings, setLayerSettings] = useState<Record<string, Record<string, number>>>(() => {
        const init: Record<string, Record<string, number>> = {};
        Object.values(layers)
            .flat()
            .forEach((item) => {
                init[item.name] = {};
                item.userAdjustableParameters.forEach((p) => {
                    init[item.name][p.label] = p.default;
                });
            });
        return init;
    });

    const [propOpen, setPropOpen] = useState(false);
    const [currentLayer, setCurrentLayer] = useState<string | null>(null);

    // new loading flag
    const [loading, setLoading] = useState(false);

    const handleCheckboxChange = (name: string) => {
        setCheckedLayers((prev) => ({
            ...prev,
            [name]: !prev[name],
        }));
    };

    const handleAccordionToggle = (category: string) => {
        setExpandedPanels((prev) => (prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]));
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        setSearchTerm(v);

        if (!v.trim()) {
            setExpandedPanels(defaultExpanded ? [defaultExpanded] : []);
            return;
        }

        const lower = v.toLowerCase();
        const matches = Object.entries(layers)
            .filter(([, items]) => items.some((item) => item.name.toLowerCase().includes(lower)))
            .map(([cat]) => cat);

        setExpandedPanels(matches);
    };

    const clearSearch = () => {
        setSearchTerm('');
        setExpandedPanels(defaultExpanded ? [defaultExpanded] : []);
    };

    const openProps = (name: string) => {
        setCurrentLayer(name);
        setPropOpen(true);
    };

    const closeProps = () => {
        setPropOpen(false);
        setCurrentLayer(null);
    };

    const handleParamChange = (paramLabel: string, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!currentLayer) return;
        const value = Number(e.target.value);
        setLayerSettings((prev) => ({
            ...prev,
            [currentLayer]: {
                ...prev[currentLayer],
                [paramLabel]: isNaN(value) ? 0 : value,
            },
        }));
    };

    const confirmProps = () => {
        closeProps();
    };

    const handleApply = async () => {
        if (!mapRef.current) return;

        // show spinner
        setLoading(true);

        // simulate a 10 s API call
        await new Promise((r) => setTimeout(r, 10_000));

        // fetch mocked GeoJSON
        const response = await fetch('/data/sample-polygons.json');
        if (!response.ok) throw new Error('Failed to fetch GeoJSON');
        const geojson = await response.json();

        MapVisualHelper.addOrUpdateHeatmapLayer(mapRef, geojson);

        // hide spinner
        setLoading(false);
    };

    const filteredLayerEntries = useMemo(() => {
        return Object.entries(layers).map(([category, items]) => {
            const visible = items.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
            if (!visible.length) return null;

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
                        {visible.map((item) => {
                            const checkboxId = `${idPrefix}-${item.name.replace(/\s+/g, '-')}`;
                            return (
                                <Box key={item.name} className="layer-item">
                                    <label htmlFor={checkboxId}>
                                        <Typography variant="body2">{item.name}</Typography>
                                        <Checkbox id={checkboxId} checked={checkedLayers[item.name]} onChange={() => handleCheckboxChange(item.name)} />
                                    </label>
                                    <IconButton size="small" onClick={() => openProps(item.name)}>
                                        <MoreVertIcon fontSize="small" />
                                    </IconButton>
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
            {/* hide/show toggle */}
            <Box className="layer-panel-toggle" sx={{ left: open ? '430px' : '1rem' }}>
                <IconButton onClick={() => setOpen((o) => !o)}>
                    <ArrowBackIosNewIcon
                        fontSize="small"
                        sx={{
                            transform: !open ? 'rotate(180deg)' : 'none',
                        }}
                    />
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
                                            <SearchIcon
                                                sx={{
                                                    fontSize: 20,
                                                    color: 'grey.600',
                                                }}
                                            />
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

            {/* properties drawer */}
            <Drawer anchor="left" open={propOpen} onClose={closeProps}>
                <Box sx={{ width: 280 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            px: 2,
                            pt: 1,
                            mb: 2,
                        }}
                    >
                        <Typography variant="h6">Properties panel</Typography>
                        <IconButton onClick={closeProps}>
                            <HighlightOffIcon />
                        </IconButton>
                    </Box>

                    <Box sx={{ px: 2 }}>
                        {currentLayer &&
                            Object.values(layers)
                                .flat()
                                .find((li) => li.name === currentLayer)!
                                .userAdjustableParameters.map((param) => (
                                    <TextField
                                        key={param.label}
                                        label={param.label}
                                        type={param.type}
                                        fullWidth
                                        value={layerSettings[currentLayer][param.label]}
                                        onChange={(e) => handleParamChange(param.label, e)}
                                        slotProps={{
                                            input: {
                                                endAdornment: <InputAdornment position="end">km</InputAdornment>,
                                            },
                                        }}
                                        sx={{ mb: 3 }}
                                    />
                                ))}

                        <Button variant="contained" fullWidth onClick={confirmProps}>
                            CONFIRM
                        </Button>
                    </Box>
                </Box>
            </Drawer>

            {/* loading spinner overlay */}
            {loading && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'rgba(255,255,255,0.6)',
                        zIndex: 1400,
                    }}
                >
                    <CircularProgress />
                </Box>
            )}
        </>
    );
};

export default LayerControlPanel;
