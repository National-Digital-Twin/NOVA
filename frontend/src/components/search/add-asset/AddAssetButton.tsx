import ControlButton from '../../../shared/control-button/ControlButton';
import { Typography } from '@mui/material';

/**
 * Props for the AddAssetButton component.
 */
interface AddAssetButtonProps {

    /**
     * Function to set a boolean indicating whether an asset is currently being placed.
     * @param placing  boolean indicating whether an asset is currently being placed.
     */
    setPlacing: (placing: boolean) => void;
}

/**
 * A control button adding an asset to the map.
 * 
 * @param {AddAssetButtonProps} props - Component props.
 * @returns {JSX.Element | null} The rendered add button or null if hidden.
 */
const AddAssetButton = ({ setPlacing }: AddAssetButtonProps) => {

    return (
        <ControlButton onClick={() => setPlacing(true)} aria-label="Add asset">
            <Typography fontSize={15}>{'Add Asset'}</Typography>
        </ControlButton>
    );
};

export default AddAssetButton;
