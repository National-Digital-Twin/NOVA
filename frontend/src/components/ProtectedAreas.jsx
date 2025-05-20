import React, { useMemo } from 'react';
import { Source, Layer } from 'react-map-gl';

// Isle of Wight bounding box (approximate)
const IOW_BOUNDS = {
  minLng: -1.5937, // westernmost point
  maxLng: -1.0623, // easternmost point
  minLat: 50.5761, // southernmost point
  maxLat: 50.7696  // northernmost point
};

// Function to generate a random point within the Isle of Wight bounds
const generateRandomPoint = () => {
  const lng = IOW_BOUNDS.minLng + Math.random() * (IOW_BOUNDS.maxLng - IOW_BOUNDS.minLng);
  const lat = IOW_BOUNDS.minLat + Math.random() * (IOW_BOUNDS.maxLat - IOW_BOUNDS.minLat);
  return [lng, lat];
};

// Function to generate a random polygon (protected area) around a point
const generateRandomPolygon = (centerPoint) => {
  // Generate a random radius between 0.005 and 0.015 degrees (roughly 500m to 1.5km)
  const radius = 0.005 + Math.random() * 0.01;

  // Generate points in a circle around the center
  const numPoints = 6 + Math.floor(Math.random() * 6); // 6-11 points for irregular shape
  const points = [];

  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * 2 * Math.PI;
    // Add some randomness to the radius for more natural shapes
    const adjustedRadius = radius * (0.8 + Math.random() * 0.4);
    const lng = centerPoint[0] + adjustedRadius * Math.cos(angle);
    const lat = centerPoint[1] + adjustedRadius * Math.sin(angle);
    points.push([lng, lat]);
  }

  // Close the polygon by adding the first point again
  points.push([...points[0]]);

  return points;
};

function ProtectedAreas({ visible = true }) {
  // Generate 10 random protected areas
  const protectedAreasData = useMemo(() => {
    const features = [];

    for (let i = 0; i < 10; i++) {
      const centerPoint = generateRandomPoint();
      const polygon = generateRandomPolygon(centerPoint);

      features.push({
        type: 'Feature',
        properties: {
          id: i,
          name: `Protected Area ${i + 1}`
        },
        geometry: {
          type: 'Polygon',
          coordinates: [polygon]
        }
      });
    }

    return {
      type: 'FeatureCollection',
      features
    };
  }, []);

  // Layer style for protected areas
  const layerStyle = {
    id: 'protected-areas',
    type: 'fill',
    paint: {
      'fill-color': '#00FF00', // Bright green
      'fill-opacity': 0.5,     // 50% opacity
      'fill-outline-color': '#00CC00' // Slightly darker green for the outline
    }
  };

  // Only render if visible is true
  if (!visible) return null;

  return (
    <Source id="protected-areas-source" type="geojson" data={protectedAreasData}>
      <Layer {...layerStyle} />
    </Source>
  );
}

export default ProtectedAreas;
