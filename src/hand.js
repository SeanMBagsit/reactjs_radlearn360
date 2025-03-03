import React, { useState, useEffect, useRef } from 'react';
import './ankle.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const Hand = () => {
    const [showModel, setShowModel] = useState(false);
    const modelViewerRef = useRef(null);
    const rendererRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const controlsRef = useRef(null);

    // Handle window resize
    const handleResize = () => {
        if (showModel && cameraRef.current && rendererRef.current) {
            const width = window.innerWidth;
            const height = window.innerHeight;
            
            cameraRef.current.aspect = width / height;
            cameraRef.current.updateProjectionMatrix();
            
            rendererRef.current.setSize(width, height);
        }
    };

    useEffect(() => {
        if (showModel) {
            document.body.style.overflow = 'hidden'; // Prevent scroll when model is shown
            
            // Initialize scene
            const scene = new THREE.Scene();
            sceneRef.current = scene;
            
            // Initialize camera
            const camera = new THREE.PerspectiveCamera(
                30,
                window.innerWidth / window.innerHeight,
                0.1,
                1000
            );
            camera.position.set(0, 30, -12);
            cameraRef.current = camera;

            // Initialize renderer
            const renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            rendererRef.current = renderer;
            
            if (modelViewerRef.current) {
                modelViewerRef.current.innerHTML = '';
                modelViewerRef.current.appendChild(renderer.domElement);
            }

            // Add lights
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
            scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
            directionalLight.position.set(1.5, 80, 0.5);
            directionalLight.castShadow = true;
            scene.add(directionalLight);

            const loader = new GLTFLoader();

            // Load hand model in static position
            loader.load(
                '/models/hand.glb',
                (glb) => {
                    const loadedHandModel = glb.scene;
                    loadedHandModel.traverse((child) => {
                        if (child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    });
                    // Set hand to target position directly
                    loadedHandModel.position.set(.2, -10, 0);
                    scene.add(loadedHandModel);
                },
                undefined,
                (error) => {
                    console.error('Error loading hand model:', error);
                }
            );

            // Load X-ray model
            loader.load(
                '/models/xray.glb',
                (glb) => {
                    const loadedXrayModel = glb.scene;
                    loadedXrayModel.traverse((child) => {
                        if (child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    });
                    loadedXrayModel.position.set(0, -10, 0);
                    scene.add(loadedXrayModel);
                },
                undefined,
                (error) => {
                    console.error('Error loading xray model:', error);
                }
            );

            // Setup OrbitControls for camera manipulation
            const controls = new OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.25;
            controls.screenSpacePanning = false;
            controls.maxPolarAngle = Math.PI / 2;
            controlsRef.current = controls;

            // Add event listener for window resize
            window.addEventListener('resize', handleResize);

            const animate = () => {
                if (!showModel) return;
                
                requestAnimationFrame(animate);
                if (controlsRef.current) controlsRef.current.update();
                if (rendererRef.current && sceneRef.current && cameraRef.current) {
                    rendererRef.current.render(sceneRef.current, cameraRef.current);
                }
            };
            animate();

            // Cleanup function
            return () => {
                window.removeEventListener('resize', handleResize);
                document.body.style.overflow = 'auto'; // Restore scroll
                
                if (rendererRef.current) rendererRef.current.dispose();
                if (controlsRef.current) controlsRef.current.dispose();
                
                // Clear references
                rendererRef.current = null;
                sceneRef.current = null;
                cameraRef.current = null;
                controlsRef.current = null;
            };
        }
    }, [showModel]);

    const handleClick = () => {
        setShowModel(true);
    };

    const closeModel = () => {
        setShowModel(false);
    };

    return (
        <div>
            <main className="contentmodels">
                <div className="procedure-container">
                    <div className="image-section">
                        <div className="black-box" onClick={handleClick}>
                            <img src="/pics/hand.png" alt="Hand Image" className="black-box-image" />
                            <p>Click to View 3D Model</p>
                        </div>
                    </div>
                    <div className="text-section">
                        <h2>Clinical Details:</h2>
                        <div className="scrollable-box">
                            <h3>Clinical Indications:</h3>
                            <ul className="highlighted-list">
                                <li>Fractures, dislocations, or foreign bodies of the phalanges, metacarpals, and all joints of the hand.</li>
                                <li>Pathologic processes such as osteoporosis and osteoarthritis.</li>
                            </ul>
                            <h3>Technical Factors:</h3>
                            <ul className="technical-details">
                                <li><strong>Minimum SID:</strong> 40 inches (100 cm).</li>
                                <li><strong>IR size:</strong> 10 x 12 inches (24 x 30 cm), portrait; collimate to area of interest.</li>
                                <li><strong>kVp range:</strong> 55 to 65.</li>
                                <li><strong>Shielding:</strong> Shield radiosensitive tissues outside the region of interest.</li>
                            </ul>
                            <h3>Shielding:</h3>
                            <p>Shield radiosensitive tissues outside region of interest.</p>
                            <h3>Patient Position:</h3>
                            <p>Seat patient at the end of the table with hand and forearm extended.</p>
                            <h3>Part Position:</h3>
                            <ul>
                                <li>Pronate hand with palmar surface in contact with IR; spread fingers slightly.</li>
                                <li>Align the long axis of hand and forearm with the long axis of IR.</li>
                                <li>Center hand and wrist to IR.</li>
                            </ul>
                            <h3>CR:</h3>
                            <p>CR perpendicular to IR, directed to third MCP joint.</p>
                            <h3>Recommended Collimation:</h3>
                            <p>Collimate on four sides to the outer margins of hand and wrist.</p>
                            <h3>Note:</h3>
                            <p>If examinations of both hands or wrists are requested, the body parts should be positioned and exposed separately for correct CR placement.</p>
                        </div>
                    </div>
                </div>
            </main>

            {showModel && (
                <div
                    id="model-viewer-container"
                    className="model-viewer-container"
                >
                    <button
                        onClick={closeModel}
                        className="close-model-btn"
                        aria-label="Close model viewer"
                    >
                        X
                    </button>

                    <div
                        id="model-viewer"
                        ref={modelViewerRef}
                        className="model-viewer"
                    ></div>
                </div>
            )}
        </div>
    );
};

export default Hand;