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
            <div>Vertices: {graphStats.vertexCount || 0}</div>
            <div>Edges: {graphStats.edgeCount || 0}</div>
          </>
        )}
      </div>
      {hazardStats && (
        <div className="text-orange-400 font-semibold">
          🔥 {hazardStats} Active Hazards
        </div>
      )}
    </div>
  );
};

export default StatusBar;
