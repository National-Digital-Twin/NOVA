import { AppBar, Box } from '@mui/material';
import React from 'react';
import novaLogo from '../assets/nova-logo.svg';

function Header() {
    return (
        <AppBar position="relative" sx={{ height: '2rem', backgroundColor: 'primary.main' }}>
            <Box component="img" src={novaLogo} alt="NOVA Logo" sx={{ height: '2rem' }} />
        </AppBar>
    );
}

export default Header;
