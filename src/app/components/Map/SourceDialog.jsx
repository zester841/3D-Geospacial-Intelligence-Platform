import React from "react";
import {
  FaDatabase,
  FaGlobe,
  FaFingerprint,
  FaTag,
  FaSave,
  FaTimes,
} from "react-icons/fa";

export default function SourceDialog({
  isOpen,
  onClose,
  newSource,
  setNewSource,
  onAddSource,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-950/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md shadow-xl border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl text-blue-400 font-bold flex items-center gap-2">
            <FaDatabase className="text-blue-500" />
            Add Data Source
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
            <FaFingerprint className="text-blue-400" size={14} />
            Source ID (unique identifier)
          </label>
          <input
            type="text"
            value={newSource.id}
            onChange={(e) => setNewSource({ ...newSource, id: e.target.value })}
            className="w-full text-white p-3 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="e.g., traffic, weather"
          />
        </div>

        <div className="mb-5">
          <label className="text-sm font-medium text-neutral-300 mb-1 flex items-center gap-1">
            <FaTag className="text-blue-400" size={14} />
            Name
          </label>
          <input
            type="text"
            value={newSource.name}
            onChange={(e) =>
              setNewSource({ ...newSource, name: e.target.value })
            }
            className="w-full text-white p-3 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="e.g., Traffic Data, Weather Service"
          />
        </div>

        <div className="mb-6">
          <label className="text-sm font-medium text-neutral-300 mb-1 flex items-center gap-1">
            <FaGlobe className="text-blue-400" size={14} />
            API URL
          </label>
          <input
            type="text"
            value={newSource.url}
            onChange={(e) =>
              setNewSource({ ...newSource, url: e.target.value })
            }
            className="w-full text-white p-3 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="e.g., http://localhost:5000/api/traffic"
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
            onClick={onAddSource}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
            disabled={!newSource.id || !newSource.name || !newSource.url}
          >
            <FaSave size={14} />
            <span>Add Source</span>
          </button>
        </div>
      </div>
    </div>
  );
}
