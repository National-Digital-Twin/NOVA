import React, { useState, useEffect } from 'react';
import { Paper, Typography, CircularProgress } from '@mui/material';
import SubstationsList, { type ListItem } from './SubstationsList';
import { fetchSubstations } from './substationsApi';

interface SubstationsListContainerProps {
    longitude?: number;
    latitude?: number;
    onConfirm?: (selectedItem: ListItem) => void;
}

/**
 * A container component that handles loading substations data and displays
 * the SubstationsList with appropriate loading and error states.
 */
const SubstationsListContainer: React.FC<SubstationsListContainerProps> = ({ longitude, latitude, onConfirm = () => console.log('Confirmed') }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [substations, setSubstations] = useState<ListItem[]>([]);

    useEffect(() => {
        const loadSubstations = async () => {
            if (longitude === undefined || latitude === undefined) return;

            setIsLoading(true);
            setError(null);

            try {
                const result = await fetchSubstations(longitude, latitude);
                setSubstations(result.items);
                setError(result.error);
            } catch (err) {
                console.error('Error fetching substations:', err);
                setError('Failed to load substations');
            } finally {
                setIsLoading(false);
            }
        };

        loadSubstations();
    }, [longitude, latitude]);

    if (isLoading) {
        return (
            <Paper elevation={5} sx={{ maxWidth: 600, borderRadius: 1, p: 2, textAlign: 'center' }}>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                <Typography variant="body2">Loading substations...</Typography>
            </Paper>
        );
    }

    if (error) {
        return (
            <Paper elevation={5} sx={{ maxWidth: 600, borderRadius: 1, p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="error">
                    {error}
                </Typography>
            </Paper>
        );
    }

    return <SubstationsList items={substations} onConfirm={onConfirm} />;
};

export default SubstationsListContainer;
