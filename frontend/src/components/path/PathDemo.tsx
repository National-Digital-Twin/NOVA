import { useState } from 'react';
import type { FC, RefObject } from 'react';
import type { MapRef } from 'react-map-gl/maplibre';
import SubstationConnectionComponent from './SubstationConnectionComponent';
import SubstationMarker from './SubstationMarker';
import ControlButton from '../../shared/control-button/ControlButton';

interface PathDemoProps {
  mapRef: RefObject<MapRef>;
}

const PathDemo: FC<PathDemoProps> = ({ mapRef }) => {
  const [showPath, setShowPath] = useState(true);

  // Sample coordinates from the issue description
  const sourceLng = -1.2351657470055102;
  const sourceLat = 50.69818355537279;
  const destLng = -1.3292469238700164;
  const destLat = 50.69720891748469;

  const togglePath = () => {
    setShowPath(!showPath);
  };

  return (
    <div style={{ position: 'absolute', bottom: '20px', right: '20px' }}>
      <ControlButton
        onClick={togglePath}
        aria-label={showPath ? 'Hide Path' : 'Show Path'}
        showTooltip={true}
      >
        {showPath ? '✕' : '↔'}
      </ControlButton>
      {showPath && (
        <>
          <SubstationConnectionComponent
            mapRef={mapRef}
            sourceLng={sourceLng}
            sourceLat={sourceLat}
            destLng={destLng}
            destLat={destLat}
          />
          <SubstationMarker
            mapRef={mapRef}
            lng={destLng}
            lat={destLat}
            name="Sample data showing on popup"
          />
        </>
      )}
    </div>
  );
};

export default PathDemo;
