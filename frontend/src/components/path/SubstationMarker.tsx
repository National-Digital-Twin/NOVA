import { useEffect, useRef } from 'react';
import type { MapRef } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import substationIcon from '../../assets/Substation.png';

interface SubstationMarkerProps {
  mapRef: React.RefObject<MapRef>;
  lng: number;
  lat: number;
  message?: string;
  name?: string;
}

/**
 * A component that displays a substation marker on the map at the specified coordinates.
 * 
 * @param mapRef - Reference to the MapLibre map instance
 * @param lng - Longitude of the marker position
 * @param lat - Latitude of the marker position
 * @param message - Optional message to display when the marker is clicked
 * @param name - Optional name of the substation to display in a popup
 */
const SubstationMarker: React.FC<SubstationMarkerProps> = ({
  mapRef,
  lng,
  lat,
  name
}) => {
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    // Create a new marker element
    const el = document.createElement('div');
    el.className = 'marker';
    el.style.backgroundImage = `url(${substationIcon})`;
    el.style.width = '30px';
    el.style.height = '30px';
    el.style.backgroundSize = 'cover';
    el.style.cursor = 'pointer';

    // Create a popup to show the substation name
    if (name) {
      popupRef.current = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: [10, 20],
        anchor: 'top'
      })
      .setLngLat([lng, lat])
      .setHTML(`<div style="text-align: center;">${name}</div>`);
    }

    // Create and add the marker to the map
    markerRef.current = new maplibregl.Marker({ element: el })
      .setLngLat([lng, lat])
      .addTo(map);


    // Add event listeners to show/hide popup on hover
    if (name && popupRef.current) {
      el.addEventListener('mouseenter', () => {
        popupRef.current?.addTo(map);
      });

      el.addEventListener('mouseleave', () => {
        popupRef.current?.remove();
      });
    }

    // Cleanup function to remove the marker and popup when the component unmounts
    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
      }
      if (popupRef.current) {
        popupRef.current.remove();
      }
    };
  }, [mapRef, lng, lat, name]);

  return null; // This component doesn't render any UI elements
};

export default SubstationMarker;
