import React, { useEffect, useState } from 'react';
import MapComponent from './components/MapComponent';
import AlgorithmVisualizer from './components/AlgorithmVisualizer';
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
  const [algorithm, setAlgorithm] = useState('astar');
  const [visualizationMode, setVisualizationMode] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

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

  const handleRequestRoute = async () => {
    if (!selectedStart || !selectedEnd) {
      alert('Please select both start and end vertices');
      return;
    }

    setLoading(true);
    setIsRunning(true);
    
    try {
      const endpoint = algorithm === 'dijkstra' ? '/api/route/dijkstra' : '/api/route/astar';
      const response = await api.post(endpoint, {
        start: selectedStart.toUpperCase(),
        end: selectedEnd.toUpperCase(),
      });
      
      setRoute(response.data);
      
      // If visualization mode, show it
      if (visualizationMode) {
        setTimeout(() => setIsRunning(false), 3000);
      } else {
        setIsRunning(false);
      }
    } catch (error) {
      console.error('Route request failed:', error);
      alert('Failed to find route');
      setIsRunning(false);
    } finally {
      setLoading(false);
    }
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
          {visualizationMode ? (
            <AlgorithmVisualizer 
              hazards={hazards} 
              route={route} 
              graph={graph}
              isRunning={isRunning}
              algorithm={algorithm}
            />
          ) : (
            <MapComponent hazards={hazards} route={route} graph={graph} />
          )}
        </div>

        {/* Panels */}
        <div className="w-96 flex flex-col gap-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h3 className="font-semibold mb-3 text-gray-700">Display Mode</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  checked={!visualizationMode} 
                  onChange={() => setVisualizationMode(false)}
                  className="w-4 h-4"
                />
                <span className="text-sm">Normal Map</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  checked={visualizationMode} 
                  onChange={() => setVisualizationMode(true)}
                  className="w-4 h-4"
                />
                <span className="text-sm">Algorithm Visualization</span>
              </label>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-4">
            <h3 className="font-semibold mb-3 text-gray-700">Algorithm</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  checked={algorithm === 'dijkstra'} 
                  onChange={() => setAlgorithm('dijkstra')}
                  className="w-4 h-4"
                />
                <span className="text-sm">Dijkstra (Shortest Path)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  checked={algorithm === 'astar'} 
                  onChange={() => setAlgorithm('astar')}
                  className="w-4 h-4"
                />
                <span className="text-sm">A* (Optimized)</span>
              </label>
            </div>
          </div>

          <RoutePanel
            route={route}
            selectedStart={selectedStart}
            selectedEnd={selectedEnd}
            onSelectVertex={handleSelectVertex}
            onRequestRoute={handleRequestRoute}
            loading={loading}
          />
          <HazardPanel hazards={hazards} />
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-lg font-semibold text-gray-700">Computing route...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
