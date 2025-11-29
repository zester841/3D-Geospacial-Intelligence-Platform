'use client';
import { useState } from 'react';
import Button from '../UI/Button';

const POIList = ({ pois, onSelectPOI, selectedPOI }) => {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-lg">POIs</h3>
      {pois.length === 0 ? (
        <p className="text-sm text-gray-500">No POIs added yet. Click on the model to add one.</p>
      ) : (
        <ul className="space-y-1">
          {pois.map((poi) => (
            <li
              key={poi._id || poi.id}
              className={`p-2 rounded cursor-pointer ${
                selectedPOI?.id === poi.id ? 'bg-blue-100' : 'hover:bg-gray-100'
              }`}
              onClick={() => onSelectPOI(poi)}
            >
              <div className="font-medium">{poi.name}</div>
              <div className="text-sm text-gray-500">{poi.type}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default POIList;