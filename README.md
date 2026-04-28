# Disaster Evacuation Route Finder

A real-time disaster evacuation routing application using graph theory and dynamic pathfinding algorithms (Dijkstra, A*).

## Project Structure

```
disaster-evacuation-router/
├── backend/              # Node.js + Express server
│   ├── src/
│   │   ├── algorithms/   # Dijkstra, A*, graph structures
│   │   ├── services/     # Hazard simulation, cost engine
│   │   ├── api/          # REST endpoints, WebSocket handlers
│   │   └── index.js      # Server entry point
│   └── tests/            # Unit tests for algorithms
│
├── frontend/             # React + Leaflet.js UI
│   ├── src/
│   │   ├── components/   # Map, Route, Hazard controls
│   │   ├── services/     # API client, WebSocket client
│   │   ├── hooks/        # Custom React hooks
│   │   └── App.jsx       # Main entry point
│   └── public/           # Static assets
│
└── docs/                 # Documentation
    ├── USER_GUIDE.md
    ├── TECHNICAL_PART_A.md
    ├── TECHNICAL_PART_B.md
    └── TECHNICAL_PART_C.md
```

## Quick Start

### Prerequisites
- Node.js 16+ and npm
- Redis (for caching)

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Server runs on http://localhost:5000

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

App runs on http://localhost:5173

## Using Docker

```bash
docker-compose up
```

This starts:
- Backend API on port 5000
- Frontend on port 5173
- Redis on port 6379

## Project Team

- **Person 1**: Algorithm Implementation & Backend Core (Dijkstra, A*, cost engine)
- **Person 2**: Frontend & UI/UX (Map visualization, route display)
- **Person 3**: Real-time Pipeline & Hazard Simulation (WebSocket, dynamic costs)

## Key Technologies

- **Frontend**: React 18 + Leaflet.js + Tailwind CSS
- **Backend**: Node.js + Express + Socket.io
- **Caching**: Redis
- **Algorithms**: Dijkstra, A*, dynamic cost calculation

## Architecture Overview

1. **Graph Model**: Intersections and safe zones as vertices, roads as weighted edges
2. **Dynamic Cost Function**: w(u,v) = α·distance + β·congestion + γ·hazard_risk
3. **Pathfinding**: A* with Haversine heuristic to nearest safe zone
4. **Real-time Updates**: WebSocket streaming of hazard changes triggers rerouting
5. **UI**: Interactive Leaflet map with route visualization and hazard overlay

## Testing

### Backend
```bash
cd backend
npm test                 # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
```

### Frontend
```bash
cd frontend
npm run dev             # Dev server with hot reload
```

## Documentation

- **User Guide**: `docs/USER_GUIDE.md` - How to use the application
- **Technical Part A**: `docs/TECHNICAL_PART_A.md` - Algorithm design and implementation
- **Technical Part B**: `docs/TECHNICAL_PART_B.md` - Frontend architecture
- **Technical Part C**: `docs/TECHNICAL_PART_C.md` - Real-time pipeline and hazard simulation

## Viva Presentation

Each team member (10 minutes):
1. Algorithm walkthrough + demo (Person 1)
2. UI/Frontend demo (Person 2)
3. Real-time integration demo (Person 3)
4. Q&A (5-10 minutes)

## License

MIT
