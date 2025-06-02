import { Box } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import React from 'react';
import './App.scss';
import Header from './components/Header';
import MapComponent from './components/MapComponent';

const theme = createTheme({
    palette: {
        primary: { main: '#001f3f' },
        secondary: { main: '#00CC00' },
    },
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                <Header />
                <MapComponent />
            </Box>
        </ThemeProvider>
    );
}

export default App;
