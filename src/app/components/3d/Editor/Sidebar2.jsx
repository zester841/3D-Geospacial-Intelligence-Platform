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
        <div className="bg-gray-900 text-white w-100 h-full border-r border-gray-800 flex flex-col shadow-lg overflow-hidden">

            {/* Header */}
            <div className="p-4 border-b border-gray-800 bg-gray-950">
                <h1 className="text-xl font-semibold">3D Model Library</h1>
                <p className="text-xl text-gray-400 mt-1">Choose the Template</p>
            </div>


            {/* Error Message */}
            {error && (
                <div className="p-3 bg-red-900/80 text-red-200 flex items-start mx-4 mt-4 rounded-lg">
                    <FiAlertCircle className="mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                        <p className="font-medium">Error</p>
                        <p className="text-sm">{error}</p>
                        <button
                            onClick={loadData}
                            className="mt-2 text-sm flex items-center text-blue-400 hover:text-blue-300"
                        >
                            <FiRefreshCw className="mr-1" /> Retry
                        </button>
                    </div>
                </div>
            )}

            {/* Loading Spinner */}
            {loading && (
                <div className="flex-1 flex items-center justify-center">
                    <div className="flex flex-col items-center text-gray-400">
                        <FiRefreshCw className="animate-spin text-2xl mb-2" />
                        <p>Loading models...</p>
                    </div>
                </div>
            )}
            {/* Model Grid */}
            {!loading && (
                <div className="flex-1 overflow-y-auto p-4">
                    {models.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <p className="mb-4">No models found</p>
                            <Button
                                onClick={() => setShowUploadModal(true)}
                                className="flex items-center bg-teal-600 hover:bg-teal-700"
                            >
                                <FiPlus className="mr-2" /> Upload First Model
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            {models.map((model) => {
                                const categoryObj = categories.find((cat) => cat._id === model.category);
                                const isSelected = currentModel?._id === model._id;
                                const tags = Array.isArray(model.tags) ? model.tags : model.tags?.split(',') || [];

                                return (
                                    <div
                                        key={model._id}
                                        onClick={() => onModelSelect(model)}
                                        className={`relative group cursor-pointer transition-all duration-200 ${isSelected
                                            ? 'ring-2 ring-teal-500'
                                            : 'hover:ring-1 hover:ring-gray-600'
                                            }`}
                                    >
                                        <div className={`bg-gray-800 rounded-lg overflow-hidden h-full ${isSelected ? 'bg-gray-750' : 'hover:bg-gray-750'}`}>
                                            {/* Model Thumbnail Placeholder */}
                                            <div className="h-32 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                                                <span className="text-4xl">🖼️</span>
                                            </div>

                                            {/* Model Info */}
                                            <div className="p-3">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="font-medium text-sm truncate">{model.name}</h3>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(model._id);
                                                        }}
                                                        className="text-gray-400 hover:text-red-500 ml-2"
                                                        title="Delete model"
                                                    >
                                                        <FiTrash2 size={14} />
                                                    </button>
                                                </div>

                                                {categoryObj && (
                                                    <span className="inline-block mt-1 px-2 py-0.5 bg-gray-900 text-xs rounded-full text-teal-400">
                                                        {categoryObj.name}
                                                    </span>
                                                )}

                                                {tags.length > 0 && (
                                                    <div className="mt-2 flex flex-wrap gap-1">
                                                        {tags.slice(0, 2).map((tag, index) => (
                                                            <span
                                                                key={index}
                                                                className="text-xs bg-gray-900/50 text-gray-300 px-2 py-0.5 rounded-full"
                                                            >
                                                                {tag.trim()}
                                                            </span>
                                                        ))}
                                                        {tags.length > 2 && (
                                                            <span className="text-xs text-gray-500">+{tags.length - 2}</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Selected indicator */}
                                            {isSelected && (
                                                <div className="absolute top-2 right-2 bg-teal-600 text-white text-xs px-2 py-0.5 rounded-full">
                                                    Active
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
            {/* Current Model Info */}
            {currentModel && (
                <div className="p-4 border-t border-gray-800 bg-gray-950">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-xl">Current Model</h3>
                        <span className="text-xs bg-teal-900 text-teal-400 px-2 py-0.5 rounded-full">Active</span>
                    </div>
                    <p className="text-sm font-medium">{currentModel.name}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                        {(Array.isArray(currentModel.tags) ? currentModel.tags : currentModel.tags?.split(',') || []).map((tag) => (
                            <span
                                key={tag.trim()}
                                className="text-xs bg-gray-800 border border-gray-700 rounded-full px-2 py-0.5 text-gray-400"
                            >
                                {tag.trim()}
                            </span>
                        ))}
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
    );

}