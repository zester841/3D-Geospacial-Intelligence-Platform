"use client";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import Link from "next/link";
import "./page.css";
import SourceDialog from "../components/Map/SourceDialog";
import SourceList from "../components/Map/SourceList";
import MapComponent from "../components/Map/MapComponent";
import FeaturePanel from "../components/Map/FeaturePanel";
import { layerStyles, getSourceColor } from "../../utils/MapUtils";
import { generateGeoJSON, getPointFeatures } from "../../utils/GeoJsonUtils";
import {
  FaPlus,
  FaMapMarkedAlt,
  FaFolderOpen,
  FaFolder,
  FaTrashAlt,
} from "react-icons/fa";
import { IoMdArrowBack } from "react-icons/io";
import ProjectDialog from "../components/Map/ProjectDialog";

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [forceReset, setForceReset] = useState(0);

  const [dataSources, setDataSources] = useState([]);
  const [activeDataSources, setActiveDataSources] = useState({});
  const [realtimeData, setRealtimeData] = useState(null);
  const [disconnectingSource, setDisconnectingSource] = useState(null);

  const [viewState, setViewState] = useState({
    longitude: 77.216721,
    latitude: 28.6448,
    zoom: 4,
  });

  const [newSourceDialogOpen, setNewSourceDialogOpen] = useState(false);
  const [newSource, setNewSource] = useState({ id: "", url: "", name: "" });
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);

  const [socket, setSocket] = useState(null);

  const createProject = (projectData) => {
    if (socket) {
      socket.emit("create-project", projectData);
    }
  };

  const loadProject = (projectId) => {
    if (socket) {
      Object.keys(activeDataSources).forEach((sourceId) => {
        socket.emit("unsubscribe-source", { sourceId });
      });

      setActiveDataSources({});
      setRealtimeData(null);
      setForceReset((prev) => prev + 1);
      socket.emit("get-project", { projectId });
      setProjectMenuOpen(false);
    }
  };

  const deleteProject = (projectId) => {
    if (
      socket &&
      window.confirm(
        "Are you sure you want to delete this project? This action cannot be undone."
      )
    ) {
      if (activeProject && activeProject.id === projectId) {
        Object.keys(activeDataSources).forEach((sourceId) => {
          socket.emit("unsubscribe-source", { sourceId });
        });
      }

      socket.emit("delete-project", { projectId });

      if (activeProject && activeProject.id === projectId) {
        setActiveProject(null);
        setActiveDataSources({});
        setRealtimeData(null);
        setForceReset((prev) => prev + 1);
      }
    }
  };

  const saveProjectState = () => {
    if (socket && activeProject) {
      const updatedProject = {
        ...activeProject,
        initialViewState: viewState,
        geojsonData: generateGeoJSON(activeDataSources),
      };

      socket.emit("update-project", {
        projectId: activeProject.id,
        projectData: updatedProject,
      });
    }
  };

  const subscribeToSource = (sourceId) => {
    if (socket && !activeDataSources[sourceId]) {
      console.log(`Subscribing to source: ${sourceId}`);
      socket.emit("subscribe-source", { sourceId });
    }
  };

  const unsubscribeFromSource = (sourceId) => {
    if (socket && activeDataSources[sourceId]) {
      console.log(`Unsubscribing from source: ${sourceId}`);

      setDisconnectingSource(sourceId);

      setActiveDataSources((prev) => {
        const newSources = { ...prev };
        delete newSources[sourceId];
        return newSources;
      });

      socket.emit("unsubscribe-source", { sourceId });

      setTimeout(() => {
        setDisconnectingSource(null);
      }, 500);
    }
  };

  const addNewSource = () => {
    if (socket && newSource.id && newSource.url && newSource.name) {
      const sourceData = {
        ...newSource,
        projectId: activeProject ? activeProject.id : null,
      };

      socket.emit("add-source", sourceData);
      setNewSourceDialogOpen(false);
      setNewSource({ id: "", url: "", name: "" });
    }
  };

  const deleteSource = (sourceId) => {
    if (socket) {
      socket.emit("delete-source", { sourceId });

      if (activeDataSources[sourceId]) {
        unsubscribeFromSource(sourceId);
      }
    }
  };

  const focusOnFeature = (feature) => {
    if (!feature || !feature.geometry) return;

    if (feature.geometry.type === "Point") {
      const sourceId =
        feature.properties?._sourceId || feature.properties?.sourceId;

      if (sourceId && activeDataSources[sourceId]) {
        const currentData = activeDataSources[sourceId];

        let currentFeature = null;

        if (currentData.type === "FeatureCollection" && currentData.features) {
          const featureId = feature.id || feature.properties?.id;
          const featureName = feature.properties?.name;

          currentFeature = currentData.features.find(
            (f) =>
              (featureId &&
                (f.id === featureId || f.properties?.id === featureId)) ||
              (featureName && f.properties?.name === featureName)
          );
        } else if (currentData.type === "Feature") {
          currentFeature = currentData;
        } else if (currentData.longitude && currentData.latitude) {
          currentFeature = {
            geometry: {
              type: "Point",
              coordinates: [currentData.longitude, currentData.latitude],
            },
          };
        }

        if (currentFeature && currentFeature.geometry?.type === "Point") {
          console.log(
            "Focusing on real-time coordinates:",
            currentFeature.geometry.coordinates
          );
          setViewState({
            longitude: currentFeature.geometry.coordinates[0],
            latitude: currentFeature.geometry.coordinates[1],
            zoom: 14,
          });
          return;
        }
      }

      console.log(
        "Focusing on original coordinates:",
        feature.geometry.coordinates
      );
      setViewState({
        longitude: feature.geometry.coordinates[0],
        latitude: feature.geometry.coordinates[1],
        zoom: 14,
      });
    } else if (feature.geometry.type === "LineString") {
      const midIndex = Math.floor(feature.geometry.coordinates.length / 2);
      setViewState({
        longitude: feature.geometry.coordinates[midIndex][0],
        latitude: feature.geometry.coordinates[midIndex][1],
        zoom: 12,
      });
    } else if (feature.geometry.type === "Polygon") {
      setViewState({
        longitude: feature.geometry.coordinates[0][0][0],
        latitude: feature.geometry.coordinates[0][0][1],
        zoom: 11,
      });
    } else if (feature.geometry.type === "MultiPolygon") {
      setViewState({
        longitude: feature.geometry.coordinates[0][0][0][0],
        latitude: feature.geometry.coordinates[0][0][0][1],
        zoom: 11,
      });
    }
  };

  useEffect(() => {
    const newSocket = io("http://localhost:4000");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to socket server");
    });

    newSocket.on("available-sources", (sources) => {
      const filteredSources = activeProject
        ? sources.filter((source) => source.projectId === activeProject.id)
        : sources.filter((source) => !source.projectId);

      setDataSources(filteredSources);
    });

    newSocket.on("available-projects", (projectsList) => {
      setProjects(projectsList);
    });

    newSocket.on("project-data", ({ project, dataSources }) => {
      Object.keys(activeDataSources).forEach((sourceId) => {
        newSocket.emit("unsubscribe-source", { sourceId });
      });

      setActiveDataSources({});
      setRealtimeData(null);
      setForceReset((prev) => prev + 1);

      setActiveProject(project);

      if (project.initialViewState) {
        setViewState(project.initialViewState);
      }

      setDataSources(dataSources);
    });

    newSocket.on("project-created", (project) => {
      setActiveProject(project);
    });

    newSocket.on("project-updated", (project) => {
      if (activeProject && activeProject.id === project.id) {
        setActiveProject(project);
      }
    });

    newSocket.on("project-deleted", ({ id }) => {
      if (activeProject && activeProject.id === id) {
        setActiveProject(null);
        setActiveDataSources({});
        setRealtimeData(null);
        setDataSources([]);
        setForceReset((prev) => prev + 1);
      }
    });

    newSocket.on("realtime-data", (response) => {
      const { sourceId, data, sourceName } = response;
      if (disconnectingSource === sourceId) {
        console.log(
          `Ignoring data for source ${sourceId} as it's being disconnected`
        );
        return;
      }

      setActiveDataSources((prev) => {
        if (prev[sourceId] === data) {
          return prev;
        }
        return {
          ...prev,
          [sourceId]: data,
        };
      });

      setRealtimeData(data);
    });

    newSocket.on("error", (error) => {
      console.error("Socket error:", error);
      alert(`Error: ${error.message}`);
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from socket server");
    });

    return () => {
      newSocket.disconnect();
    };
  }, [disconnectingSource, activeProject]);

  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      if (activeProject) {
        saveProjectState();
      }
    }, 5000);

    return () => clearTimeout(saveTimeout);
  }, [viewState, activeDataSources, activeProject]);

  const featurePanelKey = `feature-panel-${activeProject?.id || "no-project"}`;

  const geojsonData =
    Object.keys(activeDataSources).length > 0
      ? generateGeoJSON(activeDataSources)
      : { type: "FeatureCollection", features: [] };

  const pointFeatures = geojsonData ? getPointFeatures(geojsonData) : [];

  return (
    <main className="h-screen flex flex-col bg-[#030915] text-neutral-200 overflow-hidden">
      {/* Project Dialog */}
      <ProjectDialog
        isOpen={projectDialogOpen}
        onClose={() => setProjectDialogOpen(false)}
        onCreateProject={createProject}
      />

      {/* Source Dialog */}
      <SourceDialog
        isOpen={newSourceDialogOpen}
        onClose={() => setNewSourceDialogOpen(false)}
        newSource={newSource}
        setNewSource={setNewSource}
        onAddSource={addNewSource}
      />

      {/* Header with navigation and controls */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-950 p-3 border-b border-gray-700 flex justify-between items-center shadow-md">
        {/* Left side - Back button and project selector */}
        <div className="flex items-center gap-3">
          <Link href="/">
            <button className="bg-gray-600 hover:bg-gray-700 text-white px-2 py-2 rounded-md transition-colors text-sm flex items-center gap-2 shadow-lg">
              <IoMdArrowBack size={20} />
            </button>
          </Link>

          {/* Project selector dropdown */}
          <div className="relative">
            <div className="flex">
              <button
                onClick={() => setProjectMenuOpen(!projectMenuOpen)}
                className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-md transition-colors text-sm flex items-center gap-2"
              >
                <FaFolderOpen size={14} />
                <span>
                  {activeProject ? activeProject.name : "Select Project"}
                </span>
              </button>

              <div className="px-2">
                <button
                  onClick={() => {
                    setProjectDialogOpen(true);
                    setProjectMenuOpen(false);
                  }}
                  className="w-full h-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md transition-colors text-sm flex items-center gap-2"
                >
                  <FaPlus size={12} />
                  <span>New Project</span>
                </button>
              </div>
            </div>

            {projectMenuOpen && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-50">
                <div className="max-h-64 overflow-y-auto p-1">
                  {projects.length === 0 ? (
                    <div className="p-3 text-center text-gray-400">
                      No projects yet
                    </div>
                  ) : (
                    projects.map((project) => (
                      <div
                        key={project.id}
                        className={`flex items-center justify-between p-2 hover:bg-gray-700 rounded-md ${
                          activeProject && activeProject.id === project.id
                            ? "bg-gray-700"
                            : ""
                        }`}
                      >
                        <button
                          onClick={() => loadProject(project.id)}
                          className="flex items-center gap-2 text-left flex-1"
                        >
                          <FaFolder className="text-blue-400" size={14} />
                          <span className="text-sm truncate">
                            {project.name}
                          </span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteProject(project.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-400"
                          title="Delete project"
                        >
                          <FaTrashAlt size={12} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right side - Title */}
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-gray-300 flex items-center gap-2">
            <FaMapMarkedAlt className="text-gray-300" />
            GeoSpatial Map Editor
          </h1>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-row flex-1 overflow-hidden">
        {/* Left panel - Data Sources */}
        <SourceList
          dataSources={dataSources}
          activeDataSources={activeDataSources}
          disconnectingSource={disconnectingSource}
          subscribeToSource={subscribeToSource}
          unsubscribeFromSource={unsubscribeFromSource}
          deleteSource={deleteSource}
          setNewSourceDialogOpen={setNewSourceDialogOpen}
          activeProject={activeProject}
        />

        {/* Center panel - Map */}
        <MapComponent
          viewState={viewState}
          setViewState={setViewState}
          geojsonData={geojsonData}
          pointFeatures={pointFeatures}
          layerStyles={layerStyles}
        />

        {/* Right panel - Features */}
        <FeaturePanel
          key={featurePanelKey}
          activeDataSources={activeDataSources}
          dataSources={dataSources}
          focusOnFeature={focusOnFeature}
        />
      </div>
    </main>
  );
}
