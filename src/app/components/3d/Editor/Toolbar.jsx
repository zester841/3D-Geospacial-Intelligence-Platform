'use client';
import { useState } from 'react';
import SaveModal from '../UI/SaveModel';

export default function Toolbar({ currentModel, pois }) {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const handleSave = async (versionName) => {
    try {
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelId: currentModel._id,
          pois,
          newName: versionName
        })
      });
      
      const data = await res.json();
      alert(`Saved as: ${data.name}`);
    } catch (error) {
      alert('Save failed: ' + error.message);
    }
  };

  return (
    <>
      <button 
        onClick={() => setShowSaveModal(true)}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Save with POIs
      </button>

      {showSaveModal && (
        <SaveModal
          currentName={`${currentModel?.name}(v${(currentModel?.version || 0) + 1})`}
          onSave={handleSave}
          onCancel={() => setShowSaveModal(false)}  
        />
      )}
    </>
  );
}