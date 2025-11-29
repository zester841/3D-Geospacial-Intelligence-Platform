import React, { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = 'pk.eyJ1IjoiYXl1c2g2OTY5IiwiYSI6ImNtOWU0Y25uZzA4emIyanNjeGR3Z3Nwb3QifQ.17wYqmuPbNyz6aSY9-YolA';

const Map3D = () => {
  const mapContainerRef = useRef(null);
  const [geojsonData, setGeojsonData] = useState(null);
  const [map, setMap] = useState(null);
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [models, setModels] = useState([]); 
  const [selectedModel, setSelectedModel] = useState(null); 
  const tbRef = useRef(null);

  const clearMarkers = () => {
    markers.forEach(marker => marker.remove());
    setMarkers([]);
  };

  const addMarkersToMap = (data, mapInstance) => {
    const newMarkers = [];
    data.features.forEach((feature, index) => {
      const { coordinates } = feature.geometry;

      const marker = new mapboxgl.Marker({ draggable: true })
        .setLngLat(coordinates)
        .setPopup(new mapboxgl.Popup().setHTML(`<strong>${feature.properties.location || 'Marker'}</strong>`))
        .addTo(mapInstance);

      marker.on('dragend', () => {
        const lngLat = marker.getLngLat();
        data.features[index].geometry.coordinates = [lngLat.lng, lngLat.lat];
        setGeojsonData({ ...data });
      });

      newMarkers.push(marker);
    });
    setMarkers(newMarkers);
  };

  const handleGeoJsonUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.type !== 'FeatureCollection') throw new Error('Invalid GeoJSON');
        setGeojsonData(data);
        clearMarkers();
        if (map) addMarkersToMap(data, map);
      } catch (error) {
        alert('Error parsing GeoJSON: ' + error.message);
      }
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadThreebox = async () => {
      await new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/threebox-plugin@2.2.1/dist/threebox.min.js';
        script.onload = resolve;
        document.body.appendChild(script);
      });

      const mapInstance = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [-73.98, 40.71],
        zoom: 16,
        pitch: 60,
        bearing: 0,
        antialias: true,
      });

      mapInstance.on('click', (e) => {
        setSelectedCoords([e.lngLat.lng, e.lngLat.lat]);
        setSelectedModel(null); 
      });

      mapInstance.on('style.load', async () => {
        const tbInstance = new window.Threebox(
          mapInstance,
          mapInstance.getCanvas().getContext('webgl'),
          {
            defaultLights: true,
            enableSelectingObjects: true,
            enableDraggingObjects: true,
            enableRotatingObjects: true,
            enableTooltips: true,
          }
        );

        const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
        directionalLight.position.set(0, 10, 10);
        tbInstance.scene.add(ambientLight);
        tbInstance.scene.add(directionalLight);

        tbRef.current = tbInstance;
        window.tb = tbInstance;

        mapInstance.addLayer(
          {
            id: '3d-buildings',
            source: 'composite',
            'source-layer': 'building',
            filter: ['==', 'extrude', 'true'],
            type: 'fill-extrusion',
            minzoom: 15,
            paint: {
              'fill-extrusion-color': '#aaa',
              'fill-extrusion-height': [
                'interpolate', ['linear'], ['zoom'], 15, 0, 15.05, ['get', 'height'],
              ],
              'fill-extrusion-base': [
                'interpolate', ['linear'], ['zoom'], 15, 0, 15.05, ['get', 'min_height'],
              ],
              'fill-extrusion-opacity': 0.6,
            },
          }
        );
      });

      mapInstance.on('render', () => {
        if (tbRef.current) tbRef.current.update();
      });

      setMap(mapInstance);
      return () => mapInstance.remove();
    };

    loadThreebox();
  }, []);

  useEffect(() => {
    if (map && geojsonData) {
      clearMarkers();
      addMarkersToMap(geojsonData, map);
    }
  }, [geojsonData]);

  const handleModelUpload = (event) => {
    const file = event.target.files[0];
    if (!file || !tbRef.current || !selectedCoords) {
      alert('Please click on the map first to select a location!');
      return;
    }

    const modelUrl = URL.createObjectURL(file);
    tbRef.current.loadObj({
      obj: modelUrl,
      type: 'gltf',
      scale: 20,
      units: 'meters',
      rotation: { x: 90, y: 0, z: 0 },
    }, (model) => {
      model.setCoords(selectedCoords);
      tbRef.current.add(model);
      model.userData = { fileName: file.name };

      // 🔥 Add interaction
      model.addEventListener('click', () => {
        if (selectedModel) selectedModel.traverse(obj => obj.material && (obj.material.emissiveIntensity = 0));
        model.traverse(obj => obj.material && (obj.material.emissiveIntensity = 1));
        setSelectedModel(model);
      });

      setModels(prev => [...prev, model]);
      URL.revokeObjectURL(modelUrl);
    });
  };

  const deleteSelectedModel = () => {
    if (selectedModel && tbRef.current) {
      tbRef.current.remove(selectedModel);
      setModels(prev => prev.filter(m => m !== selectedModel));
      setSelectedModel(null);
    }
  };

  const clearAllModels = () => {
    models.forEach(model => tbRef.current.remove(model));
    setModels([]);
    setSelectedModel(null);
  };

  const downloadGeoJSON = () => {
    if (!geojsonData) return;
    const blob = new Blob([JSON.stringify(geojsonData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'custom-map-data.geojson';
    link.click();
  };

  return (
    <>
      <Head>
        <script src="https://unpkg.com/threebox-plugin@2.2.1/dist/threebox.min.js" />
        <link href="https://unpkg.com/threebox-plugin@2.2.1/dist/threebox.css" rel="stylesheet" />
      </Head>

      <div className="w-screen h-screen flex flex-row">
        <div className="w-80 h-full bg-zinc-900 overflow-y-auto flex flex-col gap-6 p-4 shadow-md text-gray-200">
          {selectedCoords && (
            <div className="text-sm text-gray-400">
              <strong>Selected location:</strong><br />
              {selectedCoords[0].toFixed(5)}, {selectedCoords[1].toFixed(5)}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Upload GeoJSON</label>
            <label className="block">
  <div className="relative overflow-hidden inline-block">
    <button className="bg-green-900 text-green-300 hover:bg-green-800 py-2 px-4 rounded">
      Browse
    </button>
    <input
      type="file"
      accept=".geojson,.json"
      onChange={handleGeoJsonUpload}
      className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
    />
  </div>
</label>

          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Upload 3D Model</label>
            <label className="block">
  <div className="relative overflow-hidden inline-block">
    <button className="bg-blue-900 text-blue-300 hover:bg-blue-800 py-2 px-4 rounded">
      Browse
    </button>
    <input
      type="file"
      accept=".glb,.gltf"
      onChange={handleModelUpload}
      className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
    />
  </div>
</label>

          </div>

          {selectedModel && (
            <button onClick={deleteSelectedModel} className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-600 transition">
              Delete Selected Model
            </button>
          )}

          {models.length > 0 && (
            <button onClick={clearAllModels} className="bg-yellow-700 text-white px-4 py-2 rounded hover:bg-yellow-600 transition">
              Clear All Models
            </button>
          )}

          {geojsonData && (
            <button onClick={downloadGeoJSON}
              className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
              Download GeoJSON
            </button>
          )}
        </div>

        <div ref={mapContainerRef} className="flex-1 h-full" />
      </div>
    </>
  );
};

export default Map3D;
