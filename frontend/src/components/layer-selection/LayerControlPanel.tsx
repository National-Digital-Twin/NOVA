import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Checkbox,
    CircularProgress,
    Divider,
    Drawer,
    IconButton,
    InputAdornment,
    MenuItem,
    Paper,
    TextField,
    Typography,
} from '@mui/material';
import React, { useEffect, useId, useMemo, useState } from 'react';

import type MapboxDraw from '@mapbox/mapbox-gl-draw';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import type { MapRef } from 'react-map-gl/maplibre';
import { useMapStore } from '../../stores/useMapStore';
import { MapVisualHelper } from '../../utils/MapVisualHelper';

interface LayerControlPanelProps {
    mapRef: React.RefObject<MapRef>;
    drawRef: React.RefObject<MapboxDraw | null>;
}

interface Attribute {
    id: string;
    description: string;
    defaultValue: string | number;
    valueType: 'number' | 'string';
    options?: string[];
}

interface LayerItem {
    id: string;
    name: string;
    attributes: Attribute[];
}

interface LayerApiResponse {
    categories: {
        name: string;
        items: LayerItem[];
    }[];
}

const LayerControlPanel = ({ mapRef, drawRef }: LayerControlPanelProps) => {
    const polygonStatus = useMapStore((s) => s.polygonStatus);
    const layersPanelOpen = useMapStore((s) => s.layersPanelOpen);
    const setLayersPanelOpen = useMapStore((s) => s.setLayersPanelOpen);
    const idPrefix = useId();
    const [layers, setLayers] = useState<Record<string, LayerItem[]>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [checkedLayers, setCheckedLayers] = useState<Record<string, boolean>>({});
    const [layerSettings, setLayerSettings] = useState<Record<string, Record<string, number>>>({});
    const [expandedPanels, setExpandedPanels] = useState<string[]>([]);
    const [propOpen, setPropOpen] = useState(false);
    const [currentLayer, setCurrentLayer] = useState<string | null>(null);
    const [layersLoaded, setLayersLoaded] = useState(false);
    const [loadError, setLoadError] = useState(false);
    const setCachedHeatmap = useMapStore((s) => s.setCachedHeatmap);

    const fetchLayers = async () => {
        try {
            setLoadError(false);
            const response = await fetch('/api/ui/layers');
            if (!response.ok) throw new Error('API error');
            const data: LayerApiResponse = await response.json();

            const transformed: Record<string, LayerItem[]> = {};
            const checks: Record<string, boolean> = {};
            const defaults: Record<string, Record<string, number>> = {};

            data.categories.forEach((category) => {
                if (!category.items?.length) return;

                transformed[category.name] = category.items.map((item) => {
                    const attributes = item.attributes;

                    checks[item.name] = true;
                    defaults[item.name] = {};
                    attributes.forEach((a) => {
                        defaults[item.name][a.description] = Number(a.defaultValue);
                    });

                    return {
                        id: item.id,
                        name: item.name,
                        attributes,
                    };
                });
            });

            setLayers(transformed);
            setCheckedLayers(checks);
            setLayerSettings(defaults);

            const allCategories = Object.keys(transformed);
            setExpandedPanels(allCategories);

            setLayersLoaded(true);
        } catch (err) {
            console.error('Failed to load layers', err);
            setLoadError(true);
        }
    };

    useEffect(() => {
        fetchLayers();
    }, []);

    const handleCheckboxChange = (name: string) => {
        setCheckedLayers((prev) => ({ ...prev, [name]: !prev[name] }));
    };

    const handleAccordionToggle = (category: string) => {
        setExpandedPanels((prev) => (prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]));
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        setSearchTerm(v);

        if (!v.trim()) {
            const firstCategory = Object.keys(layers)[0];
            setExpandedPanels(firstCategory ? [firstCategory] : []);
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
        const firstCategory = Object.keys(layers)[0];
        setExpandedPanels(firstCategory ? [firstCategory] : []);
    };

    const openProps = (name: string) => {
        setCurrentLayer(name);
        setPropOpen(true);
    };

    const closeProps = () => {
        setPropOpen(false);
        setCurrentLayer(null);
    };

    const handleParamChange = (label: string, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!currentLayer) return;
        const raw = e.target.value;
        setLayerSettings((prev) => ({
            ...prev,
            [currentLayer]: {
                ...prev[currentLayer],
                [label]: Number(raw),
            },
        }));
    };

    const handleParamBlur = (label: string) => {
        if (!currentLayer) return;
        const txt = layerSettings[currentLayer][label];
        const num = Number(txt);
        const final = isNaN(num) ? '' : String(num);
        setLayerSettings((prev) => ({
            ...prev,
            [currentLayer]: {
                ...prev[currentLayer],
                [label]: Number(final),
            },
        }));
    };

    const confirmProps = () => {
        closeProps();
    };

    const handleApply = async () => {
        if (!mapRef.current || !drawRef.current) return;

        const userDrawnPolygon = MapVisualHelper.getFirstPolygon(drawRef.current);
        if (!userDrawnPolygon) {
            console.warn('No user drawn polygon found');
            return;
        }
        const featureCollection = MapVisualHelper.getFeatureCollection(drawRef.current);

        const allLayers: LayerItem[] = Object.values(layers).flat();

        const dataLayers = allLayers.map((layer) => {
            const attributes = layer.attributes.map((attr) => ({
                id: attr.id,
                value: layerSettings[layer.name]?.[attr.description] ?? '',
            }));

            return {
                id: layer.id,
                attributes,
                analyze: checkedLayers[layer.name] ?? true,
            };
        });

        const payload = {
            location: featureCollection,
            dataLayers,
        };

        setLoading(true);
        try {
            const response = await fetch('/api/ui/location/analyse', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error('Failed to submit analysis request');
            }

            const geojson = await response.json();

            setCachedHeatmap(geojson);
            MapVisualHelper.addOrUpdateHeatmapLayer(mapRef, geojson);
            setLayersPanelOpen(false);
        } catch (err) {
            console.error('Analysis request failed', err);
        } finally {
            setLoading(false);
        }
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
    }, [searchTerm, expandedPanels, checkedLayers, idPrefix, layers]);

    const hasSearchResults = filteredLayerEntries.some(Boolean);

    if (!layersLoaded && !loadError) {
        return null;
    }

    if (loadError) {
        return (
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'rgba(255,255,255,0.6)',
                    zIndex: 1400,
                }}
            >
                <Typography variant="body1" sx={{ mb: 2 }}>
                    Failed to load layers. Please try again.
                </Typography>
                <Button variant="contained" onClick={fetchLayers}>
                    Retry
                </Button>
            </Box>
        );
    }

    const isVisible = polygonStatus === 'confirmed';
    if (!isVisible) return null;

    return (
        <>
            <Box className="layer-panel-toggle" sx={{ left: layersPanelOpen ? '430px' : '1rem' }}>
                <IconButton onClick={() => setLayersPanelOpen(!layersPanelOpen)}>
                    <ArrowBackIosNewIcon fontSize="small" sx={{ transform: !layersPanelOpen ? 'rotate(180deg)' : 'none' }} />
                </IconButton>
            </Box>

            {layersPanelOpen && (
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

            <Drawer anchor="left" open={propOpen} onClose={closeProps}>
                <Box sx={{ width: 280 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            pl: 2,
                            pr: 1,
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
                                .attributes.map((attr) => (
                                    <TextField
                                        key={attr.id}
                                        label={attr.description}
                                        type={attr.valueType === 'number' ? 'number' : 'text'}
                                        InputProps={attr.valueType === 'number' ? { inputProps: { min: 0 } } : {}}
                                        select={(attr.options?.length ?? 0) > 0}
                                        fullWidth
                                        value={layerSettings[currentLayer][attr.description]}
                                        onChange={(e) => handleParamChange(attr.description, e)}
                                        onBlur={() => handleParamBlur(attr.description)}
                                        sx={{ mb: 3 }}
                                    >
                                        {attr.options?.map((option) => (
                                            <MenuItem key={option} value={option}>
                                                {option}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                ))}

                        <Button variant="contained" fullWidth onClick={confirmProps}>
                            CONFIRM
                        </Button>
                    </Box>
                </Box>
            </Drawer>

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
