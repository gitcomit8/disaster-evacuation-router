import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

const AlgorithmVisualizer = ({ hazards, route, graph, isRunning, algorithm = 'astar' }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef(new Map());
  const hazardCirclesRef = useRef(new Map());
  const routePolylineRef = useRef(null);
  const explorationCirclesRef = useRef(new Map());
  const [animationStep, setAnimationStep] = useState(0);
  const [showExploration, setShowExploration] = useState(false);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map if not already done
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView([40.7128, -74.006], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapInstance.current);
    }

    const map = mapInstance.current;

    // Clear previous exploration visualization
    for (const circle of explorationCirclesRef.current.values()) {
      map.removeLayer(circle);
    }
    explorationCirclesRef.current.clear();

    // Render vertices
    if (graph && graph.length > 0) {
      graph.forEach((vertex) => {
        const markerKey = vertex.id;
        const isSafeZone = vertex.type === 'safe_zone';

        if (!markersRef.current.has(markerKey)) {
          const html = `
            <div style="
              width: 36px;
              height: 36px;
              border-radius: 50%;
              background: ${isSafeZone ? '#22c55e' : '#3b82f6'};
              border: 3px solid white;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 14px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              transition: all 0.3s ease;
            ">
              ${vertex.id}
            </div>
          `;

          const icon = L.divIcon({
            html,
            iconSize: [36, 36],
            className: 'vertex-marker',
          });

          const marker = L.marker([vertex.lat, vertex.lon], { icon })
            .bindPopup(`
              <strong style="font-size: 16px;">${vertex.id}</strong><br>
              Type: ${isSafeZone ? '🟢 Safe Zone' : '🔵 Intersection'}<br>
              Lat: ${vertex.lat.toFixed(4)}<br>
              Lon: ${vertex.lon.toFixed(4)}
            `)
            .addTo(map);

          markersRef.current.set(markerKey, marker);
        }
      });
    }

    // Render hazards
    if (hazards && hazards.length > 0) {
      hazards.forEach((hazard) => {
        const hazardKey = hazard.id;

        if (!hazardCirclesRef.current.has(hazardKey)) {
          const circle = L.circle([hazard.lat, hazard.lon], {
            color: '#dc2626',
            fillColor: '#ef4444',
            fillOpacity: 0.3,
            radius: hazard.radius || 500,
            weight: 2,
          })
            .bindPopup(`<strong>🔥 ${hazard.id}</strong><br>Radius: ${(hazard.radius || 500).toFixed(0)}m`)
            .addTo(map);

          hazardCirclesRef.current.set(hazardKey, circle);
        } else {
          const circle = hazardCirclesRef.current.get(hazardKey);
          circle.setRadius(hazard.radius || 500);
          circle.setLatLng([hazard.lat, hazard.lon]);
        }
      });

      // Remove deleted hazards
      for (const [key, circle] of hazardCirclesRef.current.entries()) {
        if (!hazards.find((h) => h.id === key)) {
          map.removeLayer(circle);
          hazardCirclesRef.current.delete(key);
        }
      }
    }

    // Animate route drawing
    if (route && route.found && showExploration) {
      setTimeout(() => {
        const routeCoords = route.path
          .map((vertexId) => {
            const vertex = graph.find((v) => v.id === vertexId);
            return vertex ? [vertex.lat, vertex.lon] : null;
          })
          .filter(Boolean);

        if (routeCoords.length > 0) {
          if (routePolylineRef.current) {
            map.removeLayer(routePolylineRef.current);
          }

          // Flash effect: multiple colored lines
          const colors = ['#fbbf24', '#8b5cf6', '#ec4899'];
          colors.forEach((color, index) => {
            setTimeout(() => {
              const polyline = L.polyline(routeCoords, {
                color,
                weight: 5,
                opacity: 0.8,
                dashArray: '5, 5',
              }).addTo(map);

              if (index === colors.length - 1) {
                setTimeout(() => {
                  map.removeLayer(polyline);
                  // Final solid line
                  routePolylineRef.current = L.polyline(routeCoords, {
                    color: '#8b5cf6',
                    weight: 4,
                    opacity: 0.9,
                  }).addTo(map);

                  map.fitBounds(L.latLngBounds(routeCoords), { padding: [50, 50] });
                }, 200);
              } else {
                setTimeout(() => {
                  map.removeLayer(polyline);
                }, 200);
              }
            }, index * 150);
          });
        }
      }, 500);
    } else if (route && route.found) {
      const routeCoords = route.path
        .map((vertexId) => {
          const vertex = graph.find((v) => v.id === vertexId);
          return vertex ? [vertex.lat, vertex.lon] : null;
        })
        .filter(Boolean);

      if (routeCoords.length > 0) {
        if (routePolylineRef.current) {
          map.removeLayer(routePolylineRef.current);
        }

        routePolylineRef.current = L.polyline(routeCoords, {
          color: '#8b5cf6',
          weight: 4,
          opacity: 0.9,
          dashArray: '5, 5',
        }).addTo(map);

        map.fitBounds(L.latLngBounds(routeCoords), { padding: [50, 50] });
      }
    }
  }, [hazards, route, graph, animationStep, showExploration]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
      
      {/* Visualization Controls */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 z-10 max-w-xs">
        <div className="text-sm font-semibold text-gray-700 mb-3">
          🎬 {algorithm.toUpperCase()} Visualization
        </div>
        
        {route && route.found && (
          <div className="space-y-3">
            <button
              onClick={() => setShowExploration(!showExploration)}
              className={`w-full px-4 py-2 rounded text-sm font-medium transition ${
                showExploration 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {showExploration ? '⏸ Hide Animation' : '▶ Show Animation'}
            </button>

            <div className="bg-green-50 border border-green-200 rounded p-3">
              <div className="text-xs font-semibold text-green-800 mb-2">✅ Path Found</div>
              <div className="text-xs text-gray-700 space-y-1">
                <p><strong>Route:</strong> {route.path.join(' → ')}</p>
                <p><strong>Distance:</strong> {route.distance.toFixed(0)}m</p>
                <p><strong>Nodes Explored:</strong> {route.nodesExpanded}</p>
              </div>
            </div>
          </div>
        )}

        {route && !route.found && (
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <p className="text-xs text-red-800">❌ No path found</p>
          </div>
        )}

        {!route && (
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <p className="text-xs text-blue-800">💡 Request a route to visualize</p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 z-10 text-xs">
        <div className="font-semibold text-gray-700 mb-2">Legend</div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full border border-white"></div>
            <span>Intersection</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full border border-white"></div>
            <span>Safe Zone</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 opacity-50"></div>
            <span>Hazard Zone</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1 w-6 bg-purple-500" style={{backgroundImage: 'linear-gradient(90deg, #8b5cf6 25%, transparent 25%)', backgroundSize: '10px 100%'}}></div>
            <span>Optimal Path</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlgorithmVisualizer;
