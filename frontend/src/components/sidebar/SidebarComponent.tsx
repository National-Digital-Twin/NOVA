import MenuIcon from '@mui/icons-material/Menu';
import { Box, Drawer, FormControlLabel, IconButton, Switch, Typography, styled } from '@mui/material';
import { useState } from 'react';

interface DrawerComponentProps {
    layerVisibility: {
        heatmap: boolean;
        polygons: boolean;
    };
    onToggleLayer: (layer: 'heatmap' | 'polygons') => void;
}

const FloatingButton = styled(IconButton)(({ theme }) => ({
    position: 'absolute',
    top: theme.spacing(2),
    left: theme.spacing(2),
    zIndex: 1000,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[2],
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    },
}));

const SidePanel = styled(Drawer)(({ theme }) => ({
    '& .MuiDrawer-paper': {
        top: 'var(--header-height)',
        height: 'calc(100% - var(--header-height))',
        boxShadow: theme.shadows[2],
    },
    '& .MuiBackdrop-root': {
        top: 'var(--header-height)',
        height: 'calc(100% - var(--header-height))',
    },
}));

const DrawerContent = styled(Box)(({ theme }) => ({
    width: 320,
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
}));

const LayerControls = styled(Box)(({ theme }) => ({
    marginTop: theme.spacing(2),
    '& > *': {
        marginBottom: theme.spacing(1),
    },
}));

const SwitchControlLabel = styled(FormControlLabel)({
    width: '100%',
    margin: 0,
    justifyContent: 'space-between',
    '& .MuiFormControlLabel-label': {
        flex: 1,
    },
});

const SidebarComponent = ({ layerVisibility, onToggleLayer }: DrawerComponentProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleDrawer = () => setIsOpen(!isOpen);
    const handleClose = () => setIsOpen(false);

    return (
        <>
            <FloatingButton onClick={toggleDrawer} size="large">
                <MenuIcon />
            </FloatingButton>
            <SidePanel anchor="left" variant="temporary" open={isOpen} onClose={handleClose} ModalProps={{ keepMounted: true }}>
                <DrawerContent>
                    <Typography variant="h6" gutterBottom>
                        Layer Controls
                    </Typography>
                    <LayerControls>
                        <SwitchControlLabel
                            control={<Switch checked={layerVisibility.polygons} onChange={() => onToggleLayer('polygons')} />}
                            label="Protected Areas"
                            labelPlacement="start"
                        />
                        <SwitchControlLabel
                            control={<Switch checked={layerVisibility.heatmap} onChange={() => onToggleLayer('heatmap')} />}
                            label="Wind Turbines"
                            labelPlacement="start"
                        />
                    </LayerControls>
                </DrawerContent>
            </SidePanel>
        </>
    );
};

export default SidebarComponent;
