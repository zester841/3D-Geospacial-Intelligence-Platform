'use client';
import { useState } from 'react';
import Button from './Button';

export default function SaveModal({ 
  currentName,
  onSave, 
  onCancel 
}) {
  const [newName, setNewName] = useState(currentName);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Save Model Version</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            New Version Name
          </label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="e.g., Office Building v2"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            onClick={() => onSave(newName)}
            disabled={!newName.trim()}
          >
            Save New Version
          </Button>
        </div>
      </div>
    </div>
  );
}