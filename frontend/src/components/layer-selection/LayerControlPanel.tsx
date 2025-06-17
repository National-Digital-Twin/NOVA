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
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { useLayerPanel } from "./LayerPanelContext";

type LayerItem = {
    name: string;
    count: number | null;
};

type LayerGroup = {
    [group: string]: LayerItem[];
};

const layers: LayerGroup = {
    "Environmental protected sites": [
        { name: "National parks", count: 15 },
        { name: "Areas of outstanding natural beauty", count: 46 },
        { name: "World heritage sites", count: 35 },
        { name: "Special protection areas", count: 286 },
        { name: "Sites of special scientific interest", count: 4100 },
        { name: "Special areas of conservation", count: 658 },
    ],
    Weather: [{ name: "Wind speed", count: null }],
    Residential: [
        { name: "Residential building", count: 29800000 },
        { name: "Hotel", count: 10000 },
    ],
    "Network infrastructure": [],
    Consumption: [],
};

const LayerControlPanel: React.FC = () => {
    const { isVisible } = useLayerPanel();

    if (!isVisible) return null;

    const [searchTerm, setSearchTerm] = useState("");
    const [open, setOpen] = useState(true);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const clearSearch = () => setSearchTerm("");

    return (
        <>
            {/* Toggle button */}
            <Box
                sx={{
                    position: "absolute",
                    top: 80,
                    left: open ? "360px" : "1rem",
                    zIndex: 1100,
                }}
            >
                <IconButton
                    onClick={() => setOpen(!open)}
                    sx={{
                        backgroundColor: "white",
                        '&:hover': {
                            backgroundColor: '#d5d5d5', // slightly darker on hover
                        },
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
                        width: 340,
                        maxHeight: "90vh",
                        overflowY: "auto",
                        borderRadius: 2,
                        position: "absolute",
                        top: 80,
                        left: "1rem",
                        zIndex: 1000,
                        bgcolor: "#f5f5f5",
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

                        <Typography
                            variant="subtitle1"
                            fontWeight={600}
                            color="primary"
                            sx={{ flexGrow: 1 }}
                        >
                            Layers
                        </Typography>
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
                            InputProps={{
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
                                sx: { borderRadius: 2 },
                            }}
                        />
                    </Box>

                    {/* Layer list */}
                    <Box sx={{ px: 1, flexGrow: 1 }}>
                        {Object.entries(layers).map(([category, items]) => {
                            const filteredItems = items.filter((item) =>
                                item.name.toLowerCase().includes(searchTerm.toLowerCase())
                            );
                            if (filteredItems.length === 0) return null;

                            return (
                                <Accordion
                                    key={category}
                                    defaultExpanded={category === "Environmental protected sites"}
                                    sx={{
                                        boxShadow: "none",
                                        "&:before": { display: "none" },
                                        mt: 1,
                                        bgcolor: "transparent",
                                    }}
                                >
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography fontWeight={500}>{category}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ pt: 0 }}>
                                        {filteredItems.map((item) => (
                                            <Box
                                                key={item.name}
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                    px: 1,
                                                    py: 0.75,
                                                    borderLeft: "4px solid #e0e0e0", // grey border on the left
                                                    "&:hover": {
                                                        backgroundColor: "rgba(0, 0, 0, 0.04)", // subtle hover
                                                    },
                                                }}
                                            >
                                                <Box sx={{ flexGrow: 1 }}>
                                                    <Typography variant="body2">{item.name}</Typography>
                                                    {item.count !== null && (
                                                        <Typography
                                                            variant="caption"
                                                            sx={{ color: "text.secondary" }}
                                                        >
                                                            Count: {item.count.toLocaleString()}
                                                        </Typography>
                                                    )}
                                                </Box>
                                                <Checkbox size="small" sx={{ ml: 1 }} />
                                            </Box>
                                        ))}
                                    </AccordionDetails>
                                </Accordion>
                            );
                        })}
                    </Box>

                    <Divider sx={{ my: 1 }} />

                    {/* Apply button */}
                    <Box sx={{ px: 2, pb: 2, display: "flex", justifyContent: "center" }}>
                        <Button
                            variant="contained"
                            sx={{
                                borderRadius: 1,
                                fontWeight: 600,
                                minWidth: 100,
                                px: 4,
                            }}
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
