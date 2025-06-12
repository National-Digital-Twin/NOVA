import { Box, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledIconButton = styled(IconButton)(({ theme }) => ({
    width: '3rem',
    height: '3rem',
    padding: 0,
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    borderRadius: theme.shape.borderRadius,
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    },
    '& .MuiTouchRipple-root .MuiTouchRipple-child': {
        borderRadius: theme.shape.borderRadius,
    },
}));

interface ControlButtonProps {
    onClick: () => void;
    children: React.ReactNode;
    'aria-label': string;
}

const ControlButton = ({ onClick, children, 'aria-label': ariaLabel }: ControlButtonProps) => {
    return (
        <Box>
            <StyledIconButton onClick={onClick} aria-label={ariaLabel}>
                {children}
            </StyledIconButton>
        </Box>
    );
};

export default ControlButton;
