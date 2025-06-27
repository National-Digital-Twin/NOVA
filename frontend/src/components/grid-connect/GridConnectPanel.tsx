import { Box, styled } from '@mui/material';
import ExitConnectGridViewButton from './exit-connect-grid/ExitConnectGridViewButton';
import SelectSubstationButton from './select-substation/SelectSubstationButton';

const PanelContainer = styled(Box)({
    display: 'flex',
    flexDirection: 'row',
    gap: '1rem',
    right: '5rem',
    position: 'absolute',
    top: '1rem',
    zIndex: 1,
});

interface GridConnectPanelProps { }

const GridConnectPanel = ({ }: GridConnectPanelProps) => {
    return (
        <PanelContainer>
            <SelectSubstationButton />
            <ExitConnectGridViewButton />
        </PanelContainer>
    );
};

export default GridConnectPanel;
