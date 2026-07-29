/**
 * Fetches actual geographical road navigation path using OpenStreetMap OSRM API.
 * The bus follows actual roads, streets, turns, and highways instead of straight lines.
 */
export const fetchRealRoadRoutePath = async (stops) => {
  if (!stops || stops.length === 0) return [];

  if (stops.length === 1) {
    return generateFallbackPath(stops);
  }

  try {
    // Construct OSRM API coordinate string: lon1,lat1;lon2,lat2;lon3,lat3
    const coordString = stops.map(s => `${s.longitude},${s.latitude}`).join(';');
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coordString}?overview=full&geometries=geojson`;

    const response = await fetch(osrmUrl);
    if (response.ok) {
      const data = await response.json();
      if (data.routes && data.routes.length > 0 && data.routes[0].geometry) {
        const roadCoords = data.routes[0].geometry.coordinates; // Array of [lng, lat]

        if (roadCoords && roadCoords.length > 0) {
          // Map OSRM road coordinates into telemetry points with stop progress tracking
          return roadCoords.map((coord, idx) => {
            const lng = coord[0];
            const lat = coord[1];

            // Progress percentage along the geographical road
            const progressRatio = idx / Math.max(1, roadCoords.length - 1);
            const stopSegment = Math.min(stops.length - 1, Math.floor(progressRatio * (stops.length - 1)));
            const nextStop = stops[Math.min(stops.length - 1, stopSegment + 1)];

            return {
              latitude: lat,
              longitude: lng,
              currentStopId: stops[stopSegment]?.id,
              nextStopId: nextStop?.id || stops[stops.length - 1].id,
              nextStopName: nextStop?.stopName || stops[stops.length - 1].stopName,
              stopIndex: stopSegment + 1,
              totalStops: stops.length,
            };
          });
        }
      }
    }
  } catch (err) {
    console.warn('OSRM road routing unavailable, falling back to curved path', err);
  }

  // Fallback if OSRM service is unreachable
  return generateFallbackPath(stops);
};

export const generateRoutePath = (stops) => {
  return generateFallbackPath(stops);
};

const generateFallbackPath = (stops) => {
  if (!stops || stops.length === 0) return [];
  const points = [];

  if (stops.length === 1) {
    const single = stops[0];
    const steps = 20;
    const radius = 0.002;
    for (let i = 0; i <= steps; i++) {
      const angle = (i / steps) * 2 * Math.PI;
      points.push({
        latitude: single.latitude + Math.sin(angle) * radius,
        longitude: single.longitude + Math.cos(angle) * radius,
        currentStopId: single.id,
        nextStopId: single.id,
        nextStopName: single.stopName,
        stopIndex: 1,
        totalStops: 1,
      });
    }
    return points;
  }

  for (let i = 0; i < stops.length - 1; i++) {
    const start = stops[i];
    const end = stops[i + 1];
    const steps = 25;

    for (let s = 0; s < steps; s++) {
      const ratio = s / steps;
      // Add S-curve street simulation offset
      const curveOffset = Math.sin(ratio * Math.PI * 2) * 0.0004;
      const lat = start.latitude + (end.latitude - start.latitude) * ratio + curveOffset;
      const lng = start.longitude + (end.longitude - start.longitude) * ratio + (curveOffset * 0.5);

      points.push({
        latitude: lat,
        longitude: lng,
        currentStopId: start.id,
        nextStopId: end.id,
        nextStopName: end.stopName,
        stopIndex: i + 1,
        totalStops: stops.length,
      });
    }
  }

  const lastStop = stops[stops.length - 1];
  points.push({
    latitude: lastStop.latitude,
    longitude: lastStop.longitude,
    currentStopId: lastStop.id,
    nextStopId: lastStop.id,
    nextStopName: lastStop.stopName + ' (Final Destination)',
    stopIndex: stops.length,
    totalStops: stops.length,
  });

  return points;
};
