/**
 * Hazard Simulation Engine
 * Simulates real-time hazard creation, propagation, and updates
 */

class HazardSimulator {
  constructor(config = {}) {
    this.spawnInterval = parseInt(
      config.spawnInterval || process.env.HAZARD_SPAWN_INTERVAL || 5000
    );
    this.expansionRate = parseFloat(
      config.expansionRate || process.env.HAZARD_EXPANSION_RATE || 0.1
    );
    this.maxRadius = parseFloat(
      config.maxRadius || process.env.HAZARD_MAX_RADIUS || 500
    );

    this.hazards = new Map();
    this.simulationRunning = false;
    this.spawnTimer = null;
    this.expansionTimer = null;
    this.nextHazardId = 1;

    // Callback for when hazards change
    this.onHazardAdded = null;
    this.onHazardRemoved = null;
    this.onHazardUpdated = null;
  }

  /**
   * Set callback for when a hazard is added
   * @param {Function} callback - (hazardId, hazardData) => void
   */
  onAdd(callback) {
    this.onHazardAdded = callback;
  }

  /**
   * Set callback for when a hazard is removed
   * @param {Function} callback - (hazardId) => void
   */
  onRemove(callback) {
    this.onHazardRemoved = callback;
  }

  /**
   * Set callback for when a hazard is updated
   * @param {Function} callback - (hazardId, hazardData) => void
   */
  onUpdate(callback) {
    this.onHazardUpdated = callback;
  }

  /**
   * Start the simulation
   */
  start() {
    if (this.simulationRunning) return;
    this.simulationRunning = true;

    // Spawn new hazards periodically
    this.spawnTimer = setInterval(() => {
      this.spawnRandomHazard();
    }, this.spawnInterval);

    // Expand existing hazards periodically
    this.expansionTimer = setInterval(() => {
      this.updateHazardRadii();
    }, 500); // Update every 500ms for smooth expansion
  }

  /**
   * Stop the simulation
   */
  stop() {
    this.simulationRunning = false;
    if (this.spawnTimer) clearInterval(this.spawnTimer);
    if (this.expansionTimer) clearInterval(this.expansionTimer);
  }

  /**
   * Spawn a random hazard at a random location
   * Used for testing/simulation purposes
   */
  spawnRandomHazard() {
    // Generate random coordinates (within NYC bounds for this example)
    const lat = 40.7 + (Math.random() - 0.5) * 0.1; // ~40.65 to 40.75
    const lon = -74.0 + (Math.random() - 0.5) * 0.1; // ~-74.05 to -73.95
    const hazardTypes = ['fire', 'flood', 'debris', 'collapse'];
    const type = hazardTypes[Math.floor(Math.random() * hazardTypes.length)];

    return this.addHazard({
      lat,
      lon,
      radius: 50 + Math.random() * 100,
      type,
    });
  }

  /**
   * Manually add a hazard
   * @param {Object} hazardData - {lat, lon, radius, type}
   * @returns {string} Hazard ID
   */
  addHazard(hazardData) {
    const hazardId = `hazard_${this.nextHazardId++}`;
    const hazard = {
      id: hazardId,
      lat: hazardData.lat,
      lon: hazardData.lon,
      radius: Math.min(hazardData.radius || 100, this.maxRadius),
      type: hazardData.type || 'unknown',
      createdAt: Date.now(),
      timeAlive: 0,
    };

    this.hazards.set(hazardId, hazard);

    if (this.onHazardAdded) {
      this.onHazardAdded(hazardId, hazard);
    }

    return hazardId;
  }

  /**
   * Remove a hazard
   * @param {string} hazardId - Hazard ID
   */
  removeHazard(hazardId) {
    this.hazards.delete(hazardId);

    if (this.onHazardRemoved) {
      this.onHazardRemoved(hazardId);
    }
  }

  /**
   * Update hazard radii as they expand
   * Called periodically during simulation
   */
  updateHazardRadii() {
    for (const [hazardId, hazard] of this.hazards.entries()) {
      const elapsedSeconds = (Date.now() - hazard.createdAt) / 1000;
      const newRadius = hazard.radius + this.expansionRate * elapsedSeconds;

      if (newRadius > this.maxRadius) {
        // Hazard has reached max size, remove it
        this.removeHazard(hazardId);
      } else {
        hazard.radius = newRadius;
        hazard.timeAlive = elapsedSeconds;

        if (this.onHazardUpdated) {
          this.onHazardUpdated(hazardId, hazard);
        }
      }
    }
  }

  /**
   * Move a hazard to a new location
   * @param {string} hazardId - Hazard ID
   * @param {number} lat - New latitude
   * @param {number} lon - New longitude
   */
  moveHazard(hazardId, lat, lon) {
    const hazard = this.hazards.get(hazardId);
    if (hazard) {
      hazard.lat = lat;
      hazard.lon = lon;

      if (this.onHazardUpdated) {
        this.onHazardUpdated(hazardId, hazard);
      }
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
   * Get a specific hazard
   * @param {string} hazardId - Hazard ID
   * @returns {Object|null} Hazard object or null
   */
  getHazard(hazardId) {
    return this.hazards.get(hazardId) || null;
  }

  /**
   * Clear all hazards
   */
  clearAll() {
    this.hazards.clear();
  }

  /**
   * Get simulation statistics
   * @returns {Object} Stats
   */
  getStats() {
    return {
      running: this.simulationRunning,
      activeHazards: this.hazards.size,
      nextHazardId: this.nextHazardId,
      config: {
        spawnInterval: this.spawnInterval,
        expansionRate: this.expansionRate,
        maxRadius: this.maxRadius,
      },
    };
  }
}

export default HazardSimulator;
