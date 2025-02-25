import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DragControls } from 'three/examples/jsm/controls/DragControls';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const Simulation = () => {
    const [showModel, setShowModel] = useState(false);
    const [showIntro, setShowIntro] = useState(true);
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [feedbackColor, setFeedbackColor] = useState('red');
    const [handPosition, setHandPosition] = useState({ x: 0, y: 0, z: 0 });
    const [handRotation, setHandRotation] = useState({ x: 0, y: 0, z: 0 });  // Added z rotation
    const modelViewerRef = useRef(null);
    const [Model, setModel] = useState(null);
    const dragControlsRef = useRef(null);
    const [currentItem, setCurrentItem] = useState(0);
    const [passedCurrentItem, setPassedCurrentItem] = useState(false);
    const [timer, setTimer] = useState(60); // Timer set for 60 seconds
    const [disableControls, setDisableControls] = useState(false);
    const [showLabConfirmation, setShowLabConfirmation] = useState(false); 
    const [labConfirmed, setLabConfirmed] = useState(false); // Track if user accepted
    const [passedCount, setPassedCount] = useState(0);
    const [finalScore, setFinalScore] = useState(0);
    const [showResultModal, setShowResultModal] = useState(false);
    const [disableNext, setDisableNext] = useState(false); // Controls the Next button visibility




 

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
            targetPosition: { x: 0.87, y: -8.81, z: -6.13 },
            targetRotation: { x: 0, y: 0, z: 0 }, // No conversion needed (0 degrees = 0 radians)
            threshold: 0.5,
            scale: { x: 1, y: 1, z: 1 }, // Scale added here
            instructionText: "Properly simulate the PA Hand position"
        },
        {
            ModelFile: '/models/wrist.glb',
            targetPosition: { x: 1.33, y: 0.34, z: -0.37 },
            targetRotation: { 
                x: 0, 
                y: 0, 
                z: -100 * (Math.PI / 180) // Convert -100 degrees to radians (-1.745 radians)
            },
            threshold: 0.1,
            scale: { x: 6, y: 6, z: 6 }, // Scale added here
            instructionText: "Properly simulate the Lateral Wrist position"
        },
        {
            ModelFile: '/models/elbow.glb',
            targetPosition: { x: -3.63, y: -3.33, z: 4.66 },
            targetRotation: { 
                x: 0, 
                y: 0, 
                z: -180 * (Math.PI / 180) // Convert -180 degrees to radians (-3.142 radians)
            },
            threshold: 0.2,
            scale: { x: 4, y: 4, z: 4 }, // Scale added here
            instructionText: "Properly simulate the AP Elbow position"
        },
        {
            ModelFile: '/models/foot.glb',
            targetPosition: { x: 0, y: -7.67, z: 0.38 },
            targetRotation: { 
                x: 0,
                y: 0,
                z: 0,
            },
            threshold: 0.3,
            scale: { x: 1.2, y: 1.2, z: 1.2 }, // Scale added here
            instructionText: "Properly simulate the AP Foot position"
        },
        {
            ModelFile: '/models/foot.glb',
            targetPosition: { x: -8.25, y: -0.63, z: 2.36 }, 
            targetRotation: { 
                x: -Math.PI, // -180
                y: Math.PI / 2, // 90
                z: -Math.PI / 2, // -90
            },
            threshold: 0.3,
            scale: { x: 1, y: 1, z: 1 }, // Scale added here 
            instructionText: "Properly simulate the Lateral Ankle position"
        }
        
    ];

    const updateInstructionText = (modelIndex) => {
        const instruction = simulationSettings[modelIndex].instructionText;
        if (!passedCurrentItem) {
            // Only update the instruction text if the user hasn't passed the current item
            setFeedbackMessage(instruction);
    }
};
    const enterSimulation = () => {
        // Show confirmation pop-up before beginning the simulation
        const confirmation = window.confirm('Are you ready to begin the simulation?');
        if (confirmation) {
            setShowIntro(false);  // Hide intro screen after confirmation
            setShowModel(true);   // Show the model for the simulation
            setShowLabConfirmation(true); // Show the second confirmation modal

              // Reset states for a fresh start
        setCurrentItem(0);
        setTimer(simulationSettings[0].timeLimit || 60); // Set timer to the first item's time limit or default 60s
        setHandPosition({ x: 0, y: 0, z: 0 });
        setHandRotation({ x: 0, y: 0, z: 0 });
        setPassedCurrentItem(false);
        setFeedbackMessage('');
        setFeedbackColor('red');
        setDisableControls(true); // Disable interactions until lab confirmation

        // Show the second confirmation after entering the first model
        setShowLabConfirmation(true); 

        }
    };

    const handleRestartSimulation = () => {
        setPassedCount(0); // Reset passed count
        setShowResultModal(false); // Hide result modal
        setShowIntro(true); // Show intro again
    };

    const handleLabConfirmation = (confirmed) => {
        setShowLabConfirmation(false); // Hide the pop-up
        setDisableControls(!confirmed); // Enable controls if confirmed
        if (confirmed) {
            setLabConfirmed(true); // Start the timer after confirmation
        } else {
            // If canceled, return to intro screen
            setShowIntro(true);
            setShowModel(false); // Hide the model
            setDisableControls(true); // Keep interactions disabled
        }
    };

    useEffect(() => {
        document.body.style.overflow = 'hidden'; // Prevent scroll when model is shown
        updateInstructionText(currentItem);
        setTimer(40);

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
    
            // Check if currentItem is within bounds of the simulationSettings array
            const currentSetting = simulationSettings[currentItem] || {};
    
            const { ModelFile, scale } = currentSetting;  // Use the currentSetting to prevent destructure error
    
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
                        loadedHandModel.scale.set(scale.x, scale.y, scale.z); // Apply the scale here
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
    
            // Load xray model (keeping the existing code)
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
    
    
// Timer logic (Modify to wait for lab confirmation)
useEffect(() => {
    if (showModel && showLabConfirmation) return; // Prevent timer from starting while pop-up is open

    if (timer <= 0 && !passedCurrentItem) {
        setFeedbackMessage('Time is up! Proceed to the next model.');
        setFeedbackColor('red');
        setPassedCurrentItem(true);
        setDisableControls(true);
    } else if (showModel && !passedCurrentItem && labConfirmed) { 
        const interval = setInterval(() => {
            setTimer((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }
}, [timer, showModel, passedCurrentItem, labConfirmed, showLabConfirmation]);

    const handleVerifyPlacement = () => {
        if (disableControls) return; // Prevent action if controls are disabled

        const { targetPosition, targetRotation, threshold, ModelFile } = simulationSettings[currentItem];
        
        // Calculate distance between current and target positions
        const distance = Math.sqrt(
            Math.pow(handPosition.x - targetPosition.x, 2) +
            Math.pow(handPosition.y - targetPosition.y, 2) +
            Math.pow(handPosition.z - targetPosition.z, 2)
        );
    
     // Check if the current model is the elbow and validate Z rotation differently
    let isRotationValid = 
    Math.abs(Model.rotation.x - targetRotation.x) < 0.01 &&
    Math.abs(Model.rotation.y - targetRotation.y) < 0.01;

if (ModelFile === '/models/elbow.glb') {
    // Allow both -180° (-π) and 180° (π)
    const zRotation = Model.rotation.z;
    isRotationValid = isRotationValid && 
        (Math.abs(zRotation - (-Math.PI)) < 0.01 || Math.abs(zRotation - Math.PI) < 0.01);
} else {
    // Normal rotation validation for other models
    isRotationValid = isRotationValid && Math.abs(Model.rotation.z - targetRotation.z) < 0.01;
}

// Check both position and rotation
if (distance <= threshold && isRotationValid) {
    setFeedbackMessage('You passed!');
    setFeedbackColor('green');
    setPassedCurrentItem(true);
    setDisableControls(true);    // Disable controls
    setTimer(0);                 // Stop the timer immediately

    // Increment the passed count for scoring
    setPassedCount(prevCount => prevCount + 1);
} else {
    setFeedbackMessage('Wrong positioning technique!');
    setFeedbackColor('red');

             // Set a delay to revert to the instruction text only if the user hasn't passed
        setTimeout(() => {
            updateInstructionText(currentItem);
        }, 2000);
        }
    };
    useEffect(() => {
        if (timer === 0) {
            if (currentItem === simulationSettings.length - 1) {
                handleEndSimulation(); // End simulation only if on the last item
            } else {
                setDisableNext(false); // Allow next button to be enabled for other items
            }
        }
    }, [timer]);

    const handleRotationChange = (axis, value) => {
        if (disableControls || !Model) return; // Prevent rotation changes if controls are disabled

        
        const rotationValue = parseFloat(value) * Math.PI / 180;
        if (axis === 'x') {
            Model.rotation.x = rotationValue;
            setHandRotation(prevState => ({ ...prevState, x: rotationValue }));
        } else if (axis === 'y') {
            Model.rotation.y = rotationValue;
            setHandRotation(prevState => ({ ...prevState, y: rotationValue }));
        } else if (axis === 'z') {  // Added z-axis rotation handling
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
            // Reset position and rotation to 0, 0, 0
            setHandPosition({ x: 0, y: 0, z: 0 });
            setHandRotation({ x: 0, y: 0, z: 0 });  // Reset rotation
             // Reset the timer for the next model
        setTimer(simulationSettings[currentItem + 1].timeLimit);

        // Enable the controls for the next item
        setDisableControls(false);
    } else {
        // If this is the last item, end the simulation
        handleEndSimulation();
        }
    };
    
    const handleEndSimulation = () => {
        // Calculate the final score as a whole number (raw correct answers)
        const totalItems = simulationSettings.length;
        const rawScore = passedCount; // Use raw count instead of percentage
    
        // Show the result modal
        setShowResultModal(true);
        setFinalScore({ correct: rawScore, total: totalItems });
    
        // Keep the last model visible while showing the result modal
        setShowModel(true);  // Ensure model stays visible
        setShowIntro(false); // Prevent redirection immediately
    
        // ✅ Google Forms Submission (Replace with your actual form details)
        const googleFormURL = "https://docs.google.com/forms/d/e/1FAIpQLSevZ7KVQ9la2o-VlwSH9cuQKw9JE5eiAuwvqq8TLCW2KHbBtg/formResponse";
        const scoreEntryID = "entry.332590206";  // Replace with your actual Google Forms entry ID
    
        // Construct the form data
        const formData = new FormData();
        formData.append(scoreEntryID, rawScore); // Send raw score instead of percentage
    
        // ✅ Send the data to Google Forms (asynchronously)
        fetch(googleFormURL, {
            method: "POST",
            mode: "no-cors", // No CORS mode to bypass cross-origin restrictions
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
            setHandRotation({ x: 0, y: 0, z: 0 });  // Reset z rotation
            setFeedbackMessage('');
            setFeedbackColor('red');
            setPassedCurrentItem(false);
    
            setPassedCount(0); // Reset the score
            setFinalScore({ correct: 0, total: 0 }); // Reset displayed score
    
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
        <div>
             {showResultModal && (
    <div
        style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 999,
        }}
    >
        <div
            style={{
                backgroundColor: '#f8f9fa',
                padding: '30px',
                borderRadius: '12px',
                boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)',
                width: '400px',
                textAlign: 'center',
                animation: 'fadeIn 0.3s ease-in-out',
            }}
                    >
            <h2 style={{ color: '#333', marginBottom: '15px' }}>Simulation Complete!</h2>
            <p style={{ color: '#555', fontSize: '16px', lineHeight: '1.5' }}>
                Thank you for completing the simulation! 🎉 Here are your results:
            </p>

            <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '15px 0' }}>
                Correct: {finalScore?.correct}/{finalScore?.total}
            </p>
            <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#28a745' }}>
                Final Score: {finalScore?.correct} points
            </p>

            <p style={{ color: '#28a745', fontSize: '16px', marginTop: '15px', fontWeight: 'bold' }}>
    ✅ Your score has been recorded successfully!
            </p>

            {/* Buttons */}
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                <button
                    onClick={() => {
                        // Hide modal & reset the simulation state
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
                    style={{
                        padding: '12px 24px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        transition: 'background 0.3s',
                    }}
                    onMouseOver={(e) => (e.target.style.backgroundColor = '#0056b3')}
                    onMouseOut={(e) => (e.target.style.backgroundColor = '#007bff')}
                >
                    OK
                </button>
            </div>
        </div>
    </div>
)}
             {showLabConfirmation && (
            <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 999,
            }}
        >
            {/* Pop-up Modal */}
            <div
                style={{
                    backgroundColor: '#f8f9fa', // Light background for contrast
                    padding: '30px',
                    borderRadius: '12px',
                    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)',
                    width: '400px',
                    textAlign: 'center',
                    animation: 'fadeIn 0.3s ease-in-out',
                }}
            >
                <h2 style={{ color: '#333', marginBottom: '15px' }}>
                    Lab Activity Confirmation
                </h2>
                <p style={{ color: '#555', fontSize: '16px', lineHeight: '1.5' }}>
                    You need to complete 5 lab activities: <b>PA Hand, Lateral Wrist, AP Elbow, AP Foot, 
                    and Lateral Ankle.</b> You will have <b><u>60 seconds</u></b> to complete each activity. 
                    Ensure correct positioning for each model. Are you ready to begin?
                </p>
    
                {/* Buttons */}
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                    <button
                        onClick={() => handleLabConfirmation(true)}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            marginRight: '10px',
                            transition: 'background 0.3s',
                        }}
                        onMouseOver={(e) => (e.target.style.backgroundColor = '#218838')}
                        onMouseOut={(e) => (e.target.style.backgroundColor = '#28a745')}
                    >
                        OK
                    </button>
    
                    <button
                        onClick={() => handleLabConfirmation(false)}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            transition: 'background 0.3s',
                        }}
                        onMouseOver={(e) => (e.target.style.backgroundColor = '#c82333')}
                        onMouseOut={(e) => (e.target.style.backgroundColor = '#dc3545')}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )}
            {showIntro && (
                <div
                    style={{
                        width: '100%',
                        height: '100vh',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: 'white',
                        fontSize: '30px',
                    }}
                >
                    <button
                        onClick={enterSimulation}
                        style={{
                            backgroundColor: 'blue',
                            color: 'white',
                            padding: '15px 30px',
                            border: 'none',
                            borderRadius: '5px',
                            fontSize: '24px',
                            cursor: 'pointer',
                        }}
                    >
                        Start Simulation
                    </button>
                </div>
            )}

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
                        onClick={handleExitSimulation}
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

                    {/* Progress Tracker */}
                    <div
                        style={{
                            position: 'absolute',
                            top: '10px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '80%',
                            backgroundColor: 'rgba(255, 255, 255, 0.7)',
                            padding: '5px',
                            borderRadius: '5px',
                        }}
                    >
                        <div
                            style={{
                                width: `${((currentItem + 1) / simulationSettings.length) * 100}%`,
                                height: '10px',
                                backgroundColor: 'green',
                                borderRadius: '5px',
                            }}
                        ></div>
                        <div
                            style={{
                                position: 'absolute',
                                width: '100%',
                                textAlign: 'center',
                                color: 'white',
                                fontSize: '16px',
                                top: '15px',
                            }}
                        >
                            {`${currentItem + 1}/${simulationSettings.length}`}
                        </div>
                    </div>

                    <div
                        id="model-viewer"
                        ref={modelViewerRef}
                        style={{ width: '100%', height: '100%' }}
                    ></div>

                    <button
                        onClick={handleVerifyPlacement}
                        style={{
                            position: 'absolute',
                            bottom: '20px',
                            left: '20px',
                            backgroundColor: 'transparent',
                            border: '2px solid white',
                            color: 'white',
                            padding: '10px',
                            cursor: 'pointer',
                            fontSize: '18px',
                            zIndex: 20,
                        }}
                    >
                        Verify Placement
                    </button>

                    {passedCurrentItem && currentItem < simulationSettings.length - 1 && (
                <button
                    onClick={handleNextItem}
                    style={{
                        position: 'absolute',
                        bottom: '100px',
                        left: '40px',
                        backgroundColor: 'green',
                        color: 'white',
                        padding: '20px 30px',
                        border: 'none',
                        borderRadius: '9px',
                        fontSize: '30px',
                        cursor: 'pointer',
                        zIndex: 20,
                    }}
                >
                    Next
                </button>
            )}

                    {feedbackMessage && (
                        <div
                            style={{
                                position: 'absolute',
                                bottom: '60px',
                                width: '100%',
                                textAlign: 'center',
                                color: feedbackColor,
                                fontSize: '24px',
                                fontWeight: 'bold',
                            }}
                        >
                            {feedbackMessage}
                        </div>
                    )}

                    <div
                        style={{
                            position: 'absolute',
                            top: '40px',
                            left: '20px',
                            color: 'white',
                            fontSize: '18px',
                            zIndex: 15,
                        }}
                    >
                        <div>Model Position: ({handPosition.x.toFixed(2)}, {handPosition.y.toFixed(2)}, {handPosition.z.toFixed(2)})</div>
                        <div>Model Rotation: ({(handRotation.x * 180 / Math.PI).toFixed(2)}°, {(handRotation.y * 180 / Math.PI).toFixed(2)}°, {(handRotation.z * 180 / Math.PI).toFixed(2)}°)</div>
                    </div>
                    <div
                        style={{
                            position: 'absolute',
                            bottom: '20px',
                            right: '20px',
                            color: 'white',
                            fontSize: '18px',
                            zIndex: 15,
                        }}
                    >
                        {/* X Rotation */}
                        <div style={{ marginBottom: '10px' }}>
                            <div>X Rotation</div>
                            <input
                                type="range"
                                min="-180"
                                max="180"
                                value={handRotation.x * (180 / Math.PI)}
                                onChange={(e) => handleRotationChange('x', e.target.value)}
                                style={{ width: '200px' }}
                            />
                        </div>

                        {/* Y Rotation */}
                        <div style={{ marginBottom: '10px' }}>
                            <div>Y Rotation</div>
                            <input
                                type="range"
                                min="-180"
                                max="180"
                                value={handRotation.y * (180 / Math.PI)}
                                onChange={(e) => handleRotationChange('y', e.target.value)}
                                style={{ width: '200px' }}
                            />
                        </div>

                      {/* Timer positioned in the upper right */}
                        <div style={{
                            position: 'absolute',
                            top: '-400px',
                            right: '10px',
                            textAlign: 'right',
                            
                        }}>
                            {showModel && (
                                <div>
                                    <p style={{ margin: 0 }}>Time Remaining: {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}</p>

                                  
                                </div>
                            )}
                        </div>

                        {/* Z Rotation */}
                        <div style={{ marginBottom: '10px' }}>
                            <div>Z Rotation</div>
                            <input
                                type="range"
                                min="-180"
                                max="180"
                                value={handRotation.z * (180 / Math.PI)}
                                onChange={(e) => handleRotationChange('z', e.target.value)}
                                style={{ width: '200px' }}
                            />
                        </div>
                    </div>

                    {showModel && (
                <div>
                    <div>
                        <h2 style={{ color: feedbackColor }}>{feedbackMessage}</h2>
                        <button
                            onClick={handleVerifyPlacement}
                            disabled={disableControls}
                        >
                            Verify Placement
                        </button>
                        <button
                            onClick={handleNextItem}
                            disabled={!passedCurrentItem}
                        >
                            {currentItem === simulationSettings.length - 1
                                ? 'Finish Simulation' // Change button text for the last item
                                : 'Next Model'}
                        </button>
                        <button onClick={handleExitSimulation}>Exit Simulation</button>
                    </div>
                    {/* Your existing simulation and model rendering logic */}
                </div>
            )}
        
                </div>
            )}
        </div>
    );
};

export default Simulation;