    import React, { useState, useEffect, useRef } from 'react';
    import * as THREE from 'three';
    import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
    import { DragControls } from 'three/examples/jsm/controls/DragControls';
    import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
    import './simulation.css';

    const Simulation = () => {
        const [showModel, setShowModel] = useState(false);
        const [showIntro, setShowIntro] = useState(true);
        const [feedbackMessage, setFeedbackMessage] = useState('');
        const [feedbackColor, setFeedbackColor] = useState('red');
        const [handPosition, setHandPosition] = useState({ x: 0, y: 0, z: 0 });
        const [handRotation, setHandRotation] = useState({ x: 0, y: 0, z: 0 });
        const modelViewerRef = useRef(null);
        const [Model, setModel] = useState(null);
        const dragControlsRef = useRef(null);
        const [currentItem, setCurrentItem] = useState(0);
        const [passedCurrentItem, setPassedCurrentItem] = useState(false);
        const [timer, setTimer] = useState(60);
        const [disableControls, setDisableControls] = useState(false);
        const [showLabConfirmation, setShowLabConfirmation] = useState(false); 
        const [labConfirmed, setLabConfirmed] = useState(false);
        const [passedCount, setPassedCount] = useState(0);
        const [finalScore, setFinalScore] = useState(0);
        const [showResultModal, setShowResultModal] = useState(false);
        const [disableNext, setDisableNext] = useState(false);
        const [timeoutId, setTimeoutId] = useState(null);

        const boundaries = {
            minX: -10,
            maxX: 10,
            minY: -10,
            maxY: 10,
            minZ: -10,
            maxZ: 10,
        };

        const simulationSettings = [
            {
                ModelFile: '/models/hand.glb',
                targetPosition: { x: 0.61, y: -8.88, z: -7.22 },
                targetRotation: { x: 0, y: 0, z: 0 },
                threshold: 0.5,
                scale: { x: 1, y: 1, z: 1 },
                instructionText: "Properly simulate the PA Hand position"
            },
            {
                ModelFile: '/models/wrist.glb',
                targetPosition: { x: 1.39, y: 0.08, z: -0.42 },
                targetRotation: { 
                    x: 0, 
                    y: 0, 
                    z: -Math.PI / 2 // -90 degrees in radians
                },
                threshold: 0.1,
                scale: { x: 6, y: 6, z: 6 },
                instructionText: "Properly simulate the Lateral Wrist position"
            },
            
            {
                ModelFile: '/models/elbow.glb',
                targetPosition: { x: -3.63, y: -3.33, z: 4.66 },
                targetRotation: { 
                    x: 0, 
                    y: 0, 
                    z: -180 * (Math.PI / 180)
                },
                threshold: 0.2,
                scale: { x: 4, y: 4, z: 4 },
                instructionText: "Properly simulate the AP Elbow position"
            },
            {
                ModelFile: '/models/foot.glb',
                targetPosition: { x: -0.08, y: -7.61, z: -0.58 },
                targetRotation: { 
                    x: 0,
                    y: 0,
                    z: 0,
                },
                threshold: 0.3,
                scale: { x: 1.2, y: 1.2, z: 1.2 },
                instructionText: "Properly simulate the AP Foot position"
            },
            {
                
                ModelFile: '/models/foot.glb',
                targetPosition: { x: -8.25, y: -0.63, z: 2.36 }, 
                targetRotation: { 
                    x: -Math.PI,
                    y: Math.PI / 2,
                    z: -Math.PI / 2,
                },
                threshold: 0.3,
                scale: { x: 1, y: 1, z: 1 },
                instructionText: "Properly simulate the Lateral Ankle position"
            }
        ];
        
        const updateInstructionText = (modelIndex) => {
            // Only update the instruction text if the timer has not run out
            if (!passedCurrentItem && timer > 0) {
              const instruction = simulationSettings[modelIndex].instructionText;
              setFeedbackMessage(instruction);
            }
          };

        const enterSimulation = () => {
            const confirmation = window.confirm('Are you ready to begin the simulation?');
            if (confirmation) {
                setShowIntro(false);
                setShowModel(true);
                setShowLabConfirmation(true);

                setCurrentItem(0);
                setTimer(simulationSettings[0].timeLimit || 60);
                setHandPosition({ x: 0, y: 0, z: 0 });
                setHandRotation({ x: 0, y: 0, z: 0 });
                setPassedCurrentItem(false);
                setFeedbackMessage('');
                setFeedbackColor('red');
                setDisableControls(true);

                setShowLabConfirmation(true);
            }
        };

        const handleRestartSimulation = () => {
            setPassedCount(0);
            setShowResultModal(false);
            setShowIntro(true);
        };

        const handleLabConfirmation = (confirmed) => {
            setShowLabConfirmation(false);
            setDisableControls(!confirmed);
            if (confirmed) {
                setLabConfirmed(true);
            } else {
                setShowIntro(true);
                setShowModel(false);
                setDisableControls(true);
            }
        };

        useEffect(() => {
            document.body.style.overflow = 'hidden';
            updateInstructionText(currentItem);
            setTimer(60);

            if (showModel) {
                const scene = new THREE.Scene();
                const camera = new THREE.PerspectiveCamera(
                    30,
                    window.innerWidth / window.innerHeight,
                    0.1,
                    1000
                );
                camera.position.set(0, 0, 60);
                
                const renderer = new THREE.WebGLRenderer({ antialias: true });
                renderer.setSize(window.innerWidth, window.innerHeight);
                renderer.shadowMap.enabled = true;
                renderer.shadowMap.type = THREE.PCFSoftShadowMap;
                modelViewerRef.current.innerHTML = '';
                modelViewerRef.current.appendChild(renderer.domElement);
                
                document.body.style.overflow = 'hidden';

                const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
                scene.add(ambientLight);
        
                const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
                directionalLight.position.set(1.5, 80, 0.5);
                directionalLight.castShadow = true;
                scene.add(directionalLight);
        
                const loader = new GLTFLoader();
        
                const currentSetting = simulationSettings[currentItem] || {};
        
                const { ModelFile, scale } = currentSetting;
        
                if (ModelFile) {
                    loader.load(
                        ModelFile,
                        (glb) => {
                            const loadedHandModel = glb.scene;
                            loadedHandModel.traverse((child) => {
                                if (child.isMesh) {
                                    child.castShadow = true;
                                    child.receiveShadow = true;
                                }
                            });
                            loadedHandModel.position.set(0, 0, 0);
                            loadedHandModel.scale.set(scale.x, scale.y, scale.z);
                            scene.add(loadedHandModel);
                            setModel(loadedHandModel);
        
                            const dragControls = new DragControls([loadedHandModel], camera, renderer.domElement);
                            dragControlsRef.current = dragControls;
        
                            dragControls.addEventListener('drag', (event) => {
                                let { x, y, z } = event.object.position;
                                x = Math.max(boundaries.minX, Math.min(x, boundaries.maxX));
                                y = Math.max(boundaries.minY, Math.min(y, boundaries.maxY));
                                z = Math.max(boundaries.minZ, Math.min(z, boundaries.maxZ));
        
                                event.object.position.set(x, y, z);
                                setHandPosition({ x, y, z });
                            });
        
                            dragControls.addEventListener('dragstart', () => {
                                cameraControls.enabled = false;
                            });
        
                            dragControls.addEventListener('dragend', () => {
                                cameraControls.enabled = true;
                            });
        
                            camera.position.set(currentSetting.targetPosition?.x || 0, currentSetting.targetPosition?.y || 0, 60);
                        },
                        undefined,
                        (error) => {
                            console.error('Error loading model:', error);
                        }
                    );
                } else {
                    console.error('Model file not found in simulation settings for current item.');
                }
        
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
        
                const controls = new OrbitControls(camera, renderer.domElement);
                controls.enableDamping = true;
                controls.dampingFactor = 0.25;
                controls.screenSpacePanning = false;
                controls.maxPolarAngle = Math.PI / 2;
        
                const cameraControls = controls;
        
                const animate = () => {
                    requestAnimationFrame(animate);
                    controls.update();
                    renderer.render(scene, camera);
                };
                animate();
        
                return () => {
                    renderer.dispose();
                    controls.dispose();
                    document.body.style.overflow = 'auto';
                };
            }
        }, [showModel, currentItem]);
        
        useEffect(() => {
            if (showModel && showLabConfirmation) return;
          
            // If the timer has run out and the user hasn't passed the current item
            if (timer <= 0 && !passedCurrentItem) {
              // Check if it's the last model
              if (currentItem === simulationSettings.length - 1) {
                setFeedbackMessage('Time is up!');
              } else {
                setFeedbackMessage('Time is up! Proceed to the next model.');
              }
              setFeedbackColor('red');
              setPassedCurrentItem(true); // Mark as failed
              setDisableControls(true); // Disable further interactions
          
              // Clear any pending timeouts
              if (timeoutId) {
                clearTimeout(timeoutId);
                setTimeoutId(null); // Reset the timeout ID
              }
            } 
            // Start the countdown timer if conditions are met
            else if (showModel && !passedCurrentItem && labConfirmed) {
              const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
              }, 1000);
          
              // Cleanup interval on component unmount or dependency change
              return () => clearInterval(interval);
            }
          }, [timer, showModel, passedCurrentItem, labConfirmed, showLabConfirmation, timeoutId]);

          const handleVerifyPlacement = () => {
            // Exit early if controls are disabled or the timer has expired
            if (disableControls || timer <= 0) {
              // Check if it's the last model
              if (currentItem === simulationSettings.length - 1) {
                setFeedbackMessage('Time is up!');
              } else {
                setFeedbackMessage('Time is up! Proceed to the next model.');
              }
              setFeedbackColor('red');
              return; // Stop further execution
            }
          
            // Existing logic for verifying placement
            const { targetPosition, targetRotation, threshold, ModelFile } = simulationSettings[currentItem];
            const distance = Math.sqrt(
              Math.pow(handPosition.x - targetPosition.x, 2) +
              Math.pow(handPosition.y - targetPosition.y, 2) +
              Math.pow(handPosition.z - targetPosition.z, 2)
            );
          
            let isRotationValid =
              Math.abs(Model.rotation.x - targetRotation.x) < 0.01 &&
              Math.abs(Model.rotation.y - targetRotation.y) < 0.01;
          
            if (ModelFile === '/models/elbow.glb') {
              const zRotation = Model.rotation.z;
              isRotationValid =
                isRotationValid &&
                (Math.abs(zRotation - (-Math.PI)) < 0.01 || Math.abs(zRotation - Math.PI) < 0.01);
            } else {
              isRotationValid = isRotationValid && Math.abs(Model.rotation.z - targetRotation.z) < 0.01;
            }
          
            if (distance <= threshold && isRotationValid) {
              setFeedbackMessage('You passed!');
              setFeedbackColor('green');
              setPassedCurrentItem(true);
              setDisableControls(true);
              setTimer(0);
              setPassedCount((prevCount) => prevCount + 1);
            } else {
              setFeedbackMessage('Wrong positioning technique!');
              setFeedbackColor('red');
          
              // Only update instruction text if the timer has not run out
              if (timer > 0) {
                const id = setTimeout(() => {
                  updateInstructionText(currentItem);
                }, 2000);
                setTimeoutId(id); // Store the timeout ID
              }
            }
          };
        

          useEffect(() => {
            if (timer === 0) {
              if (currentItem === simulationSettings.length - 1) {
                handleEndSimulation();
              } else {
                setDisableNext(false);
              }
            }
          }, [timer]);

        const handleRotationChange = (axis, value) => {
            if (disableControls || !Model) return;
            
            const rotationValue = parseFloat(value) * Math.PI / 180;
            if (axis === 'x') {
                Model.rotation.x = rotationValue;
                setHandRotation(prevState => ({ ...prevState, x: rotationValue }));
            } else if (axis === 'y') {
                Model.rotation.y = rotationValue;
                setHandRotation(prevState => ({ ...prevState, y: rotationValue }));
            } else if (axis === 'z') {
                Model.rotation.z = rotationValue;
                setHandRotation(prevState => ({ ...prevState, z: rotationValue }));
            }
        };

        const handleNextItem = () => {
            if (currentItem < simulationSettings.length - 1) {
              setCurrentItem(currentItem + 1);
              setPassedCurrentItem(false);
              setFeedbackMessage('');
              setFeedbackColor('red');
              setHandPosition({ x: 0, y: 0, z: 0 });
              setHandRotation({ x: 0, y: 0, z: 0 });
              setTimer(simulationSettings[currentItem + 1].timeLimit);
              setDisableControls(false);
            } else {
              handleEndSimulation();
            }
          };
        
        const handleEndSimulation = () => {
            const totalItems = simulationSettings.length;
            const rawScore = passedCount;
        
            setShowResultModal(true);
            setFinalScore({ correct: rawScore, total: totalItems });
        
            setShowModel(true);
            setShowIntro(false);
        
            const googleFormURL = "https://docs.google.com/forms/d/e/1FAIpQLSevZ7KVQ9la2o-VlwSH9cuQKw9JE5eiAuwvqq8TLCW2KHbBtg/formResponse";
            const scoreEntryID = "entry.332590206";
        
            const formData = new FormData();
            formData.append(scoreEntryID, rawScore);
        
            fetch(googleFormURL, {
                method: "POST",
                mode: "no-cors",
                body: formData
            })
            .then(() => {
                console.log("Score submitted to Google Forms successfully.");
            })
            .catch((error) => {
                console.error("Error submitting score to Google Forms:", error);
            });
        };
        
        const handleExitSimulation = () => {
            const confirmation = window.confirm('Are you sure you want to exit? All progress will be lost.');
            if (confirmation) {
                setShowModel(false);
                setShowIntro(true);
                setCurrentItem(0);
                setHandPosition({ x: 0, y: 0, z: 0 });
                setHandRotation({ x: 0, y: 0, z: 0 });
                setFeedbackMessage('');
                setFeedbackColor('red');
                setPassedCurrentItem(false);
                setPassedCount(0);
                setFinalScore({ correct: 0, total: 0 });
        
                if (Model) {
                    Model.traverse((child) => {
                        if (child.isMesh) {
                            child.geometry.dispose();
                            child.material.dispose();
                        }
                    });
                }
        
                if (dragControlsRef.current) {
                    dragControlsRef.current.dispose();
                    dragControlsRef.current = null;
                }
                
                if (modelViewerRef.current) {
                    modelViewerRef.current.innerHTML = '';
                }
            }
        };

        return (
            <div className='container'>
                {showResultModal && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <h2>Simulation Complete!</h2>
                            <p>
                                Thank you for completing the simulation! 🎉 Here are your results:
                            </p>
                            <p className="score-text">
                                Correct: {finalScore?.correct}/{finalScore?.total}
                            </p>
                            <p className="final-score">
                                Final Score: {finalScore?.correct} points
                            </p>
                            <p className="success-message">
                                ✅ Your score has been recorded successfully!
                            </p>
                            <div className="modal-buttons">
                                <button
                                    onClick={() => {
                                        setShowResultModal(false);
                                        setShowIntro(true);
                                        setShowModel(false);
                                        setCurrentItem(0);
                                        setHandPosition({ x: 0, y: 0, z: 0 });
                                        setHandRotation({ x: 0, y: 0, z: 0 });
                                        setFeedbackMessage('');
                                        setDisableControls(false);
                                        setPassedCount(0);
                                    }}
                                    className="modal-button ok-button"
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showLabConfirmation && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <h2>Lab Activity Confirmation</h2>
                            <p>
                                You need to complete 5 lab activities: <b>PA Hand, Lateral Wrist, AP Elbow, AP Foot, 
                                and Lateral Ankle.</b> You will have <b><u>60 seconds</u></b> to complete each activity. 
                                Ensure correct positioning for each model. Are you ready to begin?
                            </p>
                            <div className="modal-buttons">
                                <button
                                    onClick={() => handleLabConfirmation(true)}
                                    className="modal-button confirm-button"
                                >
                                    OK
                                </button>
                                <button
                                    onClick={() => handleLabConfirmation(false)}
                                    className="modal-button cancel-button"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showIntro && (
                    <div className="intro-container">
                        <button
                            onClick={enterSimulation}
                            className="start-button"
                        >
                            Start Simulation
                        </button>
                    </div>
                )}

                {showModel && (
                    <div className="model-viewer-container">
                        <button
                            onClick={handleExitSimulation}
                            className="exit-button"
                        >
                            X
                        </button>

                        <div className="progress-container">
                            <div
                                className="progress-bar"
                                style={{
                                    width: `${((currentItem + 1) / simulationSettings.length) * 100}%`,
                                }}
                            ></div>
                            <div className="progress-text">
                                {`${currentItem + 1}/${simulationSettings.length}`}
                            </div>
                        </div>

                        <div
                            id="model-viewer"
                            ref={modelViewerRef}
                            className="model-viewer"
                        ></div>

                        <button
                            onClick={handleVerifyPlacement}
                            className="verify-button"
                            disabled={disableControls}
                        >
                            Verify Placement
                        </button>

                        {passedCurrentItem && currentItem < simulationSettings.length - 1 && (
                            <button
                                onClick={handleNextItem}
                                className="next-button"
                            >
                                Next
                            </button>
                        )}

                        {feedbackMessage && (
                            <div 
                                className="feedback-message"
                                style={{ color: feedbackColor }}
                            >
                                {feedbackMessage}
                            </div>
                        )}

                        <div className="model-info">
                            <div>Model Position: ({handPosition.x.toFixed(2)}, {handPosition.y.toFixed(2)}, {handPosition.z.toFixed(2)})</div>
                            <div>Model Rotation: ({(handRotation.x * 180 / Math.PI).toFixed(2)}°, {(handRotation.y * 180 / Math.PI).toFixed(2)}°, {(handRotation.z * 180 / Math.PI).toFixed(2)}°)</div>
                        </div>

                        <div className="rotation-controls">
                            <div className="rotation-control">
                                <div>X Rotation</div>
                                <input
                                    type="range"
                                    min="-180"
                                    max="180"
                                    value={handRotation.x * (180 / Math.PI)}
                                    onChange={(e) => handleRotationChange('x', e.target.value)}
                                    className="rotation-slider"
                                    disabled={disableControls}
                                />
                            </div>

                            <div className="rotation-control">
                                <div>Y Rotation</div>
                                <input
                                    type="range"
                                    min="-180"
                                    max="180"
                                    value={handRotation.y * (180 / Math.PI)}
                                    onChange={(e) => handleRotationChange('y', e.target.value)}
                                    className="rotation-slider"
                                    disabled={disableControls}
                                />
                            </div>

                            <div className="rotation-control">
                                <div>Z Rotation</div>
                                <input
                                    type="range"
                                    min="-180"
                                    max="180"
                                    value={handRotation.z * (180 / Math.PI)}
                                    onChange={(e) => handleRotationChange('z', e.target.value)}
                                    className="rotation-slider"
                                    disabled={disableControls}
                                />
                            </div>
                        </div>

                        <div className="timer">
                            <p>Time Remaining: {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}</p>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    export default Simulation;