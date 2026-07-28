/**
 * Generates interpolated GPS path points between route stops
 * for smooth bus movement simulation and telemetry streaming.
 */
export const generateRoutePath = (stops) => {
  if (!stops || stops.length < 2) return [];
  const points = [];

  for (let i = 0; i < stops.length - 1; i++) {
    const start = stops[i];
    const end = stops[i + 1];
    const steps = 15; // Interpolate 15 micro steps between each stop

    for (let s = 0; s < steps; s++) {
      const ratio = s / steps;
      const lat = start.latitude + (end.latitude - start.latitude) * ratio;
      const lng = start.longitude + (end.longitude - start.longitude) * ratio;
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

  // Add final stop point
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
