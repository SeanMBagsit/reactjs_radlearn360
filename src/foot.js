import React, { useState, useEffect, useRef } from 'react';
import './ankle.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const Foot = () => {
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

            // Load model in static position
            loader.load(
              '/models/foot.glb',
              (glb) => {
                  const loadedHandModel = glb.scene;
                  loadedHandModel.traverse((child) => {
                      if (child.isMesh) {
                          child.castShadow = true;
                          child.receiveShadow = true;
                      }
                  });
          
                  // Adjust the scale here
                  loadedHandModel.scale.set(1.2,1.2,1.2); // Set desired scale
          
                  // Set rotation: x = 0 degrees, y = 0 degrees, z = -100 degrees
                  loadedHandModel.rotation.set(0, 0, 0,); // -Math.PI is -180 degrees in radians
          
                  loadedHandModel.position.set(.2, -9.5, 1.5);
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
                            <img src="/pics/foot.png" alt="Foot Image" className="black-box-image" />
                            <p>Click to View 3D Model</p>
                        </div>
                    </div>

                    {/* Image Section with Demo Video */}
                    <div className="image-section">
                        <div className="black-box" onClick={openModal}>
                            <img src="/pics/foot.png" alt="Foot Image" className="black-box-image" />
                            <p>Click to View Demo Video</p>
                        </div>
                    </div>

                    {/* Text Section */}
                    <div className="text-section">
                    <h2>Clinical Details:</h2>
                    <div className="scrollable-box">
                    <h2>Clinical Indications:</h2>
                        <ul>
                            <li>Location and extent of fractures and fragment alignments.</li>
                            <li>Joint space abnormalities, soft tissue effusions.</li>
                            <li>Location of opaque foreign bodies.</li>
                        </ul>
                        <h2>Technical Factors:</h2>
                        <ul>
                            <li><strong>Minimum SID:</strong> 40 inches (100 cm).</li>
                            <li><strong>IR size:</strong> 10 x 12 inches (24 x 30 cm), portrait.</li>
                            <li><strong>kVp range:</strong> 55–65.</li>
                            <li><strong>Shielding:</strong> Shield radiosensitive tissues outside region of interest.</li>
                        </ul>
                        <h3>Shielding:</h3>
                        <p>Shield radiosensitive tissues outside region of interest.</p>
                        <h2>Patient Position:</h2>
                        <p>Place patient supine; provide a pillow for the patient’s head; flex knee and place plantar surface (sole) of affected foot flat on IR.</p>
                        <h2>Part Position:</h2>
                        <ul>
                            <li>Extend (plantar flex) foot but maintain plantar surface resting flat and firmly on IR.</li>
                            <li>Align and center long axis of foot to CR and to the long axis of the portion of IR being exposed.</li>
                            <li>Use sandbags if necessary to prevent IR from slipping on the tabletop.</li>
                            <li>If immobilization is needed, flex opposite knee and rest against affected knee for support.</li>
                        </ul>
                        <h2>CR:</h2>
                        <ul>
                            <li>Angle CR 10° posteriorly (toward heel) with CR perpendicular to metatarsals.</li>
                            <li>Direct CR to base of third metatarsal.</li>
                        </ul>
                        <h2>Recommended Collimation:</h2>
                        <p>Collimate to outer margins of the foot on four sides.</p>
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
                            src="https://www.youtube.com/embed/au55A6jx5AU"
                            title="Demo Video for AP Hand"
                            frameBorder="2"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                        {/* Description */}
                        <div className="modal-description">
                            <p>
                                <strong>Timestamp Reference:</strong> The AP foot positioning starts at <strong>0:00</strong> until <strong>0:40</strong> in the video.
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

export default Foot;