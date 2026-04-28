import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';
import dotenv from 'dotenv';
import Graph from './algorithms/Graph.js';
import { dijkstra } from './algorithms/dijkstra.js';
import { aStar } from './algorithms/astar.js';
import DynamicCostEngine from './services/DynamicCostEngine.js';
import HazardSimulator from './services/HazardSimulator.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.WS_CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5000;

// Initialize core services
const graph = new Graph();
const costEngine = new DynamicCostEngine();
const hazardSimulator = new HazardSimulator();

// Create a sample graph for demonstration
function initializeDefaultGraph() {
  // Add vertices (intersections and safe zones)
  const vertices = [
    { id: 'A', lat: 40.7128, lon: -74.0060, type: 'intersection' },
    { id: 'B', lat: 40.7200, lon: -74.0000, type: 'intersection' },
    { id: 'C', lat: 40.7100, lon: -74.0100, type: 'intersection' },
    { id: 'D', lat: 40.7300, lon: -73.9900, type: 'safe_zone' },
    { id: 'E', lat: 40.7150, lon: -74.0020, type: 'intersection' },
    { id: 'F', lat: 40.7250, lon: -73.9950, type: 'safe_zone' },
  ];

  for (const v of vertices) {
    graph.addVertex(v.id, v);
  }

  // Add edges with base distances
  const edges = [
    { from: 'A', to: 'B', distance: 1000 },
    { from: 'A', to: 'C', distance: 1200 },
    { from: 'B', to: 'D', distance: 1500 },
    { from: 'B', to: 'E', distance: 800 },
    { from: 'C', to: 'E', distance: 900 },
    { from: 'E', to: 'D', distance: 1300 },
    { from: 'E', to: 'F', distance: 1100 },
    { from: 'C', to: 'F', distance: 1600 },
  ];

  for (const e of edges) {
    graph.addEdge(e.from, e.to, e.distance);
  }

  console.log('📊 Default graph initialized:', graph.getStats());
}

initializeDefaultGraph();

// Middleware
app.use(cors());
app.use(express.json());

// REST API Endpoints

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// Get graph info
app.get('/api/graph', (req, res) => {
  res.json({
    vertices: graph.getAllVertices(),
    stats: graph.getStats(),
  });
});

// Get all hazards
app.get('/api/hazards', (req, res) => {
  res.json({
    hazards: hazardSimulator.getAllHazards(),
    stats: hazardSimulator.getStats(),
  });
});

// Get cost engine stats
app.get('/api/costs', (req, res) => {
  res.json({
    hazards: costEngine.getAllHazards(),
    stats: costEngine.getStats(),
  });
});

// Find shortest path using Dijkstra
app.post('/api/route/dijkstra', (req, res) => {
  const { start, end } = req.body;

  if (!graph.hasVertex(start) || !graph.hasVertex(end)) {
    return res.status(400).json({ error: 'Invalid start or end vertex' });
  }

  const result = dijkstra(graph, start, end);
  res.json(result);
});

// Find optimal path using A*
app.post('/api/route/astar', (req, res) => {
  const { start, end } = req.body;

  if (!graph.hasVertex(start) || !graph.hasVertex(end)) {
    return res.status(400).json({ error: 'Invalid start or end vertex' });
  }

  const hazardMap = new Map(
    costEngine.getAllHazards().map(h => [h.id, h])
  );

  const result = aStar(graph, start, end, hazardMap);
  res.json(result);
});

// WebSocket connection
io.on('connection', (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);

  // Send initial state
  socket.emit('state', {
    graph: graph.getAllVertices(),
    hazards: hazardSimulator.getAllHazards(),
  });

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });

  socket.on('ping', () => {
    socket.emit('pong');
  });

  // Request route calculation
  socket.on('request-route', (data) => {
    const { start, end, algorithm } = data;

    if (!graph.hasVertex(start) || !graph.hasVertex(end)) {
      socket.emit('route-error', { error: 'Invalid vertices' });
      return;
    }

    let result;
    if (algorithm === 'dijkstra') {
      result = dijkstra(graph, start, end);
    } else {
      const hazardMap = new Map(
        costEngine.getAllHazards().map(h => [h.id, h])
      );
      result = aStar(graph, start, end, hazardMap);
    }

    socket.emit('route-result', result);
  });
});

// Setup hazard simulation callbacks
hazardSimulator.onAdd((hazardId, hazardData) => {
  costEngine.addHazard(hazardId, hazardData);
  io.emit('hazard-added', hazardData);
});

hazardSimulator.onRemove((hazardId) => {
  costEngine.removeHazard(hazardId);
  io.emit('hazard-removed', { id: hazardId });
});

hazardSimulator.onUpdate((hazardId, hazardData) => {
  costEngine.updateHazard(hazardId, hazardData);
  io.emit('hazard-updated', hazardData);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
  console.log(`🔗 http://localhost:${PORT}`);
});

// Optional: Start hazard simulation on demand
// Uncomment to enable automatic hazard spawning:
// hazardSimulator.start();

export { app, server, io, graph, costEngine, hazardSimulator };
