# API Documentation

## Overview
This API provides endpoints for querying evacuation graphs, calculating optimal routes, and managing real-time hazard information.

## Base URL
- **REST**: `http://localhost:5000/api`
- **WebSocket**: `ws://localhost:5000`

---

## REST Endpoints

### Health Check
**GET** `/api/health`

Check if the server is running.

**Response:**
```json
{
  "status": "Server is running",
  "timestamp": "2026-04-28T23:00:00.000Z"
}
```

---

### Get Graph
**GET** `/api/graph`

Retrieve all vertices (intersections, safe zones) and graph statistics.

**Response:**
```json
{
  "vertices": [
    {
      "id": "A",
      "lat": 40.7128,
      "lon": -74.0060,
      "type": "intersection",
      "neighbors": ["B", "C"]
    },
    {
      "id": "D",
      "lat": 40.7300,
      "lon": -73.9900,
      "type": "safe_zone",
      "neighbors": ["B", "E"]
    }
  ],
  "stats": {
    "vertexCount": 6,
    "edgeCount": 8,
    "safeZones": 2,
    "hazards": 0
  }
}
```

---

### Get Hazards
**GET** `/api/hazards`

Retrieve all active hazards with their current radius and location.

**Response:**
```json
{
  "hazards": [
    {
      "id": "hazard_1",
      "lat": 40.7150,
      "lon": -74.0020,
      "radius": 125.5,
      "type": "fire",
      "createdAt": 1682707200000,
      "timeAlive": 45
    }
  ],
  "stats": {
    "running": true,
    "activeHazards": 1,
    "nextHazardId": 2
  }
}
```

---

### Get Cost Engine Stats
**GET** `/api/costs`

Retrieve cost engine statistics and active hazards tracked by the cost engine.

**Response:**
```json
{
  "hazards": [
    {
      "id": "hazard_1",
      "lat": 40.7150,
      "lon": -74.0020,
      "radius": 125.5,
      "type": "fire"
    }
  ],
  "stats": {
    "activeHazards": 1,
    "congestionPoints": 0,
    "parameters": {
      "alpha": 1.0,
      "beta": 0.5,
      "gamma": 2.0,
      "expansionRate": 0.1,
      "maxRadius": 500
    }
  }
}
```

---

### Find Route (Dijkstra)
**POST** `/api/route/dijkstra`

Find the shortest path between two vertices using Dijkstra's algorithm.

**Request:**
```json
{
  "start": "A",
  "end": "D"
}
```

**Response:**
```json
{
  "path": ["A", "B", "D"],
  "distance": 2500,
  "nodesExpanded": 4,
  "found": true
}
```

**Error Response:**
```json
{
  "error": "Invalid start or end vertex"
}
```

---

### Find Route (A*)
**POST** `/api/route/astar`

Find the optimal path between two vertices using A* algorithm with hazard-aware heuristic.

**Request:**
```json
{
  "start": "A",
  "end": "D"
}
```

**Response:**
```json
{
  "path": ["A", "B", "E", "D"],
  "distance": 3100,
  "nodesExpanded": 3,
  "found": true
}
```

---

## WebSocket Events

### Client → Server

#### `request-route`
Request route calculation from client.

**Payload:**
```json
{
  "start": "A",
  "end": "D",
  "algorithm": "astar"
}
```

#### `ping`
Heartbeat to keep connection alive.

---

### Server → Client

#### `state` (on connection)
Sends initial state to newly connected client.

**Payload:**
```json
{
  "graph": [...],
  "hazards": [...]
}
```

#### `hazard-added`
Emitted when a new hazard is spawned.

**Payload:**
```json
{
  "id": "hazard_1",
  "lat": 40.7150,
  "lon": -74.0020,
  "radius": 100,
  "type": "fire",
  "createdAt": 1682707200000
}
```

#### `hazard-updated`
Emitted when a hazard's position or radius changes.

**Payload:**
```json
{
  "id": "hazard_1",
  "lat": 40.7150,
  "lon": -74.0020,
  "radius": 125,
  "timeAlive": 5
}
```

#### `hazard-removed`
Emitted when a hazard is cleared.

**Payload:**
```json
{
  "id": "hazard_1"
}
```

#### `route-result`
Response to `request-route` event.

**Payload:**
```json
{
  "path": ["A", "B", "D"],
  "distance": 2500,
  "nodesExpanded": 4,
  "found": true
}
```

#### `route-error`
Error response to `request-route` event.

**Payload:**
```json
{
  "error": "Invalid vertices"
}
```

---

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Invalid start or end vertex | One or both vertex IDs don't exist in graph |
| 404 | Endpoint not found | Requested endpoint doesn't exist |
| 500 | Internal server error | Server error during processing |

---

## Example Usage

### cURL - Find Route
```bash
curl -X POST http://localhost:5000/api/route/astar \
  -H "Content-Type: application/json" \
  -d '{"start": "A", "end": "D"}'
```

### JavaScript - WebSocket Route Request
```javascript
const socket = io('ws://localhost:5000');

socket.emit('request-route', {
  start: 'A',
  end: 'D',
  algorithm: 'astar'
});

socket.on('route-result', (result) => {
  console.log('Route:', result.path);
  console.log('Distance:', result.distance);
});
```
