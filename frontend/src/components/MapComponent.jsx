import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MapComponent = ({ hazards, route, graph }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef(new Map());
  const hazardCirclesRef = useRef(new Map());
  const routePolylineRef = useRef(null);
  const [markerMode, setMarkerMode] = useState(null); // 'vertex', 'hazard', or null

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map if not already done
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView([40.7128, -74.006], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapInstance.current);

      // Add click handler for placing markers
      mapInstance.current.on('click', (e) => {
        if (markerMode === 'vertex') {
          const vertexId = prompt('Enter vertex ID (e.g., A, B, C):')?.toUpperCase();
          const isSafeZone = confirm('Is this a safe zone? (OK=Yes, Cancel=No)');
          if (vertexId) {
            console.log(`Vertex ${vertexId} at ${e.latlng.lat}, ${e.latlng.lng}`, { isSafeZone });
          }
        } else if (markerMode === 'hazard') {
          const hazardId = prompt('Enter hazard ID:');
          if (hazardId) {
            console.log(`Hazard ${hazardId} at ${e.latlng.lat}, ${e.latlng.lng}`);
          }
        }
      });
    }

    const map = mapInstance.current;

    // Render vertices with enhanced styling
    if (graph && graph.length > 0) {
      graph.forEach((vertex) => {
        const markerKey = vertex.id;
        const isSafeZone = vertex.type === 'safe_zone';

        if (!markersRef.current.has(markerKey)) {
          const html = `
            <div style="
              width: 32px;
              height: 32px;
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
              cursor: pointer;
            ">
              ${vertex.id}
            </div>
          `;

          const icon = L.divIcon({
            html,
            iconSize: [32, 32],
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

      // Remove deleted vertices
      for (const [key, marker] of markersRef.current.entries()) {
        if (!graph.find((v) => v.id === key)) {
          map.removeLayer(marker);
          markersRef.current.delete(key);
        }
      }
    }

    // Render hazards with better styling
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
            className: 'hazard-circle',
          })
            .bindPopup(`
              <strong style="font-size: 14px;">🔥 ${hazard.id}</strong><br>
              Radius: ${(hazard.radius || 500).toFixed(0)}m<br>
              Status: Active
            `)
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

    // Draw route with better styling
    if (route && route.path && route.path.length > 0) {
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
          className: 'route-line',
        }).addTo(map);

        map.fitBounds(L.latLngBounds(routeCoords), { padding: [50, 50] });
      }
    }
  }, [hazards, route, graph, markerMode]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 z-10">
        <div className="text-sm font-semibold text-gray-700 mb-2">Map Tools</div>
        <button
          onClick={() => setMarkerMode(markerMode === 'vertex' ? null : 'vertex')}
          className={`block w-full text-left px-3 py-2 rounded mb-2 text-sm ${
            markerMode === 'vertex' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          📍 Add Vertex
        </button>
        <button
          onClick={() => setMarkerMode(markerMode === 'hazard' ? null : 'hazard')}
          className={`block w-full text-left px-3 py-2 rounded text-sm ${
            markerMode === 'hazard' ? 'bg-red-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          🔥 Add Hazard
        </button>
      </div>
    </div>
  );
};

export default MapComponent;
