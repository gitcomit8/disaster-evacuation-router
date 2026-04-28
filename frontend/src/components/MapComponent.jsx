import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MapComponent = ({ hazards, route, graph }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef(new Map());
  const hazardCirclesRef = useRef(new Map());
  const routePolylineRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView([40.7128, -74.006], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(mapInstance.current);
    }

    const map = mapInstance.current;

    // Add vertices
    if (graph && graph.length > 0) {
      graph.forEach((vertex) => {
        const markerColor = vertex.type === 'safe_zone' ? 'green' : 'blue';
        const markerKey = vertex.id;

        if (!markersRef.current.has(markerKey)) {
          const icon = L.divIcon({
            className: `marker-${markerColor}`,
            html: `<div style="background: ${markerColor}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
            iconSize: [16, 16],
          });

          const marker = L.marker([vertex.lat, vertex.lon], { icon })
            .bindPopup(`<strong>${vertex.id}</strong><br>${vertex.type}`)
            .addTo(map);

          markersRef.current.set(markerKey, marker);
        }
      });
    }

    // Update hazards
    if (hazards && hazards.length > 0) {
      hazards.forEach((hazard) => {
        const hazardKey = hazard.id;

        if (!hazardCirclesRef.current.has(hazardKey)) {
          const circle = L.circle([hazard.lat, hazard.lon], {
            color: 'red',
            fillColor: 'red',
            fillOpacity: 0.4,
            radius: hazard.radius,
            weight: 2,
          })
            .bindPopup(`<strong>${hazard.id}</strong><br>Radius: ${hazard.radius.toFixed(0)}m`)
            .addTo(map);

          hazardCirclesRef.current.set(hazardKey, circle);
        } else {
          const circle = hazardCirclesRef.current.get(hazardKey);
          circle.setRadius(hazard.radius);
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

    // Draw route
    if (route && route.path && route.path.length > 0) {
      const routeCoords = route.path
        .map((vertexId) => {
          const vertex = graph.find((v) => v.id === vertexId);
          return vertex ? [vertex.lat, vertex.lon] : null;
        })
        .filter(Boolean);

      if (routePolylineRef.current) {
        map.removeLayer(routePolylineRef.current);
      }

      routePolylineRef.current = L.polyline(routeCoords, {
        color: 'blue',
        weight: 3,
        opacity: 0.8,
      }).addTo(map);

      map.fitBounds(L.latLngBounds(routeCoords));
    }
  }, [hazards, route, graph]);

  return <div ref={mapRef} style={{ height: '100%', width: '100%' }} />;
};

export default MapComponent;
