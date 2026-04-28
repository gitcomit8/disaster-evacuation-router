import PriorityQueue from './PriorityQueue.js';

const EARTH_RADIUS = 6371000; // meters

export function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + 
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS * c;
}

function aStarHeuristic(current, goal, graph, hazards = []) {
  const currentVertex = graph.getVertex(current);
  const goalVertex = graph.getVertex(goal);

  if (!currentVertex || !goalVertex) return 0;

  const distance = haversineDistance(
    currentVertex.lat,
    currentVertex.lon,
    goalVertex.lat,
    goalVertex.lon
  );

  let hazardPenalty = 0;
  for (const hazard of hazards) {
    const distToHazard = haversineDistance(
      currentVertex.lat,
      currentVertex.lon,
      hazard.lat,
      hazard.lon
    );
    const radius = hazard.radius || 500;

    if (distToHazard < radius) {
      hazardPenalty += Math.max(0, 1 - distToHazard / radius) * 1000;
    }
  }

  return distance + hazardPenalty * 0.5;
}

export function aStar(graph, start, goal, costEngine = null, hazards = []) {
  const openSet = new PriorityQueue();
  const gScore = new Map();
  const fScore = new Map();
  const cameFrom = new Map();
  const visited = new Set();

  const getVertices = () => Array.from(graph.vertices.keys());

  getVertices().forEach(v => {
    gScore.set(v, Infinity);
    fScore.set(v, Infinity);
  });

  gScore.set(start, 0);
  const h = aStarHeuristic(start, goal, graph, hazards);
  fScore.set(start, h);
  openSet.enqueue(start, h);

  while (!openSet.isEmpty()) {
    const current = openSet.dequeue();

    if (current === goal) {
      const path = [];
      let curr = goal;
      while (cameFrom.has(curr)) {
        path.unshift(curr);
        curr = cameFrom.get(curr);
      }
      path.unshift(start);
      return {
        path,
        distance: gScore.get(goal),
        found: true
      };
    }

    if (visited.has(current)) continue;
    visited.add(current);

    const neighbors = graph.getNeighbors(current);

    for (const neighbor of neighbors) {
      if (visited.has(neighbor.id)) continue;

      let weight = neighbor.weight;

      if (weight === Infinity) continue;

      const tentativeGScore = gScore.get(current) + weight;

      if (tentativeGScore < gScore.get(neighbor.id)) {
        cameFrom.set(neighbor.id, current);
        gScore.set(neighbor.id, tentativeGScore);
        const hScore = aStarHeuristic(neighbor.id, goal, graph, hazards);
        const newFScore = tentativeGScore + hScore;
        fScore.set(neighbor.id, newFScore);
        openSet.enqueue(neighbor.id, newFScore);
      }
    }
  }

  return {
    path: [],
    distance: Infinity,
    found: false
  };
}
