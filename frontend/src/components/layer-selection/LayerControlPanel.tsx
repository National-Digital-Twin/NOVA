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

type LayerItem = { name: string };
type LayerGroup = { [group: string]: LayerItem[] };

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

const LayerControlPanel = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [open, setOpen] = useState(true);
    const [checkedLayers, setCheckedLayers] = useState<Record<string, boolean>>(() => {
        const initial: Record<string, boolean> = {};
        Object.values(layers).forEach(group => {
            group.forEach(item => {
                initial[item.name] = true;
            });
        });
        return initial;
    });

    const [expandedPanels, setExpandedPanels] = useState<string[]>(["Environmental protected sites"]);

    const handleCheckboxChange = (layerName: string) => {
        setCheckedLayers(prev => ({
            ...prev,
            [layerName]: !prev[layerName],
        }));
    };

    const handleAccordionToggle = (category: string) => {
        setExpandedPanels(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

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

    const clearSearch = () => {
        setSearchTerm("");
        setExpandedPanels(["Environmental protected sites"]);
    };

    const handleApply = () => {
        const selected = Object.entries(checkedLayers)
            .filter(([_, isChecked]) => isChecked)
            .map(([name]) => name);
        console.log("Selected layers:", selected);
    };

    return (
        <>
            {/* Toggle Button */}
            <Box
                sx={{
                    position: "absolute",
                    top: 80,
                    left: open ? "430px" : "1rem",
                    zIndex: 1100,
                }}
            >
                <IconButton
                    onClick={() => setOpen(!open)}
                    sx={{
                        backgroundColor: "white",
                        '&:hover': { backgroundColor: '#d5d5d5' },
                        borderRadius: 1,
                        boxShadow: 2,
                        width: 50,
                        height: 50,
                        border: "1px solid #ccc",
                    }}
                >
                    <ArrowBackIosNewIcon
                        fontSize="small"
                        sx={{ transform: !open ? "rotate(180deg)" : "none" }}
                    />
                </IconButton>
            </Box>

            {open && (
                <Paper
                    elevation={4}
                    sx={{
                        width: 400,
                        height: "calc(100vh - 25vh)",
                        overflow: "hidden",
                        position: "absolute",
                        top: 80,
                        left: "1rem",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    {/* Header */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            px: 2,
                            py: 1,
                            borderBottom: "1px solid #ddd",
                            bgcolor: "#e8e8e8",
                        }}
                    >
                        <LayersOutlinedIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="subtitle1">Layers</Typography>
                    </Box>

                    {/* Search bar */}
                    <Box sx={{ px: 2, pt: 2 }}>
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

                    {/* Scrollable list */}
                    <Box
                        sx={{
                            px: 1,
                            flexGrow: 1,
                            overflowY: "auto",
                            minHeight: 0,
                        }}
                    >
                        {Object.entries(layers).map(([category, items]) => {
                            const filteredItems = items.filter((item) =>
                                item.name.toLowerCase().includes(searchTerm.toLowerCase())
                            );
                            if (filteredItems.length === 0) return null;

                            return (
                                <Accordion
                                    key={category}
                                    expanded={expandedPanels.includes(category)}
                                    onChange={() => handleAccordionToggle(category)}
                                    disableGutters
                                    sx={{
                                        boxShadow: "none",
                                        "&:before": { display: "none" },
                                        bgcolor: "transparent",
                                        mb: 0.5,
                                    }}
                                >
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        sx={{
                                            minHeight: 40,
                                            "& .MuiAccordionSummary-content": { margin: 0 },
                                        }}
                                    >
                                        <Typography>{category}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ pt: 0.5, pb: 0 }}>
                                        {filteredItems.map((item) => {
                                            const checkboxId = `checkbox-${item.name.replace(/\s+/g, '-')}`;

                                            return (
                                                <Box
                                                    key={item.name}
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "space-between",
                                                        px: 1,
                                                        py: 0.75,
                                                        pl: 2,
                                                        borderLeft: "3px solid #e0e0e0",
                                                        "&:hover": {
                                                            backgroundColor: "rgba(0, 0, 0, 0.04)",
                                                        },
                                                    }}
                                                >
                                                    <label
                                                        htmlFor={checkboxId}
                                                        style={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "space-between",
                                                            width: "100%",
                                                            cursor: "pointer",
                                                        }}
                                                    >
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
                        })}
                    </Box>

                    <Divider sx={{ my: 2, opacity: 0.3 }} />

                    {/* Apply button */}
                    <Box sx={{ px: 2, pb: 2, display: "flex", justifyContent: "center" }}>
                        <Button
                            variant="contained"
                            onClick={handleApply}
                            sx={{ px: 4 }}
                        >
                            APPLY
                        </Button>
                    </Box>
                </Paper>
            )}
        </>
    );
};

export default LayerControlPanel;
