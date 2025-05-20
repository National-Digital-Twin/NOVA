import React, { useState } from 'react';
import { 
  Drawer, 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  List, 
  ListItem, 
  ListItemText, 
  Switch, 
  Divider 
} from '@mui/material';
import { LayersOutlined, ChevronLeft, Menu } from '@mui/icons-material';

// TabPanel component to handle tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function SidePanel({ onLayerToggle, layerVisibility, onDrawerToggle, isOpen = true }) {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <>
      {/* Toggle button that appears when drawer is closed */}
      {!isOpen && (
        <Box
          sx={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            zIndex: 1200,
          }}
        >
          <Box
            sx={{
              bgcolor: 'white',
              borderRadius: '4px',
              boxShadow: '0 0 0 2px rgba(0,0,0,.1)',
              p: 0.5,
              cursor: 'pointer',
              '&:hover': {
                bgcolor: '#f8f8f8'
              }
            }}
            onClick={onDrawerToggle}
          >
            <Menu />
          </Box>
        </Box>
      )}

      <Drawer
        variant="temporary"
        anchor="left"
        open={isOpen}
        onClose={onDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width: 300,
            boxSizing: 'border-box',
            top: '30px', // Adjust to match header height
            height: 'calc(100% - 30px)', // Adjust to match header height
          },
        }}
      >
        <Box sx={{ overflow: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', flexGrow: 1 }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="side panel tabs">
                <Tab icon={<LayersOutlined />} label="Layers" id="tab-0" aria-controls="tabpanel-0" />
              </Tabs>
            </Box>
            <Box 
              sx={{ 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 0.5,
                borderRadius: '4px',
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.04)'
                }
              }} 
              onClick={onDrawerToggle}
            >
              <ChevronLeft />
            </Box>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" gutterBottom>
              Map Layers
            </Typography>
            <Divider />
            <List>
              <ListItem>
                <ListItemText primary="Protected Areas" />
                <Switch
                  edge="end"
                  checked={layerVisibility.protectedAreas}
                  onChange={() => onLayerToggle('protectedAreas')}
                  inputProps={{
                    'aria-labelledby': 'switch-list-label-protected-areas',
                  }}
                />
              </ListItem>
              <ListItem>
                <ListItemText primary="Wind Turbines" />
                <Switch
                  edge="end"
                  checked={layerVisibility.windTurbines}
                  onChange={() => onLayerToggle('windTurbines')}
                  inputProps={{
                    'aria-labelledby': 'switch-list-label-wind-turbines',
                  }}
                />
              </ListItem>
              {/* Additional layers can be added here */}
            </List>
          </TabPanel>
        </Box>
      </Drawer>
    </>
  );
}

export default SidePanel;
