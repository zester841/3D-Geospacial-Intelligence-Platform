'use client';
import { useState } from 'react';
import ModelViewer from '../ThreeD/ModelViewer';
import POIInfoModal from './POIInfoModal';
import POIForm from './POIForm';

const EditorScene = ({ modelUrl, pois, onAddPOI, onUpdatePOI, onDeletePOI }) => {
  const [selectedPOI, setSelectedPOI] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newPOIPosition, setNewPOIPosition] = useState(null);

  const handleModelClick = (position) => {
    setSelectedPOI(null);
    setNewPOIPosition(position);
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handlePOIClick = (poi) => {
    setSelectedPOI(poi);
    setIsEditing(false);
    setIsFormOpen(true);
  };

  const handleSavePOI = (poiData) => {
    if (selectedPOI && isEditing) {
      // Editing an existing POI
      onUpdatePOI({ ...selectedPOI, ...poiData });
    } else if (!selectedPOI) {
      // Adding a new POI
      onAddPOI({ ...poiData, position: newPOIPosition });
    }
    setIsFormOpen(false);
    setSelectedPOI(null);
    setIsEditing(false);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setSelectedPOI(null);
    setIsEditing(false);
  };

  return (
    <div className="flex-1 h-full relative">
      <ModelViewer
        modelUrl={modelUrl}
        pois={pois}
        onModelClick={handleModelClick}
        onPOIClick={handlePOIClick}
        selectedPOI={selectedPOI}
     
      />

      {isFormOpen && (
        <div className="absolute top-4 right-4 bg-gray-800 p-2 rounded-lg shadow-lg z-10 w-64">
          {selectedPOI && !isEditing ? (
            <POIInfoModal
              poi={selectedPOI}
              onClose={handleCancel}
              onEdit={handleEditClick}
              onDelete={() => {
                onDeletePOI(selectedPOI._id);
                handleCancel();
              }}
            />
          ) : (
            <POIForm
              initialData={selectedPOI ? { ...selectedPOI, position: selectedPOI.position } : { position: newPOIPosition }}
              onSave={handleSavePOI}
              onDelete={selectedPOI ? () => {
                onDeletePOI(selectedPOI._id);
                handleCancel();
              } : null}
              onCancel={handleCancel}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default EditorScene;
