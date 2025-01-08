import React, { useState, useEffect, useRef } from 'react';
import './ankle.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const Hand = () => {
    const [showModel, setShowModel] = useState(false);
    const modelViewerRef = useRef(null);

    useEffect(() => {
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
        </div>
    );
};

export default Hand;