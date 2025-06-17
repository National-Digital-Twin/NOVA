/**
 * LayerControlPanel
 *
 * A React component that provides an interactive panel for selecting map layers to be used in Heatmap calculations.
 * Users can:
 * - Search for layers
 * - Expand/collapse grouped layer categories
 * - Toggle checkboxes to include/exclude layers
 * - Request a heatmap be calculated based on selected layers
 *
 */

import React, { useState } from "react";
import {
    Paper,
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
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";

import "../../App.scss";

// Types used internally by the component
type LayerItem = { name: string };
type LayerGroup = { [group: string]: LayerItem[] };

// Static layer data grouped by category
const layers: LayerGroup = {
    "Environmental protected sites": [
        { name: "Areas of outstanding natural beauty" },
        { name: "Special protection areas" },
        { name: "Sites of special scientific interest" },
        { name: "Special areas of conservation" },
    ],
    Weather: [{ name: "Wind speed" }],
    Residential: [{ name: "Built up areas" }],
    "Network infrastructure": [],
    Consumption: [],
};

// Main layer panel component
const LayerControlPanel = () => {
    // State for search text input
    const [searchTerm, setSearchTerm] = useState("");

    // Whether the panel is expanded or collapsed
    const [open, setOpen] = useState(true);

    // Tracks which layers are checked
    const [checkedLayers, setCheckedLayers] = useState<Record<string, boolean>>(() => {
        const initial: Record<string, boolean> = {};
        Object.values(layers).forEach(group => {
            group.forEach(item => {
                initial[item.name] = true; // all checked by default
            });
        });
        return initial;
    });

    // Which accordion panels are expanded
    const [expandedPanels, setExpandedPanels] = useState<string[]>(["Environmental protected sites"]);

    // Toggles a checkbox state
    const handleCheckboxChange = (layerName: string) => {
        setCheckedLayers(prev => ({
            ...prev,
            [layerName]: !prev[layerName],
        }));
    };

    // Toggles an accordion open/closed
    const handleAccordionToggle = (category: string) => {
        setExpandedPanels(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    // Updates search term and auto-expands matching groups
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (value.trim() === "") return;

        const lower = value.toLowerCase();
        const matching = Object.entries(layers)
            .filter(([_, items]) => items.some(item => item.name.toLowerCase().includes(lower)))
            .map(([category]) => category);

        setExpandedPanels(matching);
    };

    // Clears search and resets expanded state
    const clearSearch = () => {
        setSearchTerm("");
        setExpandedPanels(["Environmental protected sites"]);
    };

    // Finalises the selection (currently just logs to console)
    const handleApply = () => {
        const selected = Object.entries(checkedLayers)
            .filter(([_, isChecked]) => isChecked)
            .map(([name]) => name);
        console.log("Selected layers:", selected);
    };

    return (
        <>
            {/* Side toggle button */}
            <Box
                className="layer-panel-toggle"
                sx={{ left: open ? "430px" : "1rem" }}
            >
                <IconButton onClick={() => setOpen(!open)}>
                    <ArrowBackIosNewIcon
                        fontSize="small"
                        sx={{ transform: !open ? "rotate(180deg)" : "none" }}
                    />
                </IconButton>
            </Box>

            {/* Main panel content */}
            {open && (
                <Paper className="layer-panel" elevation={4}>
                    {/* Panel header */}
                    <Box className="layer-panel-header">
                        <LayersOutlinedIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="subtitle1">Layers</Typography>
                    </Box>

                    {/* Search input */}
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
                                            <SearchIcon sx={{ fontSize: 20, color: "grey.600" }} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: searchTerm && (
                                        <InputAdornment position="end">
                                            <IconButton size="small" onClick={clearSearch}>
                                                <HighlightOffIcon />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                    sx: { borderRadius: 2, mb: 1 },
                                }
                            }}
                        />
                    </Box>

                    {/* List of layer groups */}
                    <Box className="layer-panel-selectable-layers">
                        {(() => {
                            // Render accordion per group
                            const entries = Object.entries(layers).map(([category, items]) => {
                                const filteredItems = items.filter((item) =>
                                    item.name.toLowerCase().includes(searchTerm.toLowerCase())
                                );
                                if (filteredItems.length === 0) return null;

                                return (
                                    <Accordion
                                        key={category}
                                        expanded={expandedPanels.includes(category)}
                                        onChange={() => handleAccordionToggle(category)}
                                        className="layer-accordion"
                                        disableGutters
                                    >
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon />}
                                            className="layer-accordion-summary"
                                        >
                                            <Typography>{category}</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails sx={{ pt: 0.5, pb: 0 }}>
                                            {filteredItems.map((item) => {
                                                const checkboxId = `checkbox-${item.name.replace(/\s+/g, '-')}`;
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

                            // If nothing matches search, show fallback message
                            const hasResults = entries.some(Boolean);

                            return hasResults ? entries : (
                                <Box sx={{ px: 2, pt: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        No results
                                    </Typography>
                                </Box>
                            );
                        })()}
                    </Box>

                    <Divider sx={{ my: 2, opacity: 0.3 }} />

                    {/* Apply button */}
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