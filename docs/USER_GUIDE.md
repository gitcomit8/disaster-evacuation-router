# Disaster Evacuation Route Finder - User Guide

## Table of Contents
1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Tutorial](#tutorial)
4. [Features](#features)
5. [Troubleshooting](#troubleshooting)

---

## Introduction

The **Disaster Evacuation Route Finder** is a real-time web application that helps users find optimal evacuation routes during disasters. Using advanced pathfinding algorithms (Dijkstra and A*), the system calculates the safest and quickest routes to designated safe zones while avoiding active hazard areas.

### Key Capabilities
- ✅ Real-time route optimization based on dynamic hazards
- ✅ Interactive map visualization with hazard overlay
- ✅ Multi-algorithm support (Dijkstra and A* pathfinding)
- ✅ Live hazard tracking and cost recalculation
- ✅ Mobile-responsive design

---

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection
- Local server running (or use provided web URL)

### Installation

#### Option 1: Using Docker (Recommended)
```bash
docker-compose up
```
Open http://localhost:5173 in your browser.

#### Option 2: Manual Setup

**Backend:**
```bash
cd backend
npm install
npm run dev
# Server starts on http://localhost:5000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# App opens on http://localhost:5173
```

---

## Tutorial

### Step 1: Open the Application
Navigate to http://localhost:5173 (or your server URL).

**What you see:**
- **Left side**: Interactive map showing intersections (blue), safe zones (green), and hazards (red circles)
- **Right side**: Route planner and active hazards list
- **Top**: Status bar showing connection status and graph statistics

### Step 2: Select Your Current Location
In the "Route Planner" panel, enter your current location in the **Start Location** field.

Example: Type `A` and press Enter.

**Tip**: You can see all available locations by clicking vertices on the map.

### Step 3: Select Your Destination
In the "Destination (Safe Zone)" field, enter a safe zone ID.

Example: Type `D` (a designated safe zone).

**Tip**: Safe zones are marked in green on the map.

### Step 4: Calculate Route
Click the **"Find Route"** button.

**What happens:**
1. The system analyzes the network
2. Takes into account active hazards
3. Calculates the optimal path
4. Highlights the route on the map in blue

### Step 5: Review Your Route
The route panel displays:
- **Path**: List of intersections you'll traverse (e.g., `A → B → D`)
- **Distance**: Total evacuation distance in meters
- **Nodes Expanded**: Number of locations the algorithm evaluated

---

## Features

### 1. Interactive Map
- **Zoom**: Scroll to zoom in/out
- **Pan**: Click and drag to move the map
- **Markers**: Click any marker to see details
- **Route Highlight**: Your calculated route is shown in blue
- **Hazard Visualization**: Red circles show active hazards and their radius

### 2. Route Planning
- **Algorithm Selection**: Currently uses A* (most optimal for hazard-aware routing)
- **Real-time Recalculation**: Route updates automatically when hazards change
- **Cost Breakdown**: See why certain routes are chosen

### 3. Hazard Tracking
The **Active Hazards** panel shows:
- Hazard ID and type (fire, flood, debris, etc.)
- Current radius (in meters) — expanding over time
- Exact coordinates

### 4. Connection Status
The status bar at the top shows:
- **Connection**: Green ✅ when connected, Red ❌ when disconnected
- **Graph Stats**: Number of vertices (intersections) and edges (roads)
- **Hazard Count**: Number of currently active hazards

### 5. Automatic Hazard Updates
When a new hazard spawns or expands:
1. The map updates in real-time
2. Active hazards list is refreshed
3. Routes are automatically recalculated if affected

---

## Scenarios

### Scenario 1: Simple Evacuation
**Setup:**
- Start at `A`
- Destination: Safe Zone `D`
- No active hazards

**Expected Result:**
- Direct route through fastest intersections
- Route might be: `A → B → D`

### Scenario 2: Hazard Avoidance
**Setup:**
- Start at `A`
- Destination: Safe Zone `D`
- Active hazard near intersection `B`

**Expected Result:**
- System reroutes around hazard
- Route might be: `A → C → E → D`
- Cost will be higher but safer

### Scenario 3: Multiple Hazards
**Setup:**
- Active hazards at multiple locations
- Start and destination unchanged

**Expected Result:**
- Algorithm finds path that minimizes total risk
- Larger detours may be taken to avoid high-risk zones

---

## Troubleshooting

### Q: "No route found between selected vertices"
**A:** 
- Verify both vertices exist in the graph
- Check that at least one safe zone is reachable
- Try different destination (all "safe_zone" type vertices are valid)

### Q: "Disconnected" status in top bar
**A:**
- Ensure backend server is running on port 5000
- Check your internet connection
- Refresh the page (F5)
- Check browser console for errors (F12)

### Q: Map is blank or not loading
**A:**
- Clear browser cache (Ctrl+Shift+Delete)
- Verify map tiles are loading (check Network tab in F12)
- Try a different browser
- Ensure you have internet for map tile service

### Q: Route doesn't update when hazards change
**A:**
- Ensure WebSocket is connected (check status bar)
- Try recalculating route manually with "Find Route"
- Reload page if WebSocket becomes unstable

### Q: Hazard circle is very small or large
**A:**
- Hazards expand over time (their radius increases)
- Very large circles indicate old hazards at maximum radius
- Wait a moment as system may be updating display

### Q: Can I manually add a hazard?
**A:**
- Currently, hazards are automatically simulated
- For testing, access `/api/hazards` endpoint to see active hazards
- Developer mode allows manual hazard spawning via API

---

## Advanced Tips

### Keyboard Shortcuts
- Press `F12` to open developer console
- Press `Ctrl+Shift+C` to inspect map elements

### Understanding Costs
The system calculates route cost as:
```
Cost = 1.0 × Distance + 0.5 × Congestion + 2.0 × Hazard_Risk
```

Routes with high hazard proximity are penalized more heavily.

### Optimal Safe Zones
Green-marked vertices (`type: safe_zone`) are designated evacuation points. All are equally safe once reached.

---

## Support & Feedback

For issues or suggestions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review [API Documentation](./API_DOCUMENTATION.md)
3. Check browser console for error messages (F12)

---

## Appendix: Vertex Reference

### Predefined Intersections
- **A**: Intersection at (40.7128, -74.0060)
- **B**: Intersection at (40.7200, -74.0000)
- **C**: Intersection at (40.7100, -74.0100)
- **E**: Intersection at (40.7150, -74.0020)

### Predefined Safe Zones
- **D**: Safe Zone at (40.7300, -73.9900)
- **F**: Safe Zone at (40.7250, -73.9950)

---

**Version**: 1.0  
**Last Updated**: 2026-04-28
