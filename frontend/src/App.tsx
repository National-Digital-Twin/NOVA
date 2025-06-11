import { CssBaseline, ThemeProvider } from '@mui/material';
import React from 'react';
import './App.scss';
import Header from './components/header/Header';
import MapComponent from './components/map/MapComponent';
import theme from './theme';

const App: React.FC = () => {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Header />
            <MapComponent />
        </ThemeProvider>
    );
};

export default App;
