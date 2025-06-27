import { Box } from '@mui/material';
import DetailsPanel from '../../../shared/details-panel/DetailsPanel';
import { useMapStore } from '../../../stores/useMapStore';

export default function TurbineOutputPanel() {
    const gridConnectViewActive = useMapStore((s) => s.gridConnectViewActive);

    return (
      <Box
        sx={{
          display: "flex",
          transition: "flex-grow 0.3s ease",
          padding: 1,
          minHeight: 0,
          maxHeight: "25vh",
          marginLeft: "8px",
          marginRight: "10px",
          position: "absolute",
          bottom: "10px",
          width: "90%"
        ,
        }}
      >
        <DetailsPanel isOpen={gridConnectViewActive}>
            <div>Test</div>
        </DetailsPanel>
      </Box>
    );
}
