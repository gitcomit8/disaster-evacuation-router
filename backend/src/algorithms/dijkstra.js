/**
 * Dijkstra's Algorithm Implementation
 * Finds the shortest path between two vertices in a weighted graph
 * Time Complexity: O((V + E) log V) with min-priority queue
 */

class MinPriorityQueue {
  constructor() {
    this.items = [];
  }

  enqueue(element, priority) {
    const queueElement = { element, priority };
    let added = false;

    for (let i = 0; i < this.items.length; i++) {
      if (queueElement.priority < this.items[i].priority) {
        this.items.splice(i, 0, queueElement);
        added = true;
        break;
      }
    }

    if (!added) {
      this.items.push(queueElement);
    }
  }

  dequeue() {
    if (this.isEmpty()) return null;
    return this.items.shift();
  }

  isEmpty() {
    return this.items.length === 0;
  }

  size() {
    return this.items.length;
  }
}

/**
 * Dijkstra's shortest path algorithm
 * @param {Graph} graph - The graph to search
 * @param {string} startVertexId - Starting vertex ID
 * @param {string} endVertexId - Destination vertex ID
 * @returns {Object} { path: Array<string>, distance: number, expanded: number }
 */
function dijkstra(graph, startVertexId, endVertexId) {
  // Initialize distances and previous nodes
  const distances = new Map();
  const previous = new Map();
  const visited = new Set();
  const pq = new MinPriorityQueue();

  const allVertices = graph.getAllVertices();

  // Initialize all distances to infinity
  for (const vertex of allVertices) {
    distances.set(vertex.id, Infinity);
    previous.set(vertex.id, null);
  }

  distances.set(startVertexId, 0);
  pq.enqueue(startVertexId, 0);

  let expandedCount = 0;

  while (!pq.isEmpty()) {
    const { element: currentVertexId } = pq.dequeue();

    if (visited.has(currentVertexId)) continue;
    visited.add(currentVertexId);
    expandedCount++;

    // Early termination if we reached the destination
    if (currentVertexId === endVertexId) {
      break;
    }

    const currentDistance = distances.get(currentVertexId);
    const neighbors = graph.getNeighbors(currentVertexId);

    for (const neighborId of neighbors) {
      if (visited.has(neighborId)) continue;

      const edgeWeight = graph.getEdgeWeight(currentVertexId, neighborId);

      // Skip unreachable edges (infinite weight)
      if (!isFinite(edgeWeight)) continue;

      const newDistance = currentDistance + edgeWeight;

      if (newDistance < distances.get(neighborId)) {
        distances.set(neighborId, newDistance);
        previous.set(neighborId, currentVertexId);
        pq.enqueue(neighborId, newDistance);
      }
    }
  }

  // Reconstruct path
  const path = [];
  let current = endVertexId;

  while (current !== null) {
    path.unshift(current);
    current = previous.get(current);
  }

  // Check if path is valid (start vertex must be in path)
  const isValidPath = path.length > 0 && path[0] === startVertexId;

  return {
    path: isValidPath ? path : [],
    distance: distances.get(endVertexId),
    nodesExpanded: expandedCount,
    found: isValidPath && path[path.length - 1] === endVertexId,
  };
}

export { dijkstra, MinPriorityQueue };
