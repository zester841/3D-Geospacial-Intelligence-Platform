export const sourceColors = {
    default: {
        point: "#60a5fa",
        line: "#3b82f6",
        fill: "#1e3a8a",
        stroke: "#93c5fd",
    },
    bus: {
        point: "#f97316",
        line: "#ea580c",
        fill: "#7c2d12",
        stroke: "#fdba74",
    },
    traffic: {
        point: "#10b981",
        line: "#059669",
        fill: "#064e3b",
        stroke: "#6ee7b7",
    },
    weather: {
        point: "#a855f7",
        line: "#9333ea",
        fill: "#4c1d95",
        stroke: "#c4b5fd",
    },
};

export const getSourceColor = (sourceId, type) => {
    const colors = sourceColors[sourceId] || sourceColors.default;
    return colors[type];
};

export const layerStyles = {
    points: {
        id: "point-layer",
        type: "circle",
        filter: ["==", ["geometry-type"], "Point"],
        paint: {
            "circle-radius": 8,
            "circle-color": [
                "match",
                ["get", "_sourceId"],
                "bus",
                getSourceColor("bus", "point"),
                "traffic",
                getSourceColor("traffic", "point"),
                "weather",
                getSourceColor("weather", "point"),
                getSourceColor("default", "point"),
            ],
            "circle-opacity": 0.0,
        },
    },

    lines: {
        id: "line-layer",
        type: "line",
        filter: ["==", ["geometry-type"], "LineString"],
        paint: {
            "line-color": [
                "match",
                ["get", "_sourceId"],
                "bus",
                getSourceColor("bus", "line"),
                "traffic",
                getSourceColor("traffic", "line"),
                "weather",
                getSourceColor("weather", "line"),
                getSourceColor("default", "line"),
            ],
            "line-width": 3,
            "line-opacity": 0.8,
        },
    },

    multiLines: {
        id: "multi-line-layer",
        type: "line",
        filter: ["==", ["geometry-type"], "MultiLineString"],
        paint: {
            "line-color": [
                "match",
                ["get", "_sourceId"],
                "bus",
                getSourceColor("bus", "line"),
                "traffic",
                getSourceColor("traffic", "line"),
                "weather",
                getSourceColor("weather", "line"),
                getSourceColor("default", "line"),
            ],
            "line-width": 3,
            "line-opacity": 0.8,
        },
    },

    polygonFill: {
        id: "polygon-fill-layer",
        type: "fill",
        filter: ["==", ["geometry-type"], "Polygon"],
        paint: {
            "fill-color": [
                "match",
                ["get", "_sourceId"],
                "bus",
                getSourceColor("bus", "fill"),
                "traffic",
                getSourceColor("traffic", "fill"),
                "weather",
                getSourceColor("weather", "fill"),
                getSourceColor("default", "fill"),
            ],
            "fill-opacity": 0.6,
        },
    },

    polygonOutline: {
        id: "polygon-outline-layer",
        type: "line",
        filter: ["==", ["geometry-type"], "Polygon"],
        paint: {
            "line-color": [
                "match",
                ["get", "_sourceId"],
                "bus",
                getSourceColor("bus", "stroke"),
                "traffic",
                getSourceColor("traffic", "stroke"),
                "weather",
                getSourceColor("weather", "stroke"),
                getSourceColor("default", "stroke"),
            ],
            "line-width": 2,
            "line-opacity": 0.8,
        },
    },

    multiPolygonFill: {
        id: "multi-polygon-fill-layer",
        type: "fill",
        filter: ["==", ["geometry-type"], "MultiPolygon"],
        paint: {
            "fill-color": [
                "match",
                ["get", "_sourceId"],
                "bus",
                getSourceColor("bus", "fill"),
                "traffic",
                getSourceColor("traffic", "fill"),
                "weather",
                getSourceColor("weather", "fill"),
                getSourceColor("default", "fill"),
            ],
            "fill-opacity": 0.6,
        },
    },

    multiPolygonOutline: {
        id: "multi-polygon-outline-layer",
        type: "line",
        filter: ["==", ["geometry-type"], "MultiPolygon"],
        paint: {
            "line-color": [
                "match",
                ["get", "_sourceId"],
                "bus",
                getSourceColor("bus", "stroke"),
                "traffic",
                getSourceColor("traffic", "stroke"),
                "weather",
                getSourceColor("weather", "stroke"),
                getSourceColor("default", "stroke"),
            ],
            "line-width": 2,
            "line-opacity": 0.8,
        },
    },
}; 