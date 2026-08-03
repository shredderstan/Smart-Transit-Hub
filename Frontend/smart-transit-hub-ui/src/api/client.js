import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT Bearer Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle 401 globally (token expired / invalid)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },
  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },
};

export const driverAPI = {
  getAssignedBus: async () => {
    const res = await api.get('/driver/assigned-bus');
    return res.data;
  },
  getActiveTrip: async () => {
    const res = await api.get('/driver/active-trip');
    return res.data;
  },
  initializeTrip: async () => {
    const res = await api.post('/driver/trips/initialize');
    return res.data;
  },
  terminateTrip: async (tripId) => {
    const res = await api.post(`/driver/trips/${tripId}/terminate`);
    return res.data;
  },
  getTripStops: async (tripId) => {
    const res = await api.get(`/driver/trips/${tripId}/stops`);
    return res.data;
  },
  streamTelemetry: async (telemetryDto) => {
    const res = await api.post('/driver/telemetry/stream', telemetryDto);
    return res.data;
  },
  registerNotificationToken: async (dto) => {
    const res = await api.post('/driver/notifications/register-token', dto);
    return res.data;
  },
  removeNotificationToken: async (dto) => {
    const res = await api.post('/driver/notifications/remove-token', dto);
    return res.data;
  },
};

export const parentAPI = {
  getStudents: async () => {
    const res = await api.get('/parent/student/profile');
    return res.data;
  },
  getActiveTrip: async () => {
    const res = await api.get('/parent/active-trip');
    return res.data;
  },
  getLatestTripData: async (tripId) => {
    const res = await api.get(`/parent/trips/${tripId}/latest`);
    return res.data;
  },
  getTripStops: async (tripId) => {
    const res = await api.get(`/parent/trips/${tripId}/stops`);
    return res.data;
  },
  getRouteStops: async (routeId) => {
    const res = await api.get(`/parent/routes/${routeId}/stops`);
    return res.data;
  },
  registerNotificationToken: async (dto) => {
    const res = await api.post('/parent/notifications/register-token', dto);
    return res.data;
  },
  removeNotificationToken: async (dto) => {
    const res = await api.post('/parent/notifications/remove-token', dto);
    return res.data;
  },
};

export const adminAPI = {
  getUsers: async () => {
    const res = await api.get('/admin/users');
    return res.data;
  },
  createUser: async (user) => {
    const res = await api.post('/admin/users', user);
    return res.data;
  },
  deleteUser: async (id) => {
    await api.delete(`/admin/users/${id}`);
    return true;
  },
  getBuses: async () => {
    const res = await api.get('/admin/buses');
    return res.data;
  },
  createBus: async (bus) => {
    const res = await api.post('/admin/buses', bus);
    return res.data;
  },
  deleteBus: async (id) => {
    await api.delete(`/admin/buses/${id}`);
    return true;
  },
  getRoutes: async () => {
    const res = await api.get('/admin/routes');
    return res.data;
  },
  createRoute: async (route) => {
    const res = await api.post('/admin/routes', route);
    return res.data;
  },
  deleteRoute: async (id) => {
    await api.delete(`/admin/routes/${id}`);
    return true;
  },
  getStops: async (routeId) => {
    const res = await api.get(`/admin/routes/${routeId}/stops`);
    return res.data;
  },
  saveStops: async (routeId, stops) => {
    const res = await api.post(`/admin/routes/${routeId}/stops`, stops);
    return res.data;
  },
  getStudents: async () => {
    const res = await api.get('/admin/students');
    return res.data;
  },
  createStudent: async (student) => {
    const res = await api.post('/admin/students', student);
    return res.data;
  },
  deleteStudent: async (id) => {
    await api.delete(`/admin/students/${id}`);
    return true;
  },
  searchPlaces: async (query) => {
    const res = await api.get('/admin/places/search', { params: { query } });
    return res.data;
  },
  getActiveTrips: async () => {
    const res = await api.get('/admin/active-trips');
    return res.data;
  },
  getLatestTripData: async (tripId) => {
    const res = await api.get(`/admin/trips/${tripId}/latest`);
    return res.data;
  },
};

export default api;
