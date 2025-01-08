import React, { useState, useEffect, useRef } from 'react';
import './ankle.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const Ankle = () => {
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
          
                  loadedHandModel.position.set(.2, -9.5, 0);
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
                <img src="/pics/ankle.png" alt="Ankle Image" className="black-box-image" />
                <p>Click to View 3D Model</p>
            </div>
        </div>
        <div className="text-section">
    <h2>Clinical Details</h2>
    <div className="scrollable-box">
        <h3>Clinical Indications:</h3>
        <ul>
            <li>Projection is useful in the evaluation of fractures, dislocations, and joint effusions.</li>
            <li>Associated with other joint pathologies.</li>
        </ul>
        <h3>Technical Factors:</h3>
        <ul>
            <li><strong>Minimum SID:</strong> 40 inches (100 cm).</li>
            <li><strong>IR size:</strong> 10 x 12 inches (24 x 30 cm), portrait.</li>
            <li><strong>Nongrid</strong></li>
            <li><strong>kVp range:</strong> 60 to 75.</li>
        </ul>
        <h3>Shielding:</h3>
        <p>Shield radiosensitive tissues outside the region of interest.</p>
        <h3>Patient Position:</h3>
        <p>
            Place the patient in the lateral recumbent position, affected side down; provide a pillow for the patient’s head; flex the knee of the affected limb approximately 45°. Place the opposite leg behind the injured limb to prevent over-rotation.
        </p>
        <h3>Part Position (Mediolateral Projection):</h3>
        <ul>
            <li>Center and align the ankle joint to the CR and the long axis of the portion of the IR being exposed.</li>
            <li>Place support under the knee as needed to place the leg and foot in a true lateral position.</li>
            <li>Dorsiflex the foot so that the plantar surface is at a right angle to the leg or as far as the patient can tolerate (do not force). This helps maintain a true lateral position.</li>
        </ul>
        <h3>CR:</h3>
        <p>CR perpendicular to IR, directed to the medial malleolus.</p>
        <h3>Recommended Collimation:</h3>
        <p>Collimate to include the distal tibia and fibula to the midmetatarsal area.</p>
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

export default Ankle;