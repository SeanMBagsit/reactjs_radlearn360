import React, { useState, useEffect, useRef } from 'react';
import './ankle.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const Elbow = () => {
    const [showModel, setShowModel] = useState(false);
        const modelViewerRef = useRef(null);
        const rendererRef = useRef(null);
        const sceneRef = useRef(null);
        const cameraRef = useRef(null);
        const controlsRef = useRef(null);
    
     // State to manage modal visibility
        const [isModalOpen, setIsModalOpen] = useState(false);
    
        // Function to open the modal
        const openModal = () => {
            setIsModalOpen(true);
        };
    
        // Function to close the modal
        const closeModal = () => {
            setIsModalOpen(false);
        };
    
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
        document.body.style.overflow = 'hidden'; // Prevent scroll when model is shown
        if (showModel) {
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(
                30,
                window.innerWidth / window.innerHeight,
                0.1,
                1000
            );
            camera.position.set(0, 30, -12);

            const renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            modelViewerRef.current.appendChild(renderer.domElement);

            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
            scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
            directionalLight.position.set(1.5, 80, 0.5);
            directionalLight.castShadow = true;
            scene.add(directionalLight);

            const loader = new GLTFLoader();

            // Load hand model in static position
            loader.load(
                '/models/elbow.glb',
                (glb) => {
                    const loadedHandModel = glb.scene;
                    loadedHandModel.traverse((child) => {
                        if (child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    });
            
                    // Adjust the scale here
                    loadedHandModel.scale.set(5, 5, 5); // Set desired scale
            
                    // Set rotation: x = 0 degrees, y = 0 degrees, z = -100 degrees
                    loadedHandModel.rotation.set(0, 0, -Math.PI); // -Math.PI is -180 degrees in radians
            
                    loadedHandModel.position.set(7.5, -3.5, 1);
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

            const animate = () => {
                requestAnimationFrame(animate);
                controls.update();
                renderer.render(scene, camera);
            };
            animate();

            return () => {
                renderer.dispose();
                controls.dispose();
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
                    {/* Image Section with 3D Model */}
                    <div className="image-section">
                        <div className="black-box" onClick={handleClick}>
                            <img src="/pics/elbow.png" alt="Elbow Image" className="black-box-image" />
                            <p>Click to View 3D Model</p>
                        </div>
                    </div>

                    {/* Image Section with Demo Video */}
                    <div className="image-section">
                        <div className="black-box" onClick={openModal}>
                            <img src="/pics/elbow.png" alt="Elbow Image" className="black-box-image" />
                            <p>Click to View Demo Video</p>
                        </div>
                    </div>

                    {/* Text Section */}
                    <div className="text-section">
                    <h2>Clinical Details:</h2>
                    <div className="scrollable-box">
                        <h3>Clinical Indications:</h3>
                        <ul className="highlighted-list">
                            <li>Fractures and dislocations of the elbow</li>
                            <li>Pathologic processes, such as osteomyelitis and arthritis</li>
                        </ul>
                        <h3>Technical Factors:</h3>
                        <ul className="technical-details">
                            <li><strong>Minimum SID:</strong> 40 inches (100 cm).</li>
                            <li><strong>IR size:</strong> 10 x 12 inches (24 x 30 cm), portrait; smallest IR available and collimate to area of interest.</li>
                            <li><strong>Nongrid</strong></li>
                            <li><strong>kVp range:</strong> 65 to 75.</li>
                        </ul>
                        <h3>Shielding:</h3>
                        <p>Shield radiosensitive tissues outside the region of interest.</p>
                        <h3>Patient Position:</h3>
                        <p>Seat patient at the end of the table, with elbow fully extended, if possible. (See following page if the patient cannot fully extend the elbow.)</p>
                        <h3>Part Position:</h3>
                        <ul>
                            <li>Extend elbow, supinate hand, and align arm and forearm with the long axis of IR.</li>
                            <li>Center elbow joint to the center of IR.</li>
                            <li>Ask the patient to lean laterally as necessary for true AP projection. Palpate humeral epicondyles to ensure that the interepicondylar plane is parallel to the IR. (The interepicondylar plane is an imaginary plane between the medial and lateral epicondyles of the distal humerus. This plane is useful for elbow and humerus positioning.)</li>
                            <li>Support hand as needed to prevent motion.</li>
                        </ul>
                        <h3>CR:</h3>
                        <p>CR perpendicular to IR, directed to mid-elbow joint, which is approximately 3/4 inch (2 cm) distal to the midpoint of a line between epicondyles.</p>
                        <h3>Recommended Collimation:</h3>
                        <p>Collimate on four sides to the area of interest.</p>
                    </div>
                    </div>
                </div>
            </main>

            {/* Modal for 3D Model */}
            {showModel && (
                <div
                    id="model-viewer-container"
                    style={{
                        width: '100%',
                        height: '100vh',
                        backgroundColor: 'black',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        zIndex: 10,
                    }}
                >
                    <button
                        onClick={closeModel}
                        style={{
                            position: 'absolute',
                            top: '20px',
                            right: '20px',
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: 'white',
                            fontSize: '30px',
                            cursor: 'pointer',
                            zIndex: 20,
                        }}
                    >
                        X
                    </button>

                    <div
                        id="model-viewer"
                        ref={modelViewerRef}
                        style={{ width: '100%', height: '100%' }}
                    ></div>
                </div>
            )}

            {/* Modal for Demo Video */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        {/* Close Button */}
                        <button className="close-modal-btn" onClick={closeModal} aria-label="Close modal">
                            X
                        </button>
                        {/* YouTube Video */}
                        <iframe
                            width="560"
                            height="315"
                            src="https://www.youtube.com/embed/x9eNfcFlz1Y"
                            title="Demo Video for AP Elbow"
                            frameBorder="2"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                        {/* Description */}
                        <div className="modal-description">
                            <p>
                                <strong>Timestamp Reference:</strong> The AP elbow positioning starts at <strong>0:00</strong> until <strong>1:00</strong> in the video.
                            </p>
                        </div>
                        <div className="modal-description">
                            <p>
                                <strong>Credits to owner of the video:</strong> @xrayimaginglady2586
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Elbow;