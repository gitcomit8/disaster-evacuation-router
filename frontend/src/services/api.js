import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 5000,
});

const api = {
  // Health check
  health: () => apiClient.get('/health'),

  // Graph operations
  getGraph: () => apiClient.get('/graph'),

  // Hazard operations
  getHazards: () => apiClient.get('/hazards'),

  // Cost engine
  getCosts: () => apiClient.get('/costs'),

  // Routing
  dijkstra: (start, end) => apiClient.post('/route/dijkstra', { start, end }),
  aStar: (start, end) => apiClient.post('/route/astar', { start, end }),

  // Generic post method
  post: (endpoint, data) => apiClient.post(endpoint, data),

  // Generic get method
  get: (endpoint) => apiClient.get(endpoint),
};

export default api;
