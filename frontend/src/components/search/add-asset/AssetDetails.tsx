import { Box, List, ListItem, ListItemText, Tab, Tabs } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useState } from 'react';
import type { Asset, Variation } from './AddAsset';

const StyledTabs = styled(Tabs)(({ theme }) => ({
    '& .MuiTabs-indicator': {
        backgroundColor: theme.palette.secondary.main,
    },
    '& .MuiTab-root': {
        color: theme.palette.text.primary,
        textTransform: 'none',
        '&.Mui-selected': {
            color: theme.palette.secondary.main,
        },
    },
}));

const PreviewContent = styled(Box)(({ theme }) => ({
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    '& img': {
        borderRadius: theme.shape.borderRadius,
        maxWidth: '100%',
    },
}));

const SpecificationsContent = styled(Box)();

const StyledList = styled(List)(({ theme }) => ({
    backgroundColor: theme.palette.grey[50],
    borderRadius: theme.shape.borderRadius,
    padding: 0,
    '& .MuiListItem-root': {
        borderBottom: `1px solid ${theme.palette.grey[300]}`,
        '&:last-child': {
            borderBottom: 'none',
        },
    },
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
    padding: theme.spacing(0, 1),
    '& .MuiListItemText-primary': {
        color: theme.palette.text.primary,
        fontWeight: 600,
    },
    '& .MuiListItemText-secondary': {
        color: theme.palette.text.secondary,
        fontSize: '0.875rem',
    },
}));

interface AssetDetailsProps {
    selectedAsset: Asset;
    selectedVariant: Variation;
}

const AssetDetails = ({ selectedAsset, selectedVariant }: AssetDetailsProps) => {
    const [activeTab, setActiveTab] = useState(0);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    return (
        <>
            <StyledTabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
                <Tab label="Preview" />
                <Tab label="Specifications" />
            </StyledTabs>

            <Box>
                {activeTab === 0 && (
                    <PreviewContent>
                        <img src={selectedVariant.image} alt={`${selectedAsset.name} preview`} />
                    </PreviewContent>
                )}
                {activeTab === 1 && (
                    <SpecificationsContent>
                        <StyledList>
                            {selectedVariant.specification.map((spec) => (
                                <StyledListItem key={spec.name}>
                                    <ListItemText primary={spec.name} secondary={spec.value} />
                                </StyledListItem>
                            ))}
                        </StyledList>
                    </SpecificationsContent>
                )}
            </Box>
        </>
    );
};

export default AssetDetails;
