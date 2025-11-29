"use client"
import { useState, useEffect } from 'react';
import Sidebar2 from '../components/3d/Editor/Sidebar2';
import EditorScene from '../components/3d/Editor/EditorScene';
import Toolbar from '../components/3d/Editor/Toolbar';

export default function ThreeDPage() {
  // State management
  const [currentModel, setCurrentModel] = useState(null);
  const [pois, setPois] = useState([]);
  const [selectedPOI, setSelectedPOI] = useState(null);
  const [models, setModels] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [transformMode, setTransformMode] = useState('translate');

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        const [modelsRes, categoriesRes] = await Promise.all([
          fetch('/api/models'),
          fetch('/api/categories')
        ]);

        const [modelsData, categoriesData] = await Promise.all([
          modelsRes.json(),
          categoriesRes.json()
        ]);

        setModels(modelsData);
        setCategories(categoriesData);

        // Load last used model if available
        const lastModelId = localStorage.getItem('lastModelId');
        if (lastModelId) {
          const lastModel = modelsData.find(m => m._id === lastModelId);
          if (lastModel) setCurrentModel(lastModel);
        }
      } catch (error) {
        console.error('Failed to load initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Load POIs when model changes
  useEffect(() => {
    if (!currentModel) {
      setPois([]);
      return;
    }

    const loadPOIs = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/pois?modelId=${currentModel._id}`);
        const data = await response.json();
        setPois(data);

        // Store last used model
        localStorage.setItem('lastModelId', currentModel._id);
      } catch (error) {
        console.error('Failed to load POIs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPOIs();
  }, [currentModel]);
  const handleUploadModel = async (file, name, category, tags) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('data', JSON.stringify({ name, category, tags }));

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const newModel = await response.json();
      setModels([...models, newModel]);
      setCurrentModel(newModel);
      return newModel;
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  };


  const handleSelectModel = (model) => {
    setCurrentModel(model);
    setSelectedPOI(null);
  };

  // POI handlers
  const handleAddPOI = async (poiData) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/pois', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...poiData,
          modelId: currentModel._id,
        }),
      });
      const newPOI = await response.json();
      setPois([...pois, newPOI]);
    } catch (error) {
      console.error('Failed to add POI:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePOI = async (poiData) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/pois', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(poiData),
      });
      const updatedPOI = await response.json();
      setPois(pois.map((poi) => (poi._id === updatedPOI._id ? updatedPOI : poi)));
      alert("POI updated Successfully");
    } catch (error) {
      console.error('Failed to update POI:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePOI = async (poiId) => {
    try {
      setIsLoading(true);
      await fetch(`/api/pois?id=${poiId}`, {
        method: 'DELETE',
      });
      setPois(pois.filter((poi) => poi._id !== poiId));
      if (selectedPOI?._id === poiId) setSelectedPOI(null);
    } catch (error) {
      console.error('Failed to delete POI:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Category handlers
  const handleAddCategory = async (name) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });
      const newCategory = await response.json();
      setCategories([...categories, newCategory]);
      return newCategory;
    } catch (error) {
      console.error('Failed to add category:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Save scene handler
  const handleSaveScene = async () => {
    try {
      setIsLoading(true);
      // In this implementation, changes are saved immediately
      // This is just a notification
      alert('All changes have been saved automatically!');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !currentModel) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading Astrikos Platform...</h1>
          <p>Please wait while we load your 3D models and data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 flex flex-col h-screen bg-gray-50">
      {/* <Toolbar
        onSave={handleSaveScene}
        pois={pois}
        transformMode={transformMode}
        onTransformModeChange={setTransformMode}
        currentModel={currentModel}
      /> */}

      <div className="flex flex-1 overflow-hidden">
        <Sidebar2
          models={models}
          categories={categories}
          pois={pois}
          onSelectPOI={setSelectedPOI}
          selectedPOI={selectedPOI}
          onModelUpload={handleUploadModel}
          onModelSelect={handleSelectModel}
          onAddCategory={handleAddCategory}
          currentModel={currentModel}
          isLoading={isLoading}
        />

        {currentModel ? (
          <EditorScene
            modelUrl={currentModel.path}
            pois={pois}
            onAddPOI={handleAddPOI}
            onUpdatePOI={handleUpdatePOI}
            onDeletePOI={handleDeletePOI}
            transformMode={transformMode}
            isLoading={isLoading}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-100">
            <div className="text-center p-6 max-w-md">
              <h2 className="text-xl font-semibold mb-2">No Model Loaded</h2>
              <p className="text-gray-600 mb-4">
                Select a model from the library or upload a new one to start adding Points of Interest.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}