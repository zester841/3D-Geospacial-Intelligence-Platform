import React, { useState } from "react";
import { FaFolder, FaSave, FaTimes } from "react-icons/fa";

export default function ProjectDialog({ isOpen, onClose, onCreateProject }) {
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
  });

  const handleCreate = () => {
    if (newProject.name.trim()) {
      onCreateProject(newProject);
      onClose();
      setNewProject({ name: "", description: "" });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-950/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md shadow-xl border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl text-blue-400 font-bold flex items-center gap-2">
            <FaFolder className="text-blue-500" />
            Create New Project
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800 transition-colors"
          >
            <FaTimes size={18} />
          </button>
        </div>

        <div className="mb-5">
          <label className="text-sm font-medium text-neutral-300 mb-1 flex items-center gap-1">
            Project Name
          </label>
          <input
            type="text"
            value={newProject.name}
            onChange={(e) =>
              setNewProject({ ...newProject, name: e.target.value })
            }
            className="w-full text-white p-3 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="e.g., Downtown Traffic Analysis"
          />
        </div>

        <div className="mb-6">
          <label className="text-sm font-medium text-neutral-300 mb-1 flex items-center gap-1">
            Description (optional)
          </label>
          <textarea
            value={newProject.description}
            onChange={(e) =>
              setNewProject({ ...newProject, description: e.target.value })
            }
            className="w-full text-white p-3 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all h-24"
            placeholder="Add a brief description of the project..."
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-gray-200 rounded-md hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            <FaTimes size={14} />
            <span>Cancel</span>
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
            disabled={!newProject.name.trim()}
          >
            <FaSave size={14} />
            <span>Create Project</span>
          </button>
        </div>
      </div>
    </div>
  );
}
