import { Box, IconButton, Tooltip, tooltipClasses, type TooltipProps } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledIconButton = styled(IconButton, { shouldForwardProp: prop => prop !== 'isActive' })<{ isActive?: boolean }>(({ theme, isActive }) => {
    const borderRadius = isActive ? '2px !important' : '8px !important';

    return {
        width: '3rem',
        height: '3rem',
        padding: 0,
        backgroundColor: isActive ? theme.palette.secondary.main : theme.palette.background.paper,
        color: isActive ? theme.palette.primary.contrastText : theme.palette.text.primary,
        borderRadius: borderRadius,
        '&.MuiButtonBase-root, &.MuiIconButton-root': {
            borderRadius: borderRadius,
        },
        '& .MuiTouchRipple-root, & .MuiTouchRipple-child': {
            borderRadius: borderRadius,
        },
        '&:hover': {
            backgroundColor: isActive ? theme.palette.secondary.dark : theme.palette.action.hover,
        }
    };
});

interface ControlButtonProps {
    onClick: () => void;
    children: React.ReactNode;
    'aria-label': string;
    isActive?: boolean;
    disabled?: boolean;
    'aria-pressed'?: boolean;
    showTooltip?: boolean;
}

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

const ControlButton = ({ onClick, children, 'aria-label': ariaLabel, isActive, disabled, 'aria-pressed': ariaPressed, showTooltip }: ControlButtonProps) => {
    return (
        <Box>
            {showTooltip ? (
                <StyledTooltip title={ariaLabel}>
                    <span>
                        <StyledIconButton
                            onClick={onClick}
                            aria-label={ariaLabel}
                            isActive={isActive}
                            disabled={disabled}
                            aria-pressed={ariaPressed}
                        >
                            {children}
                        </StyledIconButton>
                    </span>
                </StyledTooltip>
            ) : (
                <StyledIconButton
                    onClick={onClick}
                    aria-label={ariaLabel}
                    isActive={isActive}
                    disabled={disabled}
                    aria-pressed={ariaPressed}
                >
                    {children}
                </StyledIconButton>
            )}
        </Box>
    );
};

export default ControlButton;
