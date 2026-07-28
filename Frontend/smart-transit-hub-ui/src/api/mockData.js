// Comprehensive Mock Data for Standalone Demo & Offline Simulation Mode

export const MOCK_USERS = [
  { id: 1, username: 'admin', fullName: 'Administrator', phoneNumber: '+1 555-0100', role: 'ADMIN', isActive: true },
  { id: 2, username: 'driver1', fullName: 'John Driver', phoneNumber: '+1 555-0199', role: 'DRIVER', isActive: true },
  { id: 3, username: 'parent1', fullName: 'Sarah Jenkins', phoneNumber: '+1 555-0188', role: 'PARENT', isActive: true },
  { id: 4, username: 'parent2', fullName: 'Robert Miller', phoneNumber: '+1 555-0177', role: 'PARENT', isActive: true },
];

export const MOCK_ROUTES = [
  {
    id: 1,
    routeName: 'Route A - Downtown to Central Academy',
    stops: [
      { id: 101, stopName: 'Maple Street Hub', latitude: 37.774929, longitude: -122.419416, sequenceOrder: 1 },
      { id: 102, stopName: 'Pine Crest Apartments', latitude: 37.779800, longitude: -122.413200, sequenceOrder: 2 },
      { id: 103, stopName: 'Oak Ridge Park Stop', latitude: 37.785200, longitude: -122.408500, sequenceOrder: 3 },
      { id: 104, stopName: 'Highland Heights', latitude: 37.789500, longitude: -122.401100, sequenceOrder: 4 },
      { id: 105, stopName: 'Central Academy Campus', latitude: 37.794200, longitude: -122.395800, sequenceOrder: 5 }
    ]
  },
  {
    id: 2,
    routeName: 'Route B - Westside Suburbs Express',
    stops: [
      { id: 201, stopName: 'Sunset Blvd Crossing', latitude: 37.765000, longitude: -122.440000, sequenceOrder: 1 },
      { id: 202, stopName: 'Golden Park Way', latitude: 37.770000, longitude: -122.432000, sequenceOrder: 2 },
      { id: 203, stopName: 'Central Academy Campus', latitude: 37.794200, longitude: -122.395800, sequenceOrder: 3 }
    ]
  }
];

export const MOCK_BUSES = [
  { id: 1, busNumber: 'BUS-101', plateNumber: '7XYZ89', capacity: 45, driverId: 2, driverName: 'John Driver', routeId: 1, routeName: 'Route A - Downtown to Central Academy' },
  { id: 2, busNumber: 'BUS-102', plateNumber: '3ABC45', capacity: 40, driverId: 2, driverName: 'John Driver', routeId: 2, routeName: 'Route B - Westside Suburbs Express' }
];

export const MOCK_STUDENTS = [
  { id: 1, firstName: 'Emma', lastName: 'Jenkins', rollNumber: 'STU-8801', parentId: 3, parentName: 'Sarah Jenkins', stopId: 102, stopName: 'Pine Crest Apartments' },
  { id: 2, firstName: 'Lucas', lastName: 'Jenkins', rollNumber: 'STU-8802', parentId: 3, parentName: 'Sarah Jenkins', stopId: 104, stopName: 'Highland Heights' },
  { id: 3, firstName: 'Oliver', lastName: 'Miller', rollNumber: 'STU-8803', parentId: 4, parentName: 'Robert Miller', stopId: 103, stopName: 'Oak Ridge Park Stop' }
];

// Generate interpolated GPS points along route stops for smooth simulation
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
        totalStops: stops.length
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
    totalStops: stops.length
  });

  return points;
};
