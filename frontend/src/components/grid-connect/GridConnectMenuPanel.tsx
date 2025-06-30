import { Box, MenuItem, Select, styled } from '@mui/material';
import { useEffect, useState } from 'react';
import ControlButton from '../../shared/control-button/ControlButton';
import type { Substation } from '../map-substations-list/SubstationsList';
import { useMapStore } from '../../stores/useMapStore';

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

interface GridConnectMenuPanelProps {
    selected: Substation;
}

export default function GridConnectMenuPanel({ selected }: GridConnectMenuPanelProps) {
    const [substations, setSubstations] = useState<string[]>([]);
    const setSelectedSubstation = useMapStore((s) => s.setSelectedSubstation);

    const exitView = () => {
        setSelectedSubstation(null);
    }

    useEffect(() => {
        fetch('/data/mock-substations.json')
            .then((res) => res.json())
            .then((data) => setSubstations(data));
    }, []);

    return (
        <GridConnectMenuContainer>
            <GridConnectMenuGroup role="group" aria-label="Substation selection">
            </GridConnectMenuGroup>
        </GridConnectMenuContainer>
    );
}
