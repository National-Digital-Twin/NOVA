import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import React from 'react';
import Header from './components/Header';
import MapComponent from './components/MapComponent';

// Create a theme instance
const theme = createTheme({
    palette: {
        primary: {
            main: '#001f3f', // Dark navy blue to match header
        },
        secondary: {
            main: '#00CC00', // Green to match protected areas
        },
    },
});

function App() {
    console.log('App started');
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <Header />
                <MapComponent />
            </div>
        </ThemeProvider>
    );
}

export default App;
