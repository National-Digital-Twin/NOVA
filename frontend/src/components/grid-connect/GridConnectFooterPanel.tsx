import { Box, Typography, styled } from '@mui/material';
import { useEffect, useState } from 'react';
import StatCircle from './StatCircle';

const GridConnectFooterContainer = styled(Box)(({ theme }) => ({
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[3],
    padding: theme.spacing(1, 4),
    zIndex: 1300,
    display: 'grid',
    gridTemplateColumns: '1fr auto auto',
    alignItems: 'center',
    borderTop: `4px solid ${theme.palette.divider}`,
    minHeight: theme.spacing(15),
    gap: theme.spacing(4),
}));

const TurbineInfoSection = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    minWidth: 0,
}));

const TurbineIcon = styled('img')(({ theme }) => ({
    height: theme.spacing(6),
    marginRight: theme.spacing(1.5),
}));

const MainStatSection = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'start',
    justifyContent: 'center',
    minWidth: theme.spacing(18),
}));

const MainStatTitle = styled(Typography)(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
    fontSize: theme.typography.pxToRem(18),
    marginBottom: theme.spacing(0.5),
    textAlign: 'center',
}));

const StatGrid = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: '1fr 1fr',
    rowGap: theme.spacing(0.5),
    columnGap: theme.spacing(2),
    alignItems: 'center',
    justifyItems: 'center',
}));

const StatGridItem = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    minWidth: 0,
}));

const StatLabel = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.pxToRem(14),
    whiteSpace: 'nowrap',
}));

interface GridConnectFooterPanelProps {
    selectedSubstation: string;
}

interface AssetStats {
    turbineId: string;
    location: string;
    connectedSubstation: string;
    connectionDistance: string;
    outputMWh: number;
    outputMW: number;
    boostPercent: number;
    maxOutputMWh?: number;
    maxOutputMW?: number;
    maxBoostPercent?: number;
}

export default function GridConnectFooterPanel({ selectedSubstation }: GridConnectFooterPanelProps) {
    const [stats, setStats] = useState<AssetStats | null>(null);

    useEffect(() => {
        fetch('/data/mock-asset-stats.json')
            .then((res) => res.json())
            .then((data) => setStats(data));
    }, []);

    if (!stats || !selectedSubstation) return null;

    return (
        <GridConnectFooterContainer>
            <TurbineInfoSection>
                <TurbineIcon src="/images/turbine-icon.png" alt="Turbine" />
                <Box sx={{ minWidth: 0 }}>
                    <Typography fontSize={16} noWrap>
                        <strong>Turbine ID:</strong> {stats.turbineId}
                    </Typography>
                    <Typography fontSize={16} noWrap>
                        <strong>Location:</strong> {stats.location}
                    </Typography>
                    <Typography fontSize={16} noWrap>
                        <strong>Connected Substation:</strong> {stats.connectedSubstation}
                    </Typography>
                    <Typography fontSize={16} noWrap>
                        <strong>Connection distance:</strong> {stats.connectionDistance}
                    </Typography>
                </Box>
            </TurbineInfoSection>

            <MainStatSection>
                <MainStatTitle>Estimated output contribution:</MainStatTitle>
                <StatGridItem>
                    <StatCircle value={stats.outputMWh} max={stats.maxOutputMWh ?? 20000} unit="MWh/year" size={96} decimals={0} />
                    <StatLabel variant="body2">projected into {stats.connectedSubstation} load</StatLabel>
                </StatGridItem>
            </MainStatSection>

            <StatGrid>
                <StatGridItem>
                    <StatCircle value={stats.outputMW} max={stats.maxOutputMW ?? 10} unit="MW" size={64} decimals={1} />
                    <StatLabel variant="body2">to local distribution network</StatLabel>
                </StatGridItem>
                <StatGridItem>
                    <StatCircle value={stats.outputMW} max={stats.maxOutputMW ?? 10} unit="MW" size={64} decimals={1} />
                    <StatLabel variant="body2">to local distribution network</StatLabel>
                </StatGridItem>
                <StatGridItem>
                    <StatCircle value={stats.boostPercent} max={stats.maxBoostPercent ?? 100} suffix="%" size={64} decimals={1} />
                    <StatLabel variant="body2">boost to substation capacity</StatLabel>
                </StatGridItem>
                <StatGridItem>
                    <StatCircle value={stats.boostPercent} max={stats.maxBoostPercent ?? 100} suffix="%" size={64} decimals={1} />
                    <StatLabel variant="body2">boost to substation capacity</StatLabel>
                </StatGridItem>
            </StatGrid>
        </GridConnectFooterContainer>
    );
}
