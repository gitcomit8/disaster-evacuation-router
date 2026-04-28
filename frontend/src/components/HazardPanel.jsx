import React from 'react';

const HazardPanel = ({ hazards }) => {
  return (
    <div className="p-4 bg-white shadow-lg rounded-lg w-full max-w-md max-h-96 overflow-y-auto">
      <h2 className="text-lg font-bold mb-3 text-red-600">Active Hazards</h2>

      {hazards && hazards.length > 0 ? (
        <div className="space-y-2">
          {hazards.map((hazard) => (
            <div key={hazard.id} className="p-3 bg-red-50 border-l-4 border-red-500 rounded">
              <p className="font-semibold text-sm">{hazard.id}</p>
              <p className="text-xs text-gray-700">
                Type: <span className="capitalize font-medium">{hazard.type}</span>
              </p>
              <p className="text-xs text-gray-700">
                Radius: <span className="font-medium">{hazard.radius.toFixed(0)}m</span>
              </p>
              <p className="text-xs text-gray-700">
                Lat: {hazard.lat.toFixed(4)}, Lon: {hazard.lon.toFixed(4)}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">No active hazards</p>
      )}
    </div>
  );
};

export default HazardPanel;
