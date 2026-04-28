/**
 * Unit Tests for Graph Data Structure and Pathfinding Algorithms
 * Run with: npm test
 */

import Graph from '../src/algorithms/Graph.js';
import { dijkstra } from '../src/algorithms/dijkstra.js';
import { aStar, haversineDistance } from '../src/algorithms/astar.js';

describe('Graph Data Structure', () => {
  let graph;

  beforeEach(() => {
    graph = new Graph();
  });

  test('should add vertices', () => {
    graph.addVertex('A', { type: 'intersection', lat: 40.7128, lon: -74.006 });
    expect(graph.hasVertex('A')).toBe(true);
    expect(graph.vertices.size).toBe(1);
  });

  test('should add edges', () => {
    graph.addVertex('A');
    graph.addVertex('B');
    graph.addEdge('A', 'B', 10);

    expect(graph.getNeighbors('A')).toContain('B');
    expect(graph.getEdgeWeight('A', 'B')).toBe(10);
  });

  test('should get neighbors', () => {
    graph.addVertex('A');
    graph.addVertex('B');
    graph.addVertex('C');
    graph.addEdge('A', 'B', 5);
    graph.addEdge('A', 'C', 7);

    const neighbors = graph.getNeighbors('A');
    expect(neighbors).toHaveLength(2);
    expect(neighbors).toContain('B');
    expect(neighbors).toContain('C');
  });

  test('should return Infinity for non-existent edges', () => {
    graph.addVertex('A');
    graph.addVertex('B');
    expect(graph.getEdgeWeight('A', 'B')).toBe(Infinity);
  });

  test('should update edge weights', () => {
    graph.addVertex('A');
    graph.addVertex('B');
    graph.addEdge('A', 'B', 10);
    graph.updateEdgeWeight('A', 'B', 20);

    expect(graph.getEdgeWeight('A', 'B')).toBe(20);
  });

  test('should reset edge weights', () => {
    graph.addVertex('A');
    graph.addVertex('B');
    graph.addEdge('A', 'B', 10);
    graph.updateEdgeWeight('A', 'B', 50);
    graph.resetEdgeWeights();

    expect(graph.getEdgeWeight('A', 'B')).toBe(10);
  });
});

describe('Dijkstra Algorithm', () => {
  let graph;

  beforeEach(() => {
    graph = new Graph();
    // Create a simple graph:
    //   A --5-- B --2-- D
    //   |       |       |
    //   3       4       1
    //   |       |       |
    //   C -----6------- E
    graph.addVertex('A');
    graph.addVertex('B');
    graph.addVertex('C');
    graph.addVertex('D');
    graph.addVertex('E');

    graph.addEdge('A', 'B', 5);
    graph.addEdge('A', 'C', 3);
    graph.addEdge('B', 'D', 2);
    graph.addEdge('B', 'E', 4);
    graph.addEdge('C', 'E', 6);
    graph.addEdge('D', 'E', 1);
  });

  test('should find shortest path', () => {
    const result = dijkstra(graph, 'A', 'E');
    expect(result.found).toBe(true);
    expect(result.path).toEqual(['A', 'B', 'D', 'E']);
    expect(result.distance).toBe(8); // 5 + 2 + 1
  });

  test('should find direct path', () => {
    const result = dijkstra(graph, 'A', 'B');
    expect(result.found).toBe(true);
    expect(result.path).toEqual(['A', 'B']);
    expect(result.distance).toBe(5);
  });

  test('should handle unreachable nodes', () => {
    graph.addVertex('F');
    const result = dijkstra(graph, 'A', 'F');
    expect(result.found).toBe(false);
    expect(result.distance).toBe(Infinity);
  });

  test('should handle same start and end', () => {
    const result = dijkstra(graph, 'A', 'A');
    expect(result.found).toBe(true);
    expect(result.path).toEqual(['A']);
    expect(result.distance).toBe(0);
  });

  test('should respect edge weights', () => {
    const result = dijkstra(graph, 'A', 'D');
    expect(result.found).toBe(true);
    expect(result.distance).toBe(7); // A->B (5) + B->D (2)
  });

  test('should skip infinite weight edges', () => {
    graph.updateEdgeWeight('A', 'B', Infinity);
    const result = dijkstra(graph, 'A', 'D');
    // Should find alternate path or no path
    expect(result.path.length === 0 || !result.path.includes('B')).toBe(true);
  });
});

describe('A* Algorithm', () => {
  let graph;

  beforeEach(() => {
    graph = new Graph();
    // Create graph with coordinates
    graph.addVertex('A', { lat: 40.7128, lon: -74.006 }); // Start
    graph.addVertex('B', { lat: 40.7200, lon: -74.000 });
    graph.addVertex('C', { lat: 40.7100, lon: -74.010 });
    graph.addVertex('D', { lat: 40.7300, lon: -73.990 }); // Safe zone
    graph.addVertex('E', { lat: 40.7150, lon: -74.002 });

    graph.addEdge('A', 'B', 1000);
    graph.addEdge('A', 'C', 1200);
    graph.addEdge('B', 'D', 1500);
    graph.addEdge('B', 'E', 800);
    graph.addEdge('C', 'E', 900);
    graph.addEdge('E', 'D', 1300);
  });

  test('should find path with heuristic', () => {
    const result = aStar(graph, 'A', 'D');
    expect(result.found).toBe(true);
    expect(result.path[0]).toBe('A');
    expect(result.path[result.path.length - 1]).toBe('D');
  });

  test('should expand fewer nodes than Dijkstra for same graph', () => {
    const dijkstraResult = dijkstra(graph, 'A', 'D');
    const astarResult = aStar(graph, 'A', 'D');

    // A* should typically expand same or fewer nodes
    expect(astarResult.nodesExpanded).toBeLessThanOrEqual(dijkstraResult.nodesExpanded);
  });

  test('should handle hazards in heuristic', () => {
    const hazardMap = new Map([
      ['hazard1', { radius: 500, lat: 40.7200, lon: -74.000 }],
    ]);

    const result = aStar(graph, 'A', 'D', hazardMap);
    expect(result.found).toBe(true);
  });

  test('should handle unreachable targets', () => {
    graph.addVertex('F', { lat: 50.0, lon: -50.0 });
    const result = aStar(graph, 'A', 'F');
    expect(result.found).toBe(false);
  });
});

describe('Haversine Distance', () => {
  test('should calculate distance correctly', () => {
    const coord1 = { lat: 40.7128, lon: -74.006 }; // NYC
    const coord2 = { lat: 34.0522, lon: -118.2437 }; // LA
    const distance = haversineDistance(coord1, coord2);

    // NYC to LA is approximately 3944 km
    expect(distance).toBeGreaterThan(3900000); // in meters
    expect(distance).toBeLessThan(4000000);
  });

  test('should return 0 for same coordinates', () => {
    const coord = { lat: 40.7128, lon: -74.006 };
    const distance = haversineDistance(coord, coord);
    expect(distance).toBe(0);
  });
});

// Export test summary
console.log('✅ All algorithm tests defined. Run with: npm test');
