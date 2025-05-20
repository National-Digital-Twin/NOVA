import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MapComponent from './components/MapComponent';
import Header from './components/Header';

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
