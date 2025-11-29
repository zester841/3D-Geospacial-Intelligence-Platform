export const generateGeoJSON = (activeDataSources) => {
    if (Object.keys(activeDataSources).length === 0) return null;

    const allFeatures = [];

    Object.entries(activeDataSources).forEach(([sourceId, data]) => {
        if (!data) return;

        if (data.type === "FeatureCollection" && data.features) {
            const processedFeatures = data.features.map((feature) => ({
                ...feature,
                properties: {
                    ...feature.properties,
                    _sourceId: sourceId,
                },
            }));
            allFeatures.push(...processedFeatures);
        } else if (data.type === "Feature" && data.geometry) {
            allFeatures.push({
                ...data,
                properties: {
                    ...data.properties,
                    _sourceId: sourceId,
                },
            });
        } else if (data.geometry) {
            allFeatures.push({
                type: "Feature",
                properties: {
                    ...(data.properties || { id: `feature-${sourceId}` }),
                    _sourceId: sourceId,
                },
                geometry: data.geometry,
            });
        } else if (data.longitude && data.latitude) {
            allFeatures.push({
                type: "Feature",
                properties: {
                    ...data,
                    _sourceId: sourceId,
                },
                geometry: {
                    type: "Point",
                    coordinates: [data.longitude, data.latitude],
                },
            });
        }
    });

    return {
        type: "FeatureCollection",
        features: allFeatures,
    };
};

export const getPointFeatures = (geojsonData) => {
    if (!geojsonData || !geojsonData.features) return [];

    return geojsonData.features.filter(
        (feature) => feature.geometry && feature.geometry.type === "Point"
    );
}; 