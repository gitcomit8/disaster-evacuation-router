import React from 'react';

const RoutePanel = ({ route, selectedStart, selectedEnd, onSelectVertex, onRequestRoute, loading }) => {
  return (
    <div className="p-4 bg-white shadow-lg rounded-lg w-full">
      <h2 className="text-lg font-bold mb-4 text-gray-800">🗺️ Route Planner</h2>

      <div className="space-y-4">
        {/* Start vertex selector */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">📍 Start Location</label>
          <input
            type="text"
            placeholder="Enter start vertex ID"
            value={selectedStart}
            onChange={(e) => onSelectVertex('start', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* End vertex selector */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">🏁 Destination (Safe Zone)</label>
          <input
            type="text"
            placeholder="Enter destination vertex ID"
            value={selectedEnd}
            onChange={(e) => onSelectVertex('end', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Find route button */}
        <button
          onClick={onRequestRoute}
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          {loading ? 'Computing...' : 'Find Route'}
        </button>

        {/* Route result display */}
        {route && route.found && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <h3 className="font-semibold text-green-800 mb-2">✅ Route Found!</h3>
            <div className="space-y-1 text-sm text-gray-700">
              <p><strong>Path:</strong> {route.path.join(' → ')}</p>
              <p><strong>Distance:</strong> {route.distance.toFixed(0)} meters</p>
              <p><strong>Nodes Explored:</strong> {route.nodesExpanded}</p>
            </div>
          </div>
        )}

        {route && !route.found && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800 font-medium">❌ No route found between selected vertices.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoutePanel;
