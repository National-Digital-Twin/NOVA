import { Box, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledIconButton = styled(IconButton, { shouldForwardProp: (prop) => prop !== 'isActive' })<{ isActive?: boolean }>(({ theme, isActive }) => ({
    backgroundColor: isActive ? theme.palette.secondary.main : theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    color: isActive ? theme.palette.primary.contrastText : theme.palette.text.primary,
    height: '3rem',
    padding: 0,
    width: '3rem',
    '&:hover': {
        backgroundColor: isActive ? theme.palette.secondary.dark : theme.palette.action.hover,
    },
    '& .MuiTouchRipple-root .MuiTouchRipple-child': {
        borderRadius: theme.shape.borderRadius,
    },
}));

interface ControlIconProps {
    onClick: () => void;
    children: React.ReactNode;
    'aria-label': string;
    isActive?: boolean;
    disabled?: boolean;
    'aria-pressed'?: boolean;
}

const ControlIcon = ({ onClick, children, 'aria-label': ariaLabel, isActive, disabled, 'aria-pressed': ariaPressed }: ControlIconProps) => {
    return (
        <Box>
            <StyledIconButton onClick={onClick} aria-label={ariaLabel} isActive={isActive} disabled={disabled} aria-pressed={ariaPressed}>
                {children}
            </StyledIconButton>
        </Box>
    );
};

export default ControlIcon;
