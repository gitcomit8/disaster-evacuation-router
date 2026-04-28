class Graph {
  constructor() {
    this.vertices = new Map();
  }

  addVertex(id, data = {}) {
    if (!this.vertices.has(id)) {
      this.vertices.set(id, {
        id,
        ...data,
        neighbors: []
      });
    }
  }

  hasVertex(id) {
    return this.vertices.has(id);
  }

  addEdge(fromId, toId, distance) {
    const from = this.vertices.get(fromId);
    const to = this.vertices.get(toId);

    if (!from || !to) {
      throw new Error(`Vertex not found: ${!from ? fromId : toId}`);
    }

    from.neighbors.push({ to: toId, weight: distance });
  }

  getVertex(id) {
    return this.vertices.get(id);
  }

  getVertices() {
    return Array.from(this.vertices.values());
  }

  getAllVertices() {
    return this.getVertices();
  }

  getNeighbors(id) {
    const vertex = this.vertices.get(id);
    if (!vertex) return [];
    return vertex.neighbors.map(edge => ({
      id: edge.to,
      weight: edge.weight,
      vertex: this.vertices.get(edge.to)
    }));
  }

  hasEdge(fromId, toId) {
    const from = this.vertices.get(fromId);
    if (!from) return false;
    return from.neighbors.some(edge => edge.to === toId);
  }

  getEdgeWeight(fromId, toId) {
    const from = this.vertices.get(fromId);
    if (!from) return null;
    const edge = from.neighbors.find(e => e.to === toId);
    return edge ? edge.weight : null;
  }

  updateEdgeWeight(fromId, toId, newWeight) {
    const from = this.vertices.get(fromId);
    if (!from) return false;
    const edge = from.neighbors.find(e => e.to === toId);
    if (edge) {
      edge.weight = newWeight;
      return true;
    }
    return false;
  }

  getPathDistance(path) {
    let total = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const weight = this.getEdgeWeight(path[i], path[i + 1]);
      if (weight === null) return Infinity;
      total += weight;
    }
    return total;
  }

  getStats() {
    let edgeCount = 0;
    for (const vertex of this.vertices.values()) {
      edgeCount += vertex.neighbors.length;
    }
    return {
      vertices: this.vertices.size,
      edges: edgeCount,
      timestamp: new Date().toISOString()
    };
  }
}

export default Graph;
