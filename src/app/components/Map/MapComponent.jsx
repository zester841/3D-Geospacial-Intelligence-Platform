import React, { useRef, useEffect, useState, useMemo } from "react";
import {
  Map,
  Source,
  Layer,
  Marker,
  NavigationControl,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import { getSourceColor } from "../../../utils/MapUtils";
import { FaEdit, FaDownload, FaUpload, FaTrash } from "react-icons/fa";

export default function MapComponent({
  viewState,
  setViewState,
  geojsonData,
  pointFeatures,
  layerStyles,
}) {
  const mapRef = useRef(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [drawnFeatures, setDrawnFeatures] = useState(null);

  const validatedGeoJson = useMemo(() => {
    if (!geojsonData) return null;

    try {
      const validatedData = {
        type: geojsonData.type || "FeatureCollection",
        features: [],
      };

      if (Array.isArray(geojsonData.features)) {
        validatedData.features = geojsonData.features.filter((feature) => {
          try {
            return (
              feature &&
              feature.geometry &&
              feature.geometry.type &&
              feature.geometry.coordinates &&
              Array.isArray(feature.geometry.coordinates)
            );
          } catch (e) {
            console.error("Error validating feature:", e);
            return false;
          }
        });
      }

      return validatedData;
    } catch (error) {
      console.error("Error validating GeoJSON:", error);
      return null;
    }
  }, [geojsonData]);

  const validPointFeatures = useMemo(() => {
    if (!pointFeatures) return [];

    return pointFeatures.filter(
      (feature) =>
        feature &&
        feature.geometry &&
        feature.geometry.type === "Point" &&
        Array.isArray(feature.geometry.coordinates) &&
        feature.geometry.coordinates.length >= 2 &&
        !isNaN(feature.geometry.coordinates[0]) &&
        !isNaN(feature.geometry.coordinates[1])
    );
  }, [pointFeatures]);

  useEffect(() => {
    return () => {
      const mapInstance = mapRef.current?.getMap?.();
      if (mapInstance) {
        try {
          const existingControls = mapInstance._controls || [];
          existingControls.forEach((control) => {
            if (control instanceof MapboxDraw) {
              mapInstance.removeControl(control);
            }
          });
        } catch (err) {
          console.warn("Error cleaning up map controls:", err);
        }
      }
    };
  }, []);

  useEffect(() => {
    const mapInstance = mapRef.current?.getMap?.();
    if (!mapInstance) return;

    let drawControl = null;

    const removeExistingDrawControl = () => {
      try {
        const existingControls = mapInstance._controls || [];
        existingControls.forEach((control) => {
          if (control instanceof MapboxDraw) {
            mapInstance.removeControl(control);
          }
        });
      } catch (err) {
        console.warn("Error removing existing draw control:", err);
      }
    };

    removeExistingDrawControl();

    if (isEditMode) {
      try {
        drawControl = new MapboxDraw({
          displayControlsDefault: false,
          controls: {
            point: true,
            line_string: true,
            polygon: true,
            trash: true,
          },
        });

        mapInstance.addControl(drawControl);

        const updateDrawnFeatures = () => {
          if (drawControl) {
            const features = drawControl.getAll();
            setDrawnFeatures(features);
          }
        };

        mapInstance.on("draw.create", updateDrawnFeatures);
        mapInstance.on("draw.update", updateDrawnFeatures);
        mapInstance.on("draw.delete", updateDrawnFeatures);

        if (
          drawnFeatures &&
          drawnFeatures.features &&
          drawnFeatures.features.length > 0
        ) {
          try {
            drawControl.add(drawnFeatures);
          } catch (err) {
            console.warn("Error adding saved features to draw control:", err);
          }
        }

        return () => {
          if (mapInstance) {
            mapInstance.off("draw.create", updateDrawnFeatures);
            mapInstance.off("draw.update", updateDrawnFeatures);
            mapInstance.off("draw.delete", updateDrawnFeatures);

            if (drawControl) {
              try {
                const features = drawControl.getAll();
                setDrawnFeatures(features);
              } catch (err) {
                console.warn("Error saving features:", err);
              }
              removeExistingDrawControl();
            }
          }
        };
      } catch (err) {
        console.error("Error setting up draw control:", err);
      }
    }
  }, [isEditMode, drawnFeatures]);

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const geojsonData = JSON.parse(e.target.result);
          if (
            geojsonData &&
            geojsonData.type === "FeatureCollection" &&
            Array.isArray(geojsonData.features)
          ) {
            setDrawnFeatures(geojsonData);
            const drawControl = mapRef.current
              ?.getMap()
              .getStyle()
              .sources.find((s) => s.id === "mapbox-gl-draw-cold");
            if (drawControl) {
              drawControl.add(geojsonData);
            }
          } else {
            alert("Invalid GeoJSON file format");
          }
        } catch (error) {
          console.error("Error parsing GeoJSON file:", error);
          alert("Error parsing GeoJSON file");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDownload = () => {
    if (!drawnFeatures) {
      alert("No features to download");
      return;
    }

    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(drawnFeatures, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "map_features.geojson");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleClear = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all drawn features? This cannot be undone."
      )
    ) {
      const mapInstance = mapRef.current?.getMap?.();
      if (!mapInstance) return;

      const drawControl = mapInstance._controls.find(
        (control) => control instanceof MapboxDraw
      );
      if (drawControl) {
        drawControl.deleteAll();
        setDrawnFeatures({ type: "FeatureCollection", features: [] });
      }
    }
  };

  const renderSafeLayer = (layer) => {
    if (
      !layer ||
      !layer.id ||
      !layer.type ||
      (layer.type === "symbol" &&
        (!layer.layout || !layer.layout["icon-image"])) ||
      (layer.type !== "symbol" &&
        (!layer.paint || Object.keys(layer.paint).length === 0))
    ) {
      return null;
    }

    return <Layer {...layer} />;
  };

  return (
    <div className="w-3/5 relative">
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex flex-row items-center gap-1.5 bg-gray-900/70 px-1.5 py-1 rounded-lg shadow-lg border backdrop-blur-sm">
          <button
            onClick={toggleEditMode}
            className={`px-2 py-1 rounded-md cursor-pointer flex items-center gap-1.5 transition-colors text-xs bg-gray-700 text-gray-100 hover:bg-gray-600`}
            title={isEditMode ? "Exit Edit Mode" : "Enter Edit Mode"}
          >
            <FaEdit size={12} />
            <span>{isEditMode ? "Exit" : "Edit"}</span>
          </button>

          {isEditMode && (
            <>
              <label className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded-md cursor-pointer text-white flex items-center gap-1.5 transition-colors text-xs">
                <FaUpload size={12} />
                <span>Upload</span>
                <input
                  type="file"
                  accept=".geojson,application/geo+json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleDownload}
                className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded-md cursor-pointer text-white flex items-center gap-1.5 transition-colors text-xs"
                title="Download GeoJSON"
              >
                <FaDownload size={12} />
                <span>Download</span>
              </button>

              <button
                onClick={handleClear}
                className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded-md cursor-pointer text-white flex items-center gap-1.5 transition-colors text-xs"
                title="Clear All Features"
              >
                <FaTrash size={12} />
                <span>Clear</span>
              </button>
            </>
          )}
        </div>
      </div>

      <Map
        ref={mapRef}
        mapboxAccessToken="pk.eyJ1Ijoic2xheWVycGl5dXNoIiwiYSI6ImNtOWJuY2pmZzBsMGYybHM3bnJxY2lmcmMifQ.enmR_89C12BX9F2FWe3guA"
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
      >
        <NavigationControl position="top-left" />

        {validatedGeoJson && (
          <Source
            id="geospatial-data"
            type="geojson"
            data={validatedGeoJson}
            options={{
              animate: true,
              animationDuration: 1000,
            }}
          >
            {renderSafeLayer(layerStyles.lines)}
            {renderSafeLayer(layerStyles.multiLines)}
            {renderSafeLayer(layerStyles.polygonFill)}
            {renderSafeLayer(layerStyles.polygonOutline)}
            {renderSafeLayer(layerStyles.multiPolygonFill)}
            {renderSafeLayer(layerStyles.multiPolygonOutline)}
            {!isEditMode && renderSafeLayer(layerStyles.points)}
          </Source>
        )}

        {validPointFeatures.map((feature, index) => (
          <Marker
            key={`marker-${index}`}
            longitude={feature.geometry.coordinates[0]}
            latitude={feature.geometry.coordinates[1]}
          >
            <div className="relative group">
              <div
                style={{
                  width: "15px",
                  height: "15px",
                  background: getSourceColor(
                    feature.properties?._sourceId || "default",
                    "point"
                  ),
                  border: "2px solid #1f2937",
                  borderRadius: "50%",
                  cursor: "pointer",
                  boxShadow: "0 0 0 2px rgba(255,255,255,0.15)",
                  transition: "transform 0.2s",
                }}
                className="hover:scale-125"
                title={feature.properties?.name || "Point"}
              />
              {feature.properties?.name && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-1 bg-gray-900/90 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                  {feature.properties.name}
                </div>
              )}
            </div>
          </Marker>
        ))}
      </Map>
    </div>
  );
}
