'use client';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import POIMarker from './POIMarker';
import { useRef, useState } from 'react';
import Button from '../UI/Button';
import { FiUpload, FiRefreshCw, FiAlertCircle, FiTrash2, FiPlus } from 'react-icons/fi';

const Model = ({ url, onModelClick, onPOIClick, selectedPOI, pois, modelName }) => {
  const group = useRef();
  const { scene } = useGLTF(url || '');
  const { camera } = useThree();
  const [models, setModels] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showUploadModal, setShowUploadModal] = useState(false);

    const [newModel, setNewModel] = useState({
        name: '',
        category: '',
        tags: '',
        file: null
    });
    const handleUpload = async () => {
      try {
          if (!newModel.file || !newModel.name || !newModel.category) {
              throw new Error('Name, file and category are required');
          }

          const formData = new FormData();
          formData.append('file', newModel.file);
          formData.append('name', newModel.name);
          formData.append('category', newModel.category);
          formData.append('tags', newModel.tags);

          const response = await fetch('/api/upload', {
              method: 'POST',
              body: formData
          });

          if (!response.ok) throw new Error('Upload failed');

          const uploadedModel = await response.json();
          setModels([...models, uploadedModel]);
          onModelSelect(uploadedModel);

          setShowUploadModal(false);
          setNewModel({ name: '', category: '', tags: '', file: null });

      } catch (err) {
          console.error('Upload error:', err);
          setError(err.message);
      }
  };

  const handleDelete = async (modelId) => {
      try {
          const confirmed = window.confirm("Are you sure you want to delete this model?");
          if (!confirmed) return;

          const res = await fetch(`/api/models/${modelId}`, {
              method: 'DELETE',
          });

          if (!res.ok) throw new Error("Failed to delete model");
          alert("Model Deleted Successfully...");
          setModels(models.filter((m) => m._id !== modelId));
          if (currentModel && currentModel._id === modelId) {
              onModelSelect(null);
          }
      } catch (err) {
          console.error("Delete error:", err);
          setError(err.message);
      }
  };

  const handleClick = (e) => {
    e.stopPropagation();

    const poiIntersect = e.intersections.find(i => i.object.userData?.isPOI);
    if (poiIntersect) {
      onPOIClick(poiIntersect.object.userData.poi);
      return;
    }

    if (e.point) {
      onModelClick(e.point);
    }
  };

  return (
    <group ref={group} onClick={handleClick}>
      <primitive object={scene} />
      {pois.map((poi) => (
        <POIMarker
          key={poi._id}
          position={[
            poi.position?.x || 0,
            poi.position?.y || 0,
            poi.position?.z || 0,
          ]}
          isSelected={selectedPOI?._id === poi._id}
          userData={{ poi, isPOI: true }}
          onClick={() => onPOIClick(poi)}
        />
      ))}
    </group>
  );
};

const RotatingGroup = ({ children, rotate }) => {
  const groupRef = useRef();
  const angle = useRef(0);

  useFrame(() => {
    if (rotate && groupRef.current) {
      angle.current += 0.001;
      groupRef.current.rotation.y = angle.current;
    }
  });

  return <group ref={groupRef}>{children}</group>;
};

const ModelViewer = ({ modelUrl, pois, onModelClick, onPOIClick, selectedPOI }) => {
  const [rotate, setRotate] = useState(false);

  if (!modelUrl) {
    return <p className="text-red-600">Error: Model URL not provided</p>;
  }

  return (
    <div className="relative w-full h-screen z-10">
      <button
        onClick={() => setRotate(prev => !prev)}
        className="absolute z-10 bottom-5 right-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 shadow-md"
      >
        {rotate ? 'Stop Rotation' : 'Start Rotation'}
      </button>

      <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <pointLight position={[0, 10, 0]} intensity={0.5} />

        <OrbitControls enablePan enableZoom enableRotate />

        <RotatingGroup rotate={rotate}>
          <gridHelper args={[20, 20, 0x888888, 0x444444]} position={[0, -0.8, 0]} />
          <Model
            url={modelUrl}
            onModelClick={onModelClick}
            pois={pois}
            onPOIClick={onPOIClick}
            selectedPOI={selectedPOI}
          />
        </RotatingGroup>
      </Canvas>
    </div>
  );
};

export default ModelViewer;
