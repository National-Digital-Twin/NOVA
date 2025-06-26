import { AppBar, Box, styled } from '@mui/material';
import React from 'react';
import novaLogo from '../../assets/nova-logo.svg';
import UserMenu from './UserMenu';

const Toolbar = styled(AppBar)(({ theme }) => ({
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    height: 'var(--header-height)',
    justifyContent: 'space-between',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
}));

const Header: React.FC = () => {
    return (
        <Toolbar position="relative">
            <Box component="img" src={novaLogo} alt="NOVA Logo" sx={{ height: '1.5rem' }} />
            <UserMenu />
        </Toolbar>
    );
};

export default Header;
