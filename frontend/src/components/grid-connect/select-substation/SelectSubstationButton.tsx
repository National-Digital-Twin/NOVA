import { Box, styled } from '@mui/material';
import ControlButton from '../../../shared/control-button/ControlButton';
import { SubstationsListContainer } from '../../map-substations-list';
import { useState } from 'react';

const StyledContainer = styled(Box)({
    position: 'relative',
});

interface SelectSubstationButtonProps {
}

const SelectSubstationButton = ({ }: SelectSubstationButtonProps) => {
    const [showSubstationsList, setShowSubstationsList] = useState(false);
    const revealSubstationsList = () => {
        setShowSubstationsList(!showSubstationsList);
    }

    return (
        <StyledContainer>
            <ControlButton onClick={revealSubstationsList} aria-label="Select substation">
                <span style={{ marginRight: '8px' }}>Choose substation</span>
            </ControlButton>
            {showSubstationsList && (
                <div style={{
                        position: 'absolute',
                        bottom: '-320px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 1000,
                        width: '250px',
                    }}
                >
                    <SubstationsListContainer
                        setShowSubstationsList={setShowSubstationsList}
                    />
                </div>
            )}
        </StyledContainer>
    );
};

export default SelectSubstationButton;
