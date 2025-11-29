import React from "react";
import {
  FaDatabase,
  FaPlus,
  FaTrash,
  FaLink,
  FaUnlink,
  FaSpinner,
  FaFolder,
  FaExclamationTriangle,
} from "react-icons/fa";

export default function SourceList({
  dataSources,
  activeDataSources,
  disconnectingSource,
  subscribeToSource,
  unsubscribeFromSource,
  deleteSource,
  setNewSourceDialogOpen,
  activeProject,
}) {
  return (
    <div className="w-1/5 border-r border-gray-800 flex flex-col bg-gray-950">
      <div className="p-4 border-b border-gray-700 bg-gray-900 flex justify-between items-center">
        <h2 className="text-sm uppercase tracking-wider text-blue-400 font-semibold flex items-center gap-2">
          <FaDatabase />
          Data Sources
        </h2>
        <button
          onClick={() => setNewSourceDialogOpen(true)}
          className={`p-2 rounded-full transition-colors text-sm shadow-md flex items-center justify-center ${
            activeProject
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-700 text-gray-500 cursor-not-allowed"
          }`}
          disabled={!activeProject}
          title={activeProject ? "Add New Source" : "Select a project first"}
        >
          <FaPlus size={12} />
        </button>
      </div>
      <div className="overflow-y-auto flex-1 custom-scrollbar">
        {!activeProject ? (
          <div className="p-4 text-center text-neutral-400 mt-8">
            <FaFolder className="mx-auto mb-2 text-gray-600" size={24} />
            <p className="text-sm">No project selected</p>
            <p className="text-xs mt-2 text-gray-500">
              Select or create a project to manage data sources
            </p>
          </div>
        ) : dataSources.length === 0 ? (
          <div className="p-4 text-center text-neutral-400 mt-8">
            <p className="text-sm">No data sources available</p>
            <button
              onClick={() => setNewSourceDialogOpen(true)}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors text-sm flex items-center gap-2 mx-auto"
            >
              <FaPlus size={12} />
              <span>Add First Data Source</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3 p-3">
            {dataSources.map((source) => {
              const isActive = Boolean(activeDataSources[source.id]);

              return (
                <div
                  key={source.id}
                  className={`p-3 border rounded-lg transition-all duration-200 ${
                    isActive
                      ? "border-blue-600 bg-blue-950/30 shadow-md"
                      : "border-gray-700 bg-gray-900 hover:border-gray-600"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-neutral-200">
                        {source.name}
                      </h3>
                      <p className="text-sm text-neutral-400 mt-1">
                        {source.url}
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        ID: {source.id}
                      </p>
                    </div>
                    <div className="flex flex-col space-y-2">
                      {isActive ? (
                        <button
                          onClick={() => unsubscribeFromSource(source.id)}
                          className={`flex items-center justify-center text-neutral-200 p-2 rounded-full transition-colors ${
                            disconnectingSource === source.id
                              ? "bg-neutral-700 opacity-50 cursor-not-allowed"
                              : "bg-neutral-700 hover:bg-neutral-600 hover:text-white"
                          }`}
                          disabled={disconnectingSource === source.id}
                          title="Disconnect"
                        >
                          {disconnectingSource === source.id ? (
                            <FaSpinner className="animate-spin h-4 w-4" />
                          ) : (
                            <FaUnlink className="h-4 w-4" />
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => subscribeToSource(source.id)}
                          className={`flex items-center justify-center text-white p-2 rounded-full transition-colors ${
                            disconnectingSource === source.id
                              ? "bg-blue-700 opacity-50 cursor-not-allowed"
                              : "bg-blue-600 hover:bg-blue-700"
                          }`}
                          disabled={disconnectingSource === source.id}
                          title="Connect"
                        >
                          <FaLink className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteSource(source.id)}
                        className={`flex items-center justify-center text-red-200 p-2 rounded-full transition-colors ${
                          disconnectingSource === source.id
                            ? "bg-red-800 opacity-50 cursor-not-allowed"
                            : "bg-red-800 hover:bg-red-700"
                        }`}
                        disabled={disconnectingSource === source.id}
                        title="Delete source"
                      >
                        <FaTrash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {isActive && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-1 bg-blue-900 text-blue-200 text-xs rounded-full">
                        <span className="w-2 h-2 mr-1 bg-blue-400 rounded-full animate-pulse"></span>
                        Connected
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
