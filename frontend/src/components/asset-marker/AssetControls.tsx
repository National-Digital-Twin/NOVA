import { Box, styled } from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import OpenWithIcon from '@mui/icons-material/OpenWith';
import ControlIcon from '../../shared/control-icon/ControlIcon';

const ControlsContainer = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: '-70px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '8px',
    padding: '3px',
    borderRadius: '3px',
    boxShadow: theme.shadows[2],
    zIndex: 1000,
}));

interface AssetControlsProps {
    onBoltClick?: () => void;
    onDeleteClick?: () => void;
    onEditClick?: () => void;
    onMoveClick?: () => void;
}

/**
 * A component for displaying control buttons for an asset marker
 */
const AssetControls: React.FC<AssetControlsProps> = ({ onBoltClick, onDeleteClick, onEditClick, onMoveClick }) => {
    // Wrapper function to handle button clicks
    // Since ControlsContainer already stops propagation with its onClick handler,
    // we just need to ensure this function returns a parameterless function
    // that matches ControlIcon's onClick type
    // Explicitly type the returned function to match ControlIcon's onClick type
    const handleButtonClick =
        (callback?: () => void): (() => void) =>
        () => {
            if (callback) callback();
        };

    return (
        <ControlsContainer onClick={(e) => e.stopPropagation()}>
            <ControlIcon onClick={handleButtonClick(onEditClick || (() => console.log('Edit clicked')))} aria-label="Edit" showTooltip>
                <EditIcon />
            </ControlIcon>
            <ControlIcon onClick={handleButtonClick(onBoltClick || (() => console.log('Bolt clicked')))} aria-label="Connect to grid" showTooltip>
                <BoltIcon />
            </ControlIcon>
            <ControlIcon onClick={handleButtonClick(onDeleteClick || (() => console.log('Delete clicked')))} aria-label="Delete Asset" showTooltip>
                <DeleteForeverIcon />
            </ControlIcon>
            <ControlIcon onClick={handleButtonClick(onMoveClick || (() => console.log('Move clicked')))} aria-label="Move" showTooltip>
                <OpenWithIcon />
            </ControlIcon>
        </ControlsContainer>
    );
};

export default AssetControls;
