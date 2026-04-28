import React, { useEffect, useState } from 'react';
import MapComponent from './components/MapComponent';
import RoutePanel from './components/RoutePanel';
import HazardPanel from './components/HazardPanel';
import StatusBar from './components/StatusBar';
import websocket from './services/websocket';
import api from './services/api';

function App() {
  const [graph, setGraph] = useState([]);
  const [hazards, setHazards] = useState([]);
  const [route, setRoute] = useState(null);
  const [connected, setConnected] = useState(false);
  const [graphStats, setGraphStats] = useState(null);
  const [selectedStart, setSelectedStart] = useState('A');
  const [selectedEnd, setSelectedEnd] = useState('D');
  const [loading, setLoading] = useState(false);

  // Initialize WebSocket and fetch initial data
  useEffect(() => {
    // Connect WebSocket
    websocket.connect();

    // Setup event listeners
    websocket.on('connected', () => {
      setConnected(true);
      console.log('Connected to server');
    });

    websocket.on('disconnected', () => {
      setConnected(false);
    });

    websocket.on('state', (data) => {
      if (data.graph) setGraph(data.graph);
      if (data.hazards) setHazards(data.hazards);
    });

    websocket.on('hazard-added', (hazard) => {
      setHazards((prev) => [...prev, hazard]);
    });

    websocket.on('hazard-removed', (data) => {
      setHazards((prev) => prev.filter((h) => h.id !== data.id));
    });

    websocket.on('hazard-updated', (hazard) => {
      setHazards((prev) =>
        prev.map((h) => (h.id === hazard.id ? hazard : h))
      );
    });

    websocket.on('route-result', (result) => {
      setRoute(result);
      setLoading(false);
    });

    websocket.on('route-error', (error) => {
      console.error('Route error:', error);
      setLoading(false);
    });

    // Fetch initial graph data
    const fetchGraphData = async () => {
      try {
        const response = await api.getGraph();
        setGraph(response.data.vertices || []);
        setGraphStats(response.data.stats);
      } catch (error) {
        console.error('Failed to fetch graph:', error);
      }
    };

    fetchGraphData();

    return () => {
      websocket.disconnect();
    };
  }, []);

  const handleSelectVertex = (position, value) => {
    if (position === 'start') {
      setSelectedStart(value.toUpperCase());
    } else {
      setSelectedEnd(value.toUpperCase());
    }
  };

  const handleRequestRoute = () => {
    if (!selectedStart || !selectedEnd) {
      alert('Please select both start and end vertices');
      return;
    }

    setLoading(true);
    websocket.requestRoute(selectedStart, selectedEnd, 'astar');
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-100">
      <StatusBar
        connected={connected}
        graphStats={graphStats}
        hazardStats={hazards.length}
      />

      <div className="flex flex-1 overflow-hidden gap-4 p-4">
        {/* Map area */}
        <div className="flex-1 bg-white rounded-lg shadow-lg overflow-hidden">
          <MapComponent hazards={hazards} route={route} graph={graph} />
        </div>

        {/* Panels */}
        <div className="w-96 flex flex-col gap-4 overflow-y-auto">
          <RoutePanel
            route={route}
            selectedStart={selectedStart}
            selectedEnd={selectedEnd}
            onSelectVertex={handleSelectVertex}
            onRequestRoute={handleRequestRoute}
          />
          <HazardPanel hazards={hazards} />
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <p className="text-lg font-semibold">Computing route...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
