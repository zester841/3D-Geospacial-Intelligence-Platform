'use client';
import { useState, useEffect } from 'react';
import { FiUpload, FiRefreshCw, FiAlertCircle, FiTrash2, FiPlus } from 'react-icons/fi';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import { useRouter } from 'next/navigation';

export default function Sidebar({ currentModel, onModelSelect, onModelUpload }) {
    const router = useRouter();
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

    const defaultCategories = [
        { name: '🏗 Architecture' },
        { name: '🚗 Vehicles' },
        { name: '👤 Characters' },
        { name: '🌄 Environment' },
        { name: '⚙️ Mechanical / Industrial' },
        { name: '🧱 Modular Kits' }
    ];

    const ensureCategoriesExist = async () => {
        const res = await fetch('/api/categories');
        let data = await res.json();

        if (data.length === 0) {
            await Promise.all(
                defaultCategories.map(cat =>
                    fetch('/api/categories', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(cat)
                    })
                )
            );

            const seededRes = await fetch('/api/categories');
            data = await seededRes.json();
        }

        return data;
    };

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [modelsRes, categoriesData] = await Promise.all([
                fetch('/api/models'),
                ensureCategoriesExist()
            ]);

            if (!modelsRes.ok) throw new Error('Failed to fetch models');

            const modelsData = await modelsRes.json();
            setModels(modelsData);
            setCategories(categoriesData);
        } catch (err) {
            console.error('Load error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

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

    useEffect(() => {
        loadData();
    }, []);

    return (
        <>
        <div className="text-white w-[100%] bg-transparent border-r border-gray-900 flex flex-col ">
            {/* Top Buttons */}
            <div className="p-4 border-b  border-gray-900 flex justify-between">
                <h1 className="text-xl">Visualize 3d Models</h1>
                <Button onClick={() => setShowUploadModal(true)} className="flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white ">
          <FiUpload className="mr-2" /> Upload
        </Button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-3 bg-red-900 text-red-200  flex items-start">
                    <FiAlertCircle className="mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                        <p className="font-medium">Error</p>
                        <p className="text-sm">{error}</p>
                        <button onClick={loadData} className="mt-2 text-sm underline hover:text-red-300">
                            Retry
                        </button>
                    </div>
                </div>
            )}
            
            <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} title="Upload 3D Model">
                <div className="space-y-4 text-white bg-gray-900 p-4 rounded-md">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Model Name</label>
                        <input
                            type="text"
                            value={newModel.name}
                            onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. My 3D Model"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                        <select
                            value={newModel.category}
                            onChange={(e) => setNewModel({ ...newModel, category: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="" className="bg-gray-900 text-gray-300">Select category</option>
                            {categories.map((cat) => (
                                <option key={cat._id} value={cat._id} className="bg-gray-900 text-gray-200">
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Tags (comma separated)</label>
                        <input
                            type="text"
                            value={newModel.tags}
                            onChange={(e) => setNewModel({ ...newModel, tags: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. furniture, modern, wood"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Model File</label>
                        <input
                            type="file"
                            accept=".glb,.gltf"
                            onChange={(e) => setNewModel({ ...newModel, file: e.target.files[0] })}
                            className="w-full text-sm text-gray-300 bg-gray-800 border border-gray-700 rounded-md p-2 file:bg-blue-600 file:border-none file:px-4 file:py-2 file:rounded file:text-white file:cursor-pointer hover:file:bg-blue-700"
                        />
                    </div>

                    {error && <div className="text-red-400 text-sm">{error}</div>}

                    <div className="flex justify-end space-x-2 pt-2">
                        <Button variant="secondary" onClick={() => setShowUploadModal(false)}>Cancel</Button>
                        <Button onClick={handleUpload} disabled={!newModel.name || !newModel.file}>Upload</Button>
                    </div>
                </div>
            </Modal>

        </div>
        {/* <div className="bg-[green] opacity-25">
        {currentModel && (
            <div className="p-4 border-t border-gray-800 bg-[red] text-white w-[10%]">
                <h3 className="font-semibold text-md mb-1">Current Model</h3>
                <p className="text-sm truncate text-gray-300">{currentModel.name}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                    {(Array.isArray(currentModel?.tags)
                        ? currentModel.tags
                        : currentModel?.tags?.split(',') || []
                    ).map((tag) => (
                        <span
                            key={tag.trim()}
                            className="text-xs bg-gray-800 border border-gray-700 rounded px-2 py-0.5 text-gray-400"
                        >
                            {tag.trim()}
                        </span>
                    ))}
                </div>
            </div>
        )}
        </div> */}
        </>
    );

}
