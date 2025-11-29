'use client';
import { useState, useEffect } from 'react';
import Button from '../UI/Button';
import Modal from '../UI/Modal';

const ModelLibrary = ({ 
  models, 
  categories, 
  onSelectModel, 
  onAddCategory,
  currentModel 
}) => {
  const [filteredModels, setFilteredModels] = useState(models);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    let result = [...models];
    
    if (selectedCategory !== 'all') {
      result = result.filter(model => model.category === selectedCategory);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(model => 
        model.name.toLowerCase().includes(term) ||
        model.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }
    
    setFilteredModels(result);
  }, [models, selectedCategory, searchTerm]);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    try {
      await onAddCategory(newCategoryName);
      setNewCategoryName('');
      setIsCategoryModalOpen(false);
    } catch (error) {
      console.error('Failed to add category:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Model Library</h3>
      </div>

      <div className="space-y-2">
        <div className="flex gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
          <Button onClick={() => setIsCategoryModalOpen(true)}>
            +
          </Button>
        </div>

        <input
          type="text"
          placeholder="Search models..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {filteredModels.map((model) => (
          <div
            key={model._id}
            onClick={() => onSelectModel(model)}
            className={`p-2 border rounded-md cursor-pointer ${
              currentModel?._id === model._id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-medium text-sm truncate">{model.name}</div>
            <div className="text-xs text-gray-500 truncate">{model.category}</div>
            <div className="flex flex-wrap gap-1 mt-1">
              {model.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="px-1 py-0.5 bg-gray-100 text-xs rounded">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Add New Category"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Category Name</label>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleAddCategory}>Add Category</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ModelLibrary;