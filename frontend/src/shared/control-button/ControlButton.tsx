import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledButton = styled(Button, { shouldForwardProp: (prop) => prop !== 'isActive' })<{ isActive?: boolean }>(({ theme, isActive }) => ({
    alignItems: 'center',
    backgroundColor: isActive ? theme.palette.secondary.main : theme.palette.background.paper,
    borderRadius: 4,
    color: isActive ? theme.palette.primary.contrastText : theme.palette.text.primary,
    display: 'flex',
    height: '3rem',
    justifyContent: 'center',
    padding: '0.5rem 1rem',
    textTransform: 'none',
    width: '100%',
    '&:hover': {
        backgroundColor: isActive ? theme.palette.secondary.dark : theme.palette.action.hover,
    },
}));

interface ControlButtonProps {
    onClick: () => void;
    children: React.ReactNode;
    'aria-label': string;
    isActive?: boolean;
    disabled?: boolean;
}

const ControlButton = ({ onClick, children, 'aria-label': ariaLabel, isActive, disabled }: ControlButtonProps) => {
    return (
        <StyledButton onClick={onClick} aria-label={ariaLabel} isActive={isActive} disabled={disabled}>
            {children}
        </StyledButton>
    );
};

export default ControlButton;
