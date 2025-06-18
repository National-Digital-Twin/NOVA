import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import { Divider, IconButton, Menu, MenuItem, Typography, styled } from '@mui/material';
import { useEffect, useState } from 'react';
import { userService } from '../../services/userService';

const UserMenuButton = styled(IconButton, { shouldForwardProp: (prop) => prop !== 'isActive' })<{ isActive: boolean }>(({ theme, isActive }) => ({
    color: isActive ? '#ffcf06' : theme.palette.background.paper,
}));

const StyledMenu = styled(Menu)(({ theme }) => ({
    '& .MuiPaper-root': {
        marginTop: theme.spacing(1),
        minWidth: '300px',
    },
}));

const UsernameTypography = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
}));

const StyledLogoutIcon = styled(LogoutIcon)(({ theme }) => ({
    marginRight: theme.spacing(1),
}));

const UserMenu = () => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [username, setUsername] = useState<string>('Anonymous');
    const open = Boolean(anchorEl);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userData = await userService.getUserData();
                setUsername(userData.email);
            } catch (err) {
                console.error('Failed to fetch user data:', err);
            }
        };
        fetchUserData();
    }, []);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSignOut = async () => {
        try {
            await userService.logout();
        } catch (error) {
            console.error('Failed to logout:', error);
        }
    };

    return (
        <>
            <UserMenuButton aria-label="account of current user" aria-controls="menu-appbar" aria-haspopup="true" onClick={handleClick} isActive={open}>
                {open ? <AccountCircleIcon /> : <AccountCircleOutlinedIcon />}
            </UserMenuButton>
            <StyledMenu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                keepMounted
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={open}
                onClose={handleClose}
            >
                <MenuItem onClick={handleClose}>
                    <UsernameTypography>{username}</UsernameTypography>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleSignOut}>
                    <StyledLogoutIcon />
                    Sign out
                </MenuItem>
            </StyledMenu>
        </>
    );
};

export default UserMenu;
