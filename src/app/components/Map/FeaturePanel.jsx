import React, { useEffect, useState, useRef } from "react";
import {
  FaMapMarkerAlt,
  FaDrawPolygon,
  FaRuler,
  FaEye,
  FaLayerGroup,
  FaInfoCircle,
} from "react-icons/fa";

export default function FeaturePanel({
  activeDataSources,
  dataSources,
  focusOnFeature,
}) {
  const [displayedSources, setDisplayedSources] = useState({});

  const prevSourcesRef = useRef({});

  useEffect(() => {
    if (
      Object.keys(activeDataSources).length === 0 &&
      Object.keys(displayedSources).length === 0
    ) {
      return;
    }

    const prevKeys = Object.keys(prevSourcesRef.current);
    const currentKeys = Object.keys(activeDataSources);

    if (
      prevKeys.length === currentKeys.length &&
      prevKeys.every((key) => currentKeys.includes(key))
    ) {
      return;
    }

    prevSourcesRef.current = activeDataSources;

    setDisplayedSources(activeDataSources);
  }, [activeDataSources]);

  const getFeatureIcon = (geometryType) => {
    switch (geometryType) {
      case "Point":
        return <FaMapMarkerAlt className="text-red-500" />;
      case "LineString":
        return <FaRuler className="text-blue-500" />;
      case "Polygon":
      case "MultiPolygon":
        return <FaDrawPolygon className="text-green-500" />;
      default:
        return <FaInfoCircle className="text-gray-500" />;
    }
  };

  return (
    <div className="w-1/5 border-l border-gray-800 flex flex-col bg-gray-950">
      <div className="p-4 border-b border-gray-800 bg-gray-900">
        <h2 className="text-sm uppercase tracking-wider text-blue-400 font-semibold flex items-center gap-2">
          <FaLayerGroup />
          Features
        </h2>
      </div>
      <div className="overflow-y-auto flex-1 custom-scrollbar">
        <div className="p-3">
          {Object.keys(displayedSources).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(displayedSources).map(([sourceId, data]) => {
                const sourceName =
                  dataSources.find((s) => s.id === sourceId)?.name || sourceId;

                return (
                  <div
                    key={sourceId}
                    className="border rounded-lg overflow-hidden bg-gray-900/50 shadow-md border-gray-700 hover:border-gray-600 transition-colors"
                  >
                    <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-3 border-b border-gray-600">
                      <div className="flex justify-between items-center">
                        <h2 className="text-sm font-semibold text-neutral-200">
                          {sourceName}
                        </h2>
                        <span className="text-xs bg-gray-900 px-2 py-1 rounded-full text-blue-300">
                          {data &&
                          data.type === "FeatureCollection" &&
                          data.features
                            ? `${data.features.length} features`
                            : "1 feature"}
                        </span>
                      </div>
                    </div>

                    <div className="p-3">
                      {data &&
                      data.type === "FeatureCollection" &&
                      data.features ? (
                        <div className="space-y-2">
                          {data.features.map((feature, index) => {
                            const featureWithSource = {
                              ...feature,
                              properties: {
                                ...feature.properties,
                                _sourceId: sourceId,
                                sourceId: sourceId,
                              },
                            };

                            return (
                              <div
                                key={index}
                                className="bg-gray-800 p-3 rounded-md border border-gray-700 hover:border-gray-600 transition-colors hover:shadow-md"
                              >
                                <div className="flex justify-between items-center">
                                  <h3 className="font-medium text-sm text-neutral-200 flex items-center gap-2">
                                    {getFeatureIcon(feature.geometry?.type)}
                                    {feature.properties?.name ||
                                      `Feature #${index + 1}`}
                                  </h3>
                                  <button
                                    onClick={() =>
                                      focusOnFeature(featureWithSource)
                                    }
                                    className="bg-blue-600 hover:bg-blue-700 text-blue-100 text-xs py-1 px-3 rounded-md transition-colors flex items-center gap-1"
                                  >
                                    <FaEye size={12} />
                                    <span>Focus</span>
                                  </button>
                                </div>
                                <p className="text-xs text-neutral-400 mt-2 flex items-center gap-1">
                                  <span className="font-semibold">Type:</span>{" "}
                                  {feature.geometry?.type}
                                </p>
                                {feature.properties?.description && (
                                  <p className="text-xs mt-2 text-neutral-300 bg-gray-700/60 p-2 rounded-md">
                                    {feature.properties.description}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="bg-gray-800 p-3 rounded-md border border-gray-700 hover:border-gray-600 transition-colors">
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium text-sm text-neutral-200 flex items-center gap-2">
                              {getFeatureIcon(data?.geometry?.type)}
                              {data?.properties?.name || "Single Feature"}
                            </h3>
                            <button
                              onClick={() => {
                                const dataWithSource = {
                                  ...data,
                                  properties: {
                                    ...data.properties,
                                    _sourceId: sourceId,
                                    sourceId: sourceId,
                                  },
                                };
                                focusOnFeature(dataWithSource);
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-blue-100 text-xs py-1 px-3 rounded-md transition-colors flex items-center gap-1"
                            >
                              <FaEye size={12} />
                              <span>Focus</span>
                            </button>
                          </div>
                          <p className="text-xs text-neutral-400 mt-2 flex items-center gap-1">
                            <span className="font-semibold">Type:</span>{" "}
                            {data?.geometry?.type || "Unknown"}
                          </p>
                          <div className="mt-3 text-xs font-mono bg-gray-700/50 p-2 rounded-md border border-gray-600 overflow-auto max-h-28 text-neutral-300">
                            <pre>{JSON.stringify(data, null, 2)}</pre>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <FaLayerGroup className="text-gray-600 mb-2" size={24} />
              <p className="text-gray-400 text-sm">No active data sources</p>
              <p className="text-gray-500 text-xs mt-1">
                Connect to a data source to see features
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
