import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
import { FiBox, FiCircle, FiCylinder, FiMove, FiRotate, FiZoomIn, FiDownload, FiSave, FiTrash2, FiSliders, FiType, FiAlignLeft } from 'react-icons/fi';
import { LuCylinder } from "react-icons/lu";
import { FaCircle, FaRegCircle } from "react-icons/fa";
import { ToastContainer, toast } from 'react-toastify';
import { BiSolidCylinder } from "react-icons/bi";
import { IoCube } from "react-icons/io5";
import { TbConeFilled } from "react-icons/tb";
import 'react-toastify/dist/ReactToastify.css';
import './ModelCreator.css';
import Link from 'next/link';

const ModelCreator = () => {
    const mountRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const rendererRef = useRef(null);
    const controlsRef = useRef(null);
    const transformControlsRef = useRef(null);
    const objectsRef = useRef([]);
    const selectedObjectRef = useRef(null);
    const raycasterRef = useRef(new THREE.Raycaster());
    const mouseRef = useRef(new THREE.Vector2());

    const [transformMode, setTransformMode] = useState('translate');
    const [selectedObject, setSelectedObject] = useState(null);
    const [materialType, setMaterialType] = useState('standard');
    const [materialProps, setMaterialProps] = useState({
        color: '#00ff00',
        roughness: 0.5,
        metalness: 0.0
    });
    const [modelName, setModelName] = useState('Untitled Model');
    const [modelDescription, setModelDescription] = useState('');
    const [activePanel, setActivePanel] = useState('properties');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    useEffect(() => {
        if (!mountRef.current) return;

        // Refs initialization
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x111111);
        sceneRef.current = scene;

        // Camera setup
        const camera = new THREE.PerspectiveCamera(
            75,
            mountRef.current.clientWidth / mountRef.current.clientHeight,
            0.1,
            1000
        );
        camera.position.set(2, 2, 5);
        cameraRef.current = camera;

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        renderer.shadowMap.enabled = true;
        rendererRef.current = renderer;

        // Add renderer to DOM
        const rendererDom = renderer.domElement;
        mountRef.current.appendChild(rendererDom);

        // OrbitControls setup
        const controls = new OrbitControls(camera, rendererDom);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controlsRef.current = controls;

        // TransformControls with initialization check
        const initTransformControls = () => {
            try {
                const transformControls = new TransformControls(camera, rendererDom);
                transformControls.addEventListener('dragging-changed', (event) => {
                    controls.enabled = !event.value;
                });

                if (transformControls && transformControls.isObject3D) {
                    scene.add(transformControls);
                    transformControlsRef.current = transformControls;
                } else {
                    console.warn('TransformControls initialization failed - retrying...');
                    setTimeout(initTransformControls, 100);
                }
            } catch (error) {
                console.error('TransformControls error:', error);
            }
        };

        // Initialize with slight delay to ensure everything is ready
        const transformInitTimeout = setTimeout(initTransformControls, 50);

        // Helpers
        const gridHelper = new THREE.GridHelper(20, 20);
        scene.add(gridHelper);

        const axesHelper = new THREE.AxesHelper(5);
        scene.add(axesHelper);

        // Lights
        const ambientLight = new THREE.AmbientLight(0x404040);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 10, 7.5);
        directionalLight.castShadow = true;
        scene.add(directionalLight);

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        const animationId = requestAnimationFrame(animate);

        // Resize handler
        const handleResize = () => {
            const width = mountRef.current.clientWidth;
            const height = mountRef.current.clientHeight;

            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };
        window.addEventListener('resize', handleResize);

        // Object selection
        const handleClick = (event) => {
            const bounds = mountRef.current.getBoundingClientRect();
            mouseRef.current.x = ((event.clientX - bounds.left) / mountRef.current.clientWidth) * 2 - 1;
            mouseRef.current.y = -((event.clientY - bounds.top) / mountRef.current.clientHeight) * 2 + 1;

            raycasterRef.current.setFromCamera(mouseRef.current, camera);
            const intersects = raycasterRef.current.intersectObjects(objectsRef.current);

            if (intersects.length > 0) {
                selectObject(intersects[0].object);
            } else {
                deselectObject();
            }
        };
        rendererDom.addEventListener('click', handleClick);

        // Cleanup
        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', handleResize);
            rendererDom.removeEventListener('click', handleClick);

            if (mountRef.current && rendererDom.parentNode === mountRef.current) {
                mountRef.current.removeChild(rendererDom);
            }

            clearTimeout(transformInitTimeout);

            // Dispose of Three.js objects
            renderer.dispose();
            controls.dispose();
            if (transformControlsRef.current) {
                transformControlsRef.current.dispose();
            }
        };
    }, []); // Empty dependency array means this runs once on mount

    // Update transform controls mode when mode changes
    useEffect(() => {
        if (transformControlsRef.current) {
            transformControlsRef.current.setMode(transformMode);
        }
    }, [transformMode]);

    const selectObject = (object) => {
        // Skip if no object or it's a helper
        if (!object || object.type === 'GridHelper' || object.type === 'AxesHelper') {
            return;
        }
    
        // Remove highlight from previous selection
        if (selectedObjectRef.current?.material?.emissive) {
            selectedObjectRef.current.material.emissive.setHex(0x000000);
        }
    
        // Highlight new selection
        selectedObjectRef.current = object;
        if (object.material?.emissive) {
            object.material.emissive.setHex(0x555555);
        }
    
        // Update state for UI
        setSelectedObject({
            id: object.id,
            position: { ...object.position },
            rotation: { ...object.rotation },
            scale: { ...object.scale },
            color: object.material ? '#' + object.material.color.getHexString() : '#ffffff'
        });
    
        // Safely attach transform controls with retry logic
        const attachTransformControls = () => {
            if (transformControlsRef.current) {
                try {
                    transformControlsRef.current.attach(object);
                    setActivePanel('properties');
                } catch (error) {
                    console.error('Error attaching transform controls:', error);
                    // Retry after a short delay
                    setTimeout(attachTransformControls, 100);
                }
            } else {
                console.warn('Transform controls not ready - retrying...');
                setTimeout(attachTransformControls, 100);
            }
        };
    
        attachTransformControls();
    };

    // Deselect object function
    const deselectObject = () => {
        if (selectedObjectRef.current) {
            if (selectedObjectRef.current.material && selectedObjectRef.current.material.emissive) {
                selectedObjectRef.current.material.emissive.setHex(0x000000);
            }
            selectedObjectRef.current = null;
            setSelectedObject(null);
            transformControlsRef.current.detach();
        }
    };

    // Add cube function
    const addCube = () => {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = createMaterial(materialType, materialProps);
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(0, 0.5, 0);
        cube.castShadow = true;
        cube.receiveShadow = true;
        sceneRef.current.add(cube);
        objectsRef.current.push(cube);
        selectObject(cube);
        toast.success('Cube added to scene');
    };

    // Add sphere function
    const addSphere = () => {
        const geometry = new THREE.SphereGeometry(0.5, 32, 32);
        const material = createMaterial(materialType, materialProps);
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(0, 0.5, 0);
        sphere.castShadow = true;
        sphere.receiveShadow = true;
        sceneRef.current.add(sphere);
        objectsRef.current.push(sphere);
        selectObject(sphere);
        toast.success('Sphere added to scene');
    };

    // Add Cone function
    const addCone = () => {
        const geometry = new THREE.ConeGeometry(0.5, 1, 32);
        const material = createMaterial(materialType, materialProps);
        const cone = new THREE.Mesh(geometry, material);
        cone.position.set(0, 0.5, 0);
        cone.castShadow = true;
        cone.receiveShadow = true;
        sceneRef.current.add(cone);
        objectsRef.current.push(cone);
        selectObject(cone);
        toast.success('Cone added to scene');
    };

    // Add cylinder function
    const addCylinder = () => {
        const geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
        const material = createMaterial(materialType, materialProps);
        const cylinder = new THREE.Mesh(geometry, material);
        cylinder.position.set(0, 0.5, 0);
        cylinder.castShadow = true;
        cylinder.receiveShadow = true;
        sceneRef.current.add(cylinder);
        objectsRef.current.push(cylinder);
        selectObject(cylinder);
        toast.success('Cylinder added to scene');
    };

    // Create material function
    const createMaterial = (type, props) => {
        let material;
        const materialProps = {
            ...props,
            color: new THREE.Color(props.color)
        };

        switch (type) {
            case 'standard':
                material = new THREE.MeshStandardMaterial(materialProps);
                break;
            case 'phong':
                material = new THREE.MeshPhongMaterial(materialProps);
                break;
            case 'basic':
                material = new THREE.MeshBasicMaterial(materialProps);
                break;
            case 'lambert':
                material = new THREE.MeshLambertMaterial(materialProps);
                break;
            default:
                material = new THREE.MeshStandardMaterial(materialProps);
        }
        return material;
    };

    // Apply material to selected object
    const applyMaterial = () => {
        if (selectedObjectRef.current) {
            const newMaterial = createMaterial(materialType, materialProps);
            selectedObjectRef.current.material = newMaterial;

            // Update selected object state to reflect new material
            setSelectedObject(prev => ({
                ...prev,
                color: materialProps.color
            }));
            toast.success('Material applied');
        }
    };

    // Update object position
    const updatePosition = (axis, value) => {
        if (selectedObjectRef.current) {
            selectedObjectRef.current.position[axis] = parseFloat(value);
            setSelectedObject(prev => ({
                ...prev,
                position: {
                    ...prev.position,
                    [axis]: parseFloat(value)
                }
            }));
        }
    };

    // Update object rotation
    const updateRotation = (axis, value) => {
        if (selectedObjectRef.current) {
            selectedObjectRef.current.rotation[axis] = parseFloat(value);
            setSelectedObject(prev => ({
                ...prev,
                rotation: {
                    ...prev.rotation,
                    [axis]: parseFloat(value)
                }
            }));
        }
    };

    // Update object scale
    const updateScale = (axis, value) => {
        if (selectedObjectRef.current) {
            selectedObjectRef.current.scale[axis] = parseFloat(value);
            setSelectedObject(prev => ({
                ...prev,
                scale: {
                    ...prev.scale,
                    [axis]: parseFloat(value)
                }
            }));
        }
    };

    // Delete selected object
    const deleteSelectedObject = () => {
        if (selectedObjectRef.current) {
            sceneRef.current.remove(selectedObjectRef.current);
            objectsRef.current = objectsRef.current.filter(obj => obj !== selectedObjectRef.current);
            deselectObject();
            toast.success('Object deleted');
        }
    };

    // Export model
    const exportModel = () => {
        const exporter = new GLTFExporter();
        exporter.parse(
            sceneRef.current,
            (gltf) => {
                if (gltf instanceof ArrayBuffer) {
                    saveArrayBuffer(gltf, `${modelName}.glb`);
                } else {
                    const output = JSON.stringify(gltf, null, 2);
                    saveString(output, `${modelName}.gltf`);
                }
                toast.success('Model exported successfully!');
            },
            (error) => {
                console.error('An error occurred while exporting:', error);
                toast.error('Error exporting model');
            },
            { binary: true }
        );
    };

    // Save array buffer to file
    const saveArrayBuffer = (buffer, filename) => {
        const blob = new Blob([buffer], { type: 'application/octet-stream' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    };

    // Save string to file
    const saveString = (text, filename) => {
        const blob = new Blob([text], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    };

    // Save to model library
    const saveToLibrary = async () => {
        // Generate thumbnail
        const thumbnailDataURL = rendererRef.current.domElement.toDataURL('image/png');

        // Export model data (GLB format)
        const exporter = new GLTFExporter();
        exporter.parse(
            sceneRef.current,
            async (gltf) => {
                try {
                    // Convert gltf to base64 string for storage
                    let modelData;
                    if (gltf instanceof ArrayBuffer) {
                        const binary = Array.from(new Uint8Array(gltf))
                            .map(b => String.fromCharCode(b))
                            .join('');
                        modelData = btoa(binary);
                    } else {
                        modelData = btoa(JSON.stringify(gltf));
                    }

                    // Create model metadata
                    const modelDataObj = {
                        name: modelName,
                        description: modelDescription,
                        createdAt: new Date().toISOString(),
                        thumbnail: thumbnailDataURL,
                        modelData: modelData,
                        format: gltf instanceof ArrayBuffer ? 'glb' : 'gltf'
                    };

                    // Here you would typically send to your backend
                    console.log('Model saved:', modelDataObj);
                    toast.success('Model saved to library!');
                } catch (error) {
                    console.error('Error saving model:', error);
                    toast.error('Error saving model to library');
                }
            },
            (error) => {
                console.error('An error occurred while exporting:', error);
                toast.error('Error preparing model for library');
            },
            { binary: true }
        );
    };

    return (
        <div className="model-creator-container">
            <ToastContainer
                position="bottom-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />

            {/* Top Navigation Bar */}
            <div className="top-nav">
                <div className="logo" style={{ display: "flex", gap: "10px" }}><Link href="/">&larr;</Link>3D Model Creator</div>
                <div className="nav-actions">
                    <button className="btn btn-primary" onClick={exportModel}>
                        <FiDownload className="icon" /> Export
                    </button>
                    <button className="btn btn-primary" onClick={saveToLibrary}>
                        <FiSave className="icon" /> Save
                    </button>
                </div>
            </div>

            <div className="main-content">
                {/* Left Sidebar */}
                <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
                    <div className="sidebar-header">
                        <h3>Tools</h3>
                        <button
                            className="collapse-btn"
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        >
                            {sidebarCollapsed ? '>' : '<'}
                        </button>
                    </div>

                    {!sidebarCollapsed && (
                        <>
                            <div className="sidebar-section">
                                <h4>Primitives</h4>
                                <div className="tool-grid">
                                    <button className="tool-btn" onClick={addCube}>
                                        <IoCube className="tool-icon" />
                                        <span>Cube</span>
                                    </button>
                                    <button className="tool-btn" onClick={addSphere}>
                                        <FaCircle className="tool-icon" />
                                        <span>Sphere</span>
                                    </button>
                                    <button className="tool-btn" onClick={addCylinder}>
                                        <BiSolidCylinder className="tool-icon" />
                                        <span>Cylinder</span>
                                    </button>
                                    <button className="tool-btn" onClick={addCone}>
                                        <TbConeFilled className="tool-icon" />
                                        <span>Cone</span>
                                    </button>
                                </div>
                            </div>

                            <div className="sidebar-section">
                                <h4>Transform</h4>
                                <div className="transform-controls">
                                    <button
                                        className={`transform-btn ${transformMode === 'translate' ? 'active' : ''}`}
                                        onClick={() => setTransformMode('translate')}
                                    >
                                        {/* <FiMove className="icon" /> */}
                                        <span>Move</span>
                                    </button>
                                    <button
                                        className={`transform-btn ${transformMode === 'rotate' ? 'active' : ''}`}
                                        onClick={() => setTransformMode('rotate')}
                                    >
                                        {/* <FiRotate className="icon" /> */}
                                        <span>Rotate</span>
                                    </button>
                                    <button
                                        className={`transform-btn ${transformMode === 'scale' ? 'active' : ''}`}
                                        onClick={() => setTransformMode('scale')}
                                    >
                                        <FiZoomIn className="icon" />
                                        <span>Scale</span>
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Main Canvas Area */}
                <div className="canvas-container">
                    <div className="model-canvas" ref={mountRef}></div>
                </div>

                {/* Right Panel */}
                <div className="right-panel">
                    <div className="panel-tabs">
                        <button
                            className={`tab-btn ${activePanel === 'properties' ? 'active' : ''}`}
                            onClick={() => setActivePanel('properties')}
                        >
                            <FiSliders className="icon" /> Properties
                        </button>
                        <button
                            className={`tab-btn ${activePanel === 'model-info' ? 'active' : ''}`}
                            onClick={() => setActivePanel('model-info')}
                        >
                            <FiType className="icon" /> Model Info
                        </button>
                    </div>

                    <div className="panel-content">
                        {activePanel === 'model-info' ? (
                            <div className="model-info">
                                <div className="form-group">
                                    <label>Model Name</label>
                                    <input
                                        type="text"
                                        value={modelName}
                                        onChange={(e) => setModelName(e.target.value)}
                                        placeholder="Enter model name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        value={modelDescription}
                                        onChange={(e) => setModelDescription(e.target.value)}
                                        placeholder="Enter model description"
                                        rows="4"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="properties-content">
                                {selectedObject ? (
                                    <>
                                        <div className="property-section">
                                            <h4>Transform</h4>
                                            <div className="transform-inputs">
                                                <div className="input-group">
                                                    <label>Position</label>
                                                    <div className="vector-input">
                                                        <div className="input-bhai">
                                                            <h2>X: </h2>
                                                            <input
                                                                type="number"
                                                                value={selectedObject.position.x}
                                                                onChange={(e) => updatePosition('x', e.target.value)}
                                                                step="0.1"
                                                                placeholder="X"
                                                            />
                                                        </div><div className="input-bhai">
                                                            <h2>Y: </h2>
                                                            <input
                                                                type="number"
                                                                value={selectedObject.position.y}
                                                                onChange={(e) => updatePosition('y', e.target.value)}
                                                                step="0.1"
                                                                placeholder="Y"
                                                            />
                                                        </div><div className="input-bhai">
                                                            <h2>Z: </h2>
                                                            <input
                                                                type="number"
                                                                value={selectedObject.position.z}
                                                                onChange={(e) => updatePosition('z', e.target.value)}
                                                                step="0.1"
                                                                placeholder="Z"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="input-group">
                                                    <label>Rotation</label>
                                                    <div className="vector-input">
                                                        <div className="input-bhai">
                                                            <h2>X: </h2>
                                                            <input
                                                                type="number"
                                                                value={selectedObject.rotation.x}
                                                                onChange={(e) => updateRotation('x', e.target.value)}
                                                                step="0.1"
                                                                placeholder="X"
                                                            />
                                                        </div>
                                                        <div className="input-bhai">
                                                            <h2>Y: </h2>
                                                            <input
                                                                type="number"
                                                                value={selectedObject.rotation.y}
                                                                onChange={(e) => updateRotation('y', e.target.value)}
                                                                step="0.1"
                                                                placeholder="Y"
                                                            />
                                                        </div><div className="input-bhai">
                                                            <h2>Z: </h2>
                                                            <input
                                                                type="number"
                                                                value={selectedObject.rotation.z}
                                                                onChange={(e) => updateRotation('z', e.target.value)}
                                                                step="0.1"
                                                                placeholder="Z"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="input-group">
                                                    <label>Scale</label>
                                                    <div className="vector-input">
                                                        <div className="input-bhai">
                                                            <h2>X: </h2>
                                                            <input
                                                                type="number"
                                                                value={selectedObject.scale.x}
                                                                onChange={(e) => updateScale('x', e.target.value)}
                                                                step="0.1"
                                                                min="0.1"
                                                                placeholder="X"
                                                            />
                                                        </div>
                                                        <div className="input-bhai">
                                                            <h2>Y: </h2>
                                                            <input
                                                                type="number"
                                                                value={selectedObject.scale.y}
                                                                onChange={(e) => updateScale('y', e.target.value)}
                                                                step="0.1"
                                                                min="0.1"
                                                                placeholder="Y"
                                                            />
                                                        </div>
                                                        <div className="input-bhai">
                                                            <h2>Z: </h2>
                                                            <input
                                                                type="number"
                                                                value={selectedObject.scale.z}
                                                                onChange={(e) => updateScale('z', e.target.value)}
                                                                step="0.1"
                                                                min="0.1"
                                                                placeholder="Z"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="property-section">
                                            <h4>Material</h4>
                                            <div className="material-controls">
                                                <div className="form-group">
                                                    <label>Type</label>
                                                    <select
                                                        value={materialType}
                                                        onChange={(e) => setMaterialType(e.target.value)}
                                                    >
                                                        <option value="standard">Standard</option>
                                                        <option value="phong">Phong</option>
                                                        <option value="basic">Basic</option>
                                                        <option value="lambert">Lambert</option>
                                                    </select>
                                                </div>

                                                <div className="form-group">
                                                    <label>Color</label>
                                                    <div className="color-picker">
                                                        <input
                                                            type="color"
                                                            value={materialProps.color}
                                                            onChange={(e) => setMaterialProps(prev => ({ ...prev, color: e.target.value }))}
                                                        />
                                                        <span>{materialProps.color.toUpperCase()}</span>
                                                    </div>
                                                </div>

                                                {materialType === 'standard' && (
                                                    <>
                                                        <div className="form-group">
                                                            <label>Roughness: {materialProps.roughness.toFixed(2)}</label>
                                                            <input
                                                                type="range"
                                                                min="0"
                                                                max="1"
                                                                step="0.01"
                                                                value={materialProps.roughness}
                                                                onChange={(e) => setMaterialProps(prev => ({ ...prev, roughness: parseFloat(e.target.value) }))}
                                                            />
                                                        </div>

                                                        <div className="form-group">
                                                            <label>Metalness: {materialProps.metalness.toFixed(2)}</label>
                                                            <input
                                                                type="range"
                                                                min="0"
                                                                max="1"
                                                                step="0.01"
                                                                value={materialProps.metalness}
                                                                onChange={(e) => setMaterialProps(prev => ({ ...prev, metalness: parseFloat(e.target.value) }))}
                                                            />
                                                        </div>
                                                    </>
                                                )}

                                                <button className="btn btn-secondary" onClick={applyMaterial}>
                                                    Apply Material
                                                </button>
                                            </div>
                                        </div>

                                        <div className="property-section">
                                            <button className="btn btn-danger" onClick={deleteSelectedObject}>
                                                <FiTrash2 className="icon" /> Delete Object
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="no-selection">
                                        <div className="empty-state">
                                            <FiAlignLeft className="empty-icon" />
                                            <h4>No Object Selected</h4>
                                            <p>Select an object to view and edit its properties</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModelCreator;
