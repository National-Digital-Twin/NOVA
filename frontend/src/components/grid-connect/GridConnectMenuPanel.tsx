import { Box, MenuItem, Select, styled } from '@mui/material';
import { useEffect, useState } from 'react';
import ControlButton from '../../shared/control-button/ControlButton';

const GridConnectMenuContainer = styled(Box)({
    display: 'flex',
    flexDirection: 'row',
    gap: '1rem',
    position: 'absolute',
    top: '1rem',
    right: '5rem',
    zIndex: 1200,
});

const GridConnectMenuGroup = styled(Box)(({ theme }) => ({
    alignItems: 'center',
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[2],
    display: 'flex',
    flexDirection: 'row',
    position: 'relative',
}));

const GridConnectSelect = styled(Select)(({ theme }) => ({
    minWidth: 200,
    height: 48,
    minHeight: 48,
    fontWeight: 600,
    fontSize: 20,
    color: '#1a2233',
    bgcolor: 'transparent',
    border: 'none',
    '& .MuiOutlinedInput-notchedOutline': {
        border: 'none',
        inset: 0,
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
        outline: '4px solid',
        outlineColor: theme.palette.secondary.dark,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        outline: '4px solid',
        outlineColor: theme.palette.secondary.main,
    },
}));

interface GridConnectMenuPanelProps {
    selected: string;
    onSelect: (value: string) => void;
    onExit: () => void;
}

export default function GridConnectMenuPanel({ selected, onSelect, onExit }: GridConnectMenuPanelProps) {
    const [substations, setSubstations] = useState<string[]>([]);

    useEffect(() => {
        fetch('/data/mock-substations.json')
            .then((res) => res.json())
            .then((data) => setSubstations(data));
    }, []);

    return (
        <GridConnectMenuContainer>
            <GridConnectMenuGroup role="group" aria-label="Substation selection">
                <GridConnectSelect
                    value={selected}
                    onChange={(e) => onSelect(e.target.value as string)}
                    displayEmpty
                    MenuProps={{ slotProps: { paper: { sx: { marginTop: 1 } } } }}
                >
                    {substations.map((s) => (
                        <MenuItem key={s} value={s}>
                            {s}
                        </MenuItem>
                    ))}
                </GridConnectSelect>
            </GridConnectMenuGroup>

            <GridConnectMenuGroup role="group" aria-label="Grid connect controls">
                <ControlButton onClick={onExit} aria-label="Exit connect grid view">
                    Exit connect grid view
                </ControlButton>
            </GridConnectMenuGroup>
        </GridConnectMenuContainer>
    );
}
