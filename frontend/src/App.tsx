import { CssBaseline, ThemeProvider } from '@mui/material';
import React from 'react';
import './App.scss';
import Header from './components/header/Header';
import MapComponent from './components/map/MapComponent';
import theme from './theme';
import { LayerPanelProvider } from './components/layer-selection/LayerPanelContext';

const App: React.FC = () => {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Header />
            <LayerPanelProvider>
                <MapComponent />
            </LayerPanelProvider>
        </ThemeProvider>
    );
};

export default App;
