import { Box, IconButton, Tooltip, tooltipClasses, type TooltipProps } from '@mui/material';
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

const StyledTooltip = styled((props: TooltipProps) => (
    <Tooltip
        {...props}
        placement="bottom"
        slotProps={{
            popper: {
                modifiers: [
                    {
                        name: 'offset',
                        options: {
                            offset: [0, 12], // 12px space below the button
                        },
                    },
                ],
            },
        }}
        classes={{ popper: props.className }}
    />
))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: '#ffffff',
        color: '#000000',
        boxShadow: theme.shadows[2],
        fontSize: 13,
        padding: '6px 12px',
        borderRadius: 8,
    },
    [`& .${tooltipClasses.arrow}`]: {
        display: 'none',
    },
}));

interface ControlIconProps {
    onClick: () => void;
    children: React.ReactNode;
    'aria-label': string;
    isActive?: boolean;
    disabled?: boolean;
    showTooltip?: boolean;
    'aria-pressed'?: boolean;
}

const ControlIcon = ({ onClick, children, 'aria-label': ariaLabel, isActive, disabled, 'aria-pressed': ariaPressed, showTooltip }: ControlIconProps) => {
    return (
        <Box>
            {showTooltip ? (
                <StyledTooltip title={ariaLabel}>
                    <StyledIconButton onClick={onClick} isActive={isActive} disabled={disabled} aria-pressed={ariaPressed} aria-label={ariaLabel + ' button'}>
                        {children}
                    </StyledIconButton>
                </StyledTooltip>
            ) : (
                <StyledIconButton onClick={onClick} aria-label={ariaLabel} isActive={isActive} disabled={disabled} aria-pressed={ariaPressed}>
                    {children}
                </StyledIconButton>
            )}
        </Box>
    );
};

export default ControlIcon;
