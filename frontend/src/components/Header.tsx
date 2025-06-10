import { AppBar, Box, styled } from '@mui/material';
import React from 'react';
import novaLogo from '../assets/nova-logo.svg';

const Toolbar = styled(AppBar)(({ theme }) => ({
    height: 'var(--header-height)',
    alignItems: 'start',
    justifyContent: 'center',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
}));

const Header: React.FC = () => {
    return (
        <Toolbar position="relative">
            <Box component="img" src={novaLogo} alt="NOVA Logo" sx={{ height: '2rem' }} />
        </Toolbar>
    );
};

export default Header;
