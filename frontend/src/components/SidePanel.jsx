import { ChevronLeft, LayersOutlined, Menu } from '@mui/icons-material';
import { Box, Drawer, IconButton, List, ListItem, ListItemText, Switch, Tab, Tabs } from '@mui/material';
import React, { useState } from 'react';
import './SidePanel.scss';

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} aria-labelledby={`tab-${index}`} {...other}>
            {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
        </div>
    );
}

function SidePanel({ onLayerToggle, layerVisibility, onDrawerToggle, isOpen = true }) {
    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    return (
        <div className="side-panel">
            {!isOpen && (
                <Box className="side-panel__menu-button" onClick={onDrawerToggle}>
                    <Menu sx={{ color: 'primary.main' }} />
                </Box>
            )}

            <Drawer
                sx={{
                    top: 'var(--header-height)',
                    display: 'grid',
                    width: '320px',
                    height: 'calc(100% - var(--header-height))',
                    backgroundColor: 'var(--background-color-white)',
                    boxShadow: 'var(--elevation-3)',
                }}
                variant="temporary"
                anchor="left"
                open={isOpen}
                onClose={onDrawerToggle}
                ModalProps={{ keepMounted: true }}
            >
                <Box sx={{ overflow: 'auto' }}>
                    <Box className="side-panel__header">
                        <Box sx={{ flexGrow: 1 }}>
                            <Tabs value={tabValue} onChange={handleTabChange} aria-label="side panel tabs">
                                <Tab icon={<LayersOutlined />} label="Layers" id="tab-0" aria-controls="tabpanel-0" />
                            </Tabs>
                        </Box>
                        <IconButton onClick={onDrawerToggle} size="small" sx={{ margin: '1rem' }}>
                            <ChevronLeft />
                        </IconButton>
                    </Box>

                    <TabPanel value={tabValue} index={0}>
                        <List>
                            <ListItem>
                                <ListItemText primary="Protected Areas" />
                                <Switch
                                    edge="end"
                                    checked={layerVisibility.protectedAreas}
                                    onChange={() => onLayerToggle('protectedAreas')}
                                    inputProps={{ 'aria-labelledby': 'switch-list-label-protected-areas' }}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary="Wind Turbines" />
                                <Switch
                                    edge="end"
                                    checked={layerVisibility.windTurbines}
                                    onChange={() => onLayerToggle('windTurbines')}
                                    inputProps={{ 'aria-labelledby': 'switch-list-label-wind-turbines' }}
                                />
                            </ListItem>
                        </List>
                    </TabPanel>
                </Box>
            </Drawer>
        </div>
    );
}

export default SidePanel;
