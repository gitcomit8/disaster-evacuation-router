import React from 'react';

const StatusBar = ({ connected, graphStats, hazardStats }) => {
  return (
    <div className="bg-gray-800 text-white px-4 py-3 flex justify-between items-center text-sm">
      <div className="flex gap-6">
        <div>
          <span className="mr-2">●</span>
          <span>{connected ? '✅ Connected' : '❌ Disconnected'}</span>
        </div>
        {graphStats && (
          <>
            <div>📍 Vertices: <span className="font-bold text-yellow-300">{graphStats.vertices || 0}</span></div>
            <div>🔗 Edges: <span className="font-bold text-yellow-300">{graphStats.edges || 0}</span></div>
          </>
        )}
      </div>
      {hazardStats && hazardStats > 0 && (
        <div className="text-orange-400 font-semibold">
          🔥 {hazardStats} Active Hazards
        </div>
      )}
    </div>
  );
};

export default StatusBar;
