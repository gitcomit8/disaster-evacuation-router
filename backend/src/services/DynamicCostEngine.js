/**
 * Dynamic Cost Function Service
 * Calculates edge weights based on multiple factors:
 * w(u,v) = α*distance + β*congestion + γ*hazard_risk
 */

import { haversineDistance } from '../algorithms/astar.js';

class DynamicCostEngine {
  constructor(config = {}) {
    // Cost function parameters
    this.alpha = parseFloat(config.alpha || process.env.COST_ALPHA || 1.0);
    this.beta = parseFloat(config.beta || process.env.COST_BETA || 0.5);
    this.gamma = parseFloat(config.gamma || process.env.COST_GAMMA || 2.0);

    // Hazard tracking
    this.hazards = new Map(); // hazardId -> {lat, lon, radius, expandRate, createdAt}
    this.congestionMap = new Map(); // edgeKey -> congestionFactor (0-2)

    // Hazard expansion parameters
    this.hazardExpansionRate = parseFloat(
      config.expansionRate || process.env.HAZARD_EXPANSION_RATE || 0.1
    );
    this.hazardMaxRadius = parseFloat(
      config.maxRadius || process.env.HAZARD_MAX_RADIUS || 500
    );
  }

  /**
   * Register a new hazard in the system
   * @param {string} hazardId - Unique hazard identifier
   * @param {Object} hazardData - {lat, lon, radius, type}
   */
  addHazard(hazardId, hazardData) {
    this.hazards.set(hazardId, {
      id: hazardId,
      lat: hazardData.lat,
      lon: hazardData.lon,
      radius: hazardData.radius || 100,
      type: hazardData.type || 'fire', // fire, flood, debris, etc.
      createdAt: Date.now(),
      expandRate: this.hazardExpansionRate,
    });
  }

  /**
   * Remove a hazard when it's cleared
   * @param {string} hazardId - Hazard identifier
   */
  removeHazard(hazardId) {
    this.hazards.delete(hazardId);
  }

  /**
   * Update hazard position and radius (for propagating hazards)
   * @param {string} hazardId - Hazard identifier
   * @param {Object} updates - {lat, lon, radius}
   */
  updateHazard(hazardId, updates) {
    const hazard = this.hazards.get(hazardId);
    if (hazard) {
      if (updates.lat) hazard.lat = updates.lat;
      if (updates.lon) hazard.lon = updates.lon;
      if (updates.radius !== undefined) {
        hazard.radius = Math.min(updates.radius, this.hazardMaxRadius);
      }
    }
  }

  /**
   * Set congestion level for a specific edge
   * @param {string} from - Source vertex
   * @param {string} to - Destination vertex
   * @param {number} congestionFactor - 0-2 (0=clear, 1=normal, 2=severe)
   */
  setCongestion(from, to, congestionFactor) {
    const edgeKey = `${from}-${to}`;
    this.congestionMap.set(edgeKey, Math.max(0, Math.min(2, congestionFactor)));
  }

  /**
   * Get current hazard risk factor for a location
   * Risk increases exponentially as you approach hazard center
   * @param {Object} location - {lat, lon}
   * @returns {number} Risk factor (0 = safe, >1 = increasingly dangerous)
   */
  calculateHazardRisk(location) {
    let totalRisk = 0;

    for (const hazard of this.hazards.values()) {
      const distance = haversineDistance(
        { lat: location.lat, lon: location.lon },
        { lat: hazard.lat, lon: hazard.lon }
      );

      if (distance < hazard.radius) {
        // Inside hazard radius: exponential penalty
        const penetration = 1 - distance / hazard.radius;
        const risk = Math.exp(penetration * 2) - 1; // Exponential growth
        totalRisk += risk;
      } else if (distance < hazard.radius * 2) {
        // Near hazard: linear penalty
        const proximity = 1 - (distance - hazard.radius) / hazard.radius;
        const risk = proximity * 0.5;
        totalRisk += risk;
      }
    }

    return totalRisk;
  }

  /**
   * Calculate dynamic cost for an edge
   * w(u,v) = α*distance + β*congestion + γ*hazard_risk
   * @param {string} from - Source vertex ID
   * @param {string} to - Destination vertex ID
   * @param {Object} fromVertex - Vertex data including {lat, lon}
   * @param {Object} toVertex - Vertex data including {lat, lon}
   * @param {number} baseDistance - Base edge weight (Euclidean or Haversine)
   * @returns {number} Dynamic cost
   */
  calculateEdgeCost(from, to, fromVertex, toVertex, baseDistance) {
    const edgeKey = `${from}-${to}`;

    // Distance component
    const distanceCost = this.alpha * baseDistance;

    // Congestion component
    const congestionFactor = this.congestionMap.get(edgeKey) || 1.0;
    const congestionCost = this.beta * baseDistance * congestionFactor;

    // Hazard risk component (use midpoint of edge)
    const midpoint = {
      lat: (fromVertex.lat + toVertex.lat) / 2,
      lon: (fromVertex.lon + toVertex.lon) / 2,
    };
    const hazardRisk = this.calculateHazardRisk(midpoint);
    const hazardCost = this.gamma * baseDistance * hazardRisk;

    return distanceCost + congestionCost + hazardCost;
  }

  /**
   * Simulate hazard expansion over time
   * Call this periodically to expand active hazards
   */
  expandHazards() {
    for (const hazard of this.hazards.values()) {
      const elapsedSeconds = (Date.now() - hazard.createdAt) / 1000;
      const newRadius = hazard.radius + hazard.expandRate * elapsedSeconds;
      hazard.radius = Math.min(newRadius, this.hazardMaxRadius);
    }
  }

  /**
   * Get all current hazards
   * @returns {Array} Array of hazard objects
   */
  getAllHazards() {
    return Array.from(this.hazards.values());
  }

  /**
   * Get statistics about current hazards and congestion
   * @returns {Object} Stats
   */
  getStats() {
    return {
      activeHazards: this.hazards.size,
      congestionPoints: this.congestionMap.size,
      parameters: {
        alpha: this.alpha,
        beta: this.beta,
        gamma: this.gamma,
        expansionRate: this.hazardExpansionRate,
        maxRadius: this.hazardMaxRadius,
      },
    };
  }

  /**
   * Reset all costs (useful for testing or scenario resets)
   */
  reset() {
    this.hazards.clear();
    this.congestionMap.clear();
  }
}

export default DynamicCostEngine;
