import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DragControls } from 'three/examples/jsm/controls/DragControls';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { doc, setDoc } from "firebase/firestore"; // Import Firestore functions
import { db, auth } from "./firebaseConfig"; // Import centralized db and auth
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
    const [showGuide, setShowGuide] = useState(false); // State to control popup visibility
    const [simulationStartTime, setSimulationStartTime] = useState(null);
    const [simulationEndTime, setSimulationEndTime] = useState(null);
    const [modelPerformanceData, setModelPerformanceData] = useState([]);
    const [userEmail, setUserEmail] = useState("");
    const [showSlideOutPanel, setShowSlideOutPanel] = useState(false); // State to control slide-out panel visibility
    const [isModalVisible, setIsModalVisible] = useState(false);
    const modalRef = useRef(null);
    const closeModalRef = useRef(null); // Renamed from closeModal

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
            instructionText: "The objective of this simulation is to properly simulate the PA Hand position.",
            positionText:"x: 0.61, y: -8.88, z: -7.22",
            rotationText:"x: 0, y: 0, z: 0",
            youtubeFile: "https://www.youtube.com/embed/BwCDglPIoYA"
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
            instructionText: "The objective of this simulation is to properly simulate the Lateral Wrist position.",
            positionText:"x: 1.39, y: 0.08, z: -0.42 ",
            rotationText:"x: 0, y: 0, z:-90",
             youtubeFile: "https://www.youtube.com/embed/0HNpAGp8bcM"
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
            instructionText: "The objective of this simulation is to properly simulate the AP Elbow position.",
            positionText:"x: -3.63, y: -3.33, z: 4.66 ",
            rotationText:"x: 0, y: 0, z: -180 or 180",
             youtubeFile: "https://www.youtube.com/embed/YH5gA4_B3Io"
        },
        {
            ModelFile: '/models/foot.glb',
            targetPosition: { x: 0.22, y: -7.90, z: 1.26 },
            targetRotation: { 
                x: 0,
                y: 0,
                z: 0,
            },
            threshold: 0.3,
            scale: { x: 1.2, y: 1.2, z: 1.2 },
            instructionText: "The objective of this simulation is to properly simulate the AP Foot position.",
            positionText:"x: 0.22, y: -7.90, z: 1.26 ",
            rotationText:"x: 0, y: 0, z: 0",
            youtubeFile: "https://www.youtube.com/embed/rnTZ6CK03Iw"
        },
        {  
            ModelFile: '/models/foot.glb',
            targetPosition: { x: -8.67, y: 0.24, z: 1.59 }, 
            targetRotation: { 
                x: -Math.PI,
                y: Math.PI / 2,
                z: -Math.PI / 2,
            },
            threshold: 0.3,
            scale: { x: 1, y: 1, z: 1 },
            instructionText: "The objective of this simulation is to properly simulate the Lateral Ankle position.",
            positionText:"x: -8.67, y: 0.24, z: 1.59 ",
            rotationText:"x: -180, y: 90, z: -90",
            youtubeFile: "https://www.youtube.com/embed/3gTqd-tw3yA"
        }
    ];

    const toggleGuide = () => {
        setShowGuide((prev) => !prev);
    };
    

    const openModal = () => {
        setIsModalVisible(true);
    };
    const closeModal = () => {
        setIsModalVisible(false);
    };

    const makeModalDraggable = () => {
        const modal = modalRef.current;
        let isDragging = false;
        let offsetX = 0;
        let offsetY = 0;
    
        const startDrag = (e) => {
            isDragging = true;
            offsetX = e.clientX - modal.getBoundingClientRect().left;
            offsetY = e.clientY - modal.getBoundingClientRect().top;
        };
    
        const drag = (e) => {
            if (!isDragging) return;
            modal.style.left = `${e.clientX - offsetX}px`;
            modal.style.top = `${e.clientY - offsetY}px`;
        };
    
        const stopDrag = () => {
            isDragging = false;
        };
    
        modal.addEventListener('mousedown', startDrag);
        window.addEventListener('mousemove', drag);
        window.addEventListener('mouseup', stopDrag);
    
        return () => {
            modal.removeEventListener('mousedown', startDrag);
            window.removeEventListener('mousemove', drag);
            window.removeEventListener('mouseup', stopDrag);
        };
    };

        // Toggle function for the slide-out panel
        const toggleSlideOutPanel = () => {
            setShowSlideOutPanel((prev) => !prev);
        };
    
    
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
            
            // Record simulation start time
            setSimulationStartTime(new Date());
            // Reset model performance data
            setModelPerformanceData([]);
            // Get user email if authenticated
            if (auth.currentUser) {
                setUserEmail(auth.currentUser.email || "Unknown");
            }
    
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

    const generateDetailedReport = () => {
        // Format dates
        const formatDate = (date) => {
            if (!date) return "Unknown";
            return date.toLocaleString();
        };
        
        // Create report content
        let reportContent = `Email: ${userEmail}\n`;
        reportContent += `Time started: ${formatDate(simulationStartTime)}\n`;
        reportContent += `Time finished: ${formatDate(simulationEndTime)}\n\n`;
        
        // Add performance data for each model
        modelPerformanceData.forEach(data => {
            reportContent += `Model name: ${data.modelName}\n`;
            reportContent += `Target Position: (${data.targetPosition.x.toFixed(2)}, ${data.targetPosition.y.toFixed(2)}, ${data.targetPosition.z.toFixed(2)})\n`;
            reportContent += `Target Rotation: (${data.targetRotation.x.toFixed(2)}°, ${data.targetRotation.y.toFixed(2)}°, ${data.targetRotation.z.toFixed(2)}°)\n`;
            reportContent += `Your Position: (${data.userPosition.x.toFixed(2)}, ${data.userPosition.y.toFixed(2)}, ${data.userPosition.z.toFixed(2)})\n`;
            reportContent += `Your Rotation: (${data.userRotation.x.toFixed(2)}°, ${data.userRotation.y.toFixed(2)}°, ${data.userRotation.z.toFixed(2)}°)\n`;
            reportContent += `Result: ${data.result}\n`;
            reportContent += `Amount of time to complete: ${data.timeToComplete} seconds\n\n`;
        });
        
        // Create blob and download
        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `simulation_report_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    useEffect(() => {
        if (isModalVisible && modalRef.current) {
            makeModalDraggable();
        }
    }, [isModalVisible]);
    

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
    
            // Add ambient light
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
            scene.add(ambientLight);
    
            // Add directional light
            const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
            directionalLight.position.set(1.5, 80, 0.5);
            directionalLight.castShadow = true;
            scene.add(directionalLight);
    
            // Function to create a line for an axis with transparency and lighter colors
                const createAxisLine = (start, end, color, opacity = 0.3) => {
                    const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
                    const material = new THREE.LineBasicMaterial({
                        color: color,
                        transparent: true, // Enable transparency
                        opacity: opacity,  // Set opacity (0 = fully transparent, 1 = fully opaque)
                    });
                    return new THREE.Line(geometry, material);
                };
    
            // Add +X axis (red line)
            const xAxisPositive = createAxisLine(
                new THREE.Vector3(0, 0, 0), // Start at origin
                new THREE.Vector3(1000, 0, 0), // Extend in the positive X direction
                0xff0000 // Red color
            );
            scene.add(xAxisPositive);
    
            // Add -X axis (red line)
            const xAxisNegative = createAxisLine(
                new THREE.Vector3(0, 0, 0), // Start at origin
                new THREE.Vector3(-1000, 0, 0), // Extend in the negative X direction
                0xff0000 // Red color
            );
            scene.add(xAxisNegative);
    
            // Add +Y axis (green line)
            const yAxisPositive = createAxisLine(
                new THREE.Vector3(0, 0, 0), // Start at origin
                new THREE.Vector3(0, 1000, 0), // Extend in the positive Y direction
                0x00ff00 // Green color
            );
            scene.add(yAxisPositive);
    
            // Add -Y axis (green line)
            const yAxisNegative = createAxisLine(
                new THREE.Vector3(0, 0, 0), // Start at origin
                new THREE.Vector3(0, -1000, 0), // Extend in the negative Y direction
                0x00ff00 // Green color
            );
            scene.add(yAxisNegative);
    
            // Add +Z axis (blue line)
            const zAxisPositive = createAxisLine(
                new THREE.Vector3(0, 0, 0), // Start at origin
                new THREE.Vector3(0, 0, 1000), // Extend in the positive Z direction
                0x0000ff // Blue color
            );
            scene.add(zAxisPositive);
    
            // Add -Z axis (blue line)
            const zAxisNegative = createAxisLine(
                new THREE.Vector3(0, 0, 0), // Start at origin
                new THREE.Vector3(0, 0, -1000), // Extend in the negative Z direction
                0x0000ff // Blue color
            );
            scene.add(zAxisNegative);
    
            // Load the model
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
    
            // Add OrbitControls
            const controls = new OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.25;
            controls.screenSpacePanning = false;
            controls.maxPolarAngle = Math.PI / 2;
    
            const cameraControls = controls;
    
            // Animation loop
            const animate = () => {
                requestAnimationFrame(animate);
                controls.update();
                renderer.render(scene, camera);
            };
            animate();
    
            // Cleanup on unmount
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
    
            // Calculate time to complete this model
            const timeToComplete = 60 - timer;
    
            // Record performance data with actual position and rotation
            const modelName = getModelName(currentItem);
            setModelPerformanceData(prev => [...prev, {
                modelName,
                targetPosition,
                targetRotation: {
                    x: targetRotation.x * (180 / Math.PI),
                    y: targetRotation.y * (180 / Math.PI),
                    z: targetRotation.z * (180 / Math.PI)
                },
                userPosition: handPosition, // Use handPosition here
                userRotation: {
                    x: Model.rotation.x * (180 / Math.PI), // Capture actual rotation
                    y: Model.rotation.y * (180 / Math.PI),
                    z: Model.rotation.z * (180 / Math.PI)
                },
                result: "Pass",
                timeToComplete
            }]);
    
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

    const getModelName = (index) => {
        const modelNames = [
            "PA Hand",
            "Lateral Wrist",
            "AP Elbow",
            "AP Foot",
            "Lateral Ankle"
        ];
        return modelNames[index] || `Model ${index + 1}`;
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
    
        // Record simulation end time
        setSimulationEndTime(new Date());
    
        // Save performance data for all models (passed and failed)
        const updatedPerformanceData = simulationSettings.map((setting, index) => {
            const existingData = modelPerformanceData.find(data => data.modelName === getModelName(index));
            const { targetPosition, targetRotation } = setting;
    
            // If no existing data, assume failure and use default values
            return existingData || {
                modelName: getModelName(index),
                targetPosition,
                targetRotation: {
                    x: targetRotation.x * (180 / Math.PI),
                    y: targetRotation.y * (180 / Math.PI),
                    z: targetRotation.z * (180 / Math.PI),
                },
                userPosition: handPosition, // Use the last known position
                userRotation: {
                    x: Model.rotation.x * (180 / Math.PI),
                    y: Model.rotation.y * (180 / Math.PI),
                    z: Model.rotation.z * (180 / Math.PI),
                },
                result: existingData ? "Pass" : "Fail", // Determine pass/fail
                timeToComplete: existingData ? existingData.timeToComplete : 60, // Max time if failed
            };
        });
    
        // Update state with the complete performance data
        setModelPerformanceData(updatedPerformanceData);
    
        // Show result modal
        setShowResultModal(true);
        setFinalScore({ correct: rawScore, total: totalItems });
        setShowModel(true);
        setShowIntro(false);
    
        // Get the current user
        console.log("Current user:", auth.currentUser); // Debugging log
        if (!auth.currentUser) {
            console.error("No user is currently signed in.");
            return;
        }
    
        const user = auth.currentUser;
    
        // Save the score and performance data to Firestore
        const userDocRef = doc(db, "users", user.uid); // Reference to the user's document
        const scoreData = {
            score: rawScore,
            total: totalItems,
            timestamp: new Date(),
            performanceData: updatedPerformanceData, // Include all models' data
            startTime: simulationStartTime,
            endTime: new Date(),
        };
    
        // Update or create a 'scores' subcollection for the user
        const scoreDocRef = doc(userDocRef, "scores", new Date().toISOString()); // Unique ID based on timestamp
        setDoc(scoreDocRef, scoreData)
            .then(() => {
                console.log("Score and performance data saved to Firestore successfully.");
            })
            .catch((error) => {
                console.error("Error saving score and performance data to Firestore:", error);
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
            {/* Result Modal */}
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
                onClick={generateDetailedReport}
                className="report-button"
            >
                View Detailed Report
            </button>
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

            {/* Lab Confirmation Modal */}
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
{isModalVisible && (
                <div className="popup-guide-overlay">
                    <div 
                        className="popup-guide" 
                        ref={modalRef}
                        style={{
                            position: 'absolute',
                            top: '50px',
                            left: '52x',
                            zIndex: 1000,
                            width: 530,
                        }}
                    >
                        <button className="close-guide-button" onClick={closeModal}>
                            &times;
                        </button>
                        <div className="guide-content">
                            {simulationSettings[currentItem]?.youtubeFile ? (
                                <iframe
                                    width="480"
                                    height="315"
                                    src={simulationSettings[currentItem]?.youtubeFile}
                                    title="YouTube video player"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                >
                                </iframe>
                            ) : (
                                <p>No video available for this simulation.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Intro Screen */}
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

            {/* Main Simulation View */}
            {showModel && (
                <div className="model-viewer-container">
                    {/* Exit Button */}
                    <button
                        onClick={handleExitSimulation}
                        className="exit-button"
                    >
                        X
                    </button>

                    {/* Progress Bar */}
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



                    {/* Slide-Out Panel Toggle Button */}
                    <button
                        className="slide-out-toggle-button"
                        onClick={toggleSlideOutPanel}
                        style={{
                            position: 'absolute',
                            top: '50%',
                            right: showSlideOutPanel ? '300px' : '10px', // Adjust based on panel width
                            background: 'rgba(145, 133, 133, 0.6)',
                            color: 'white',
                            border: 'none',
                            padding: '10px',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            zIndex: 20,
                            transform: 'rotate(0deg)', // Remove rotation for vertical arrows
                            fontSize: '30px', // Ensure arrows are clearly visible
                        }}
                    >
                        {showSlideOutPanel ? '>>' : '<<'} {/* Use up and down arrows */}
                    </button>
                   {/* Slide-Out Panel */}
<div
    className="slide-out-panel"
    style={{
        position: 'fixed',
        top: '0',
        right: showSlideOutPanel ? '0' : '-300px', // Slide in/out effect
        width: '300px',
        height: '100%', // Full height of the viewport
        background: 'linear-gradient(180deg, rgba(61, 58, 58, 0.9), rgba(35, 34, 34, 0.9))', // Gradient background for depth
        color: 'white',
        transition: 'right 0.3s ease-in-out',
        zIndex: 15,
        padding: '20px',
        boxSizing: 'border-box',
        overflowY: 'auto', // Enable vertical scrolling
        boxShadow: '-5px 0 15px rgba(0, 0, 0, 0.5)', // Subtle shadow for depth
        fontFamily: "'Roboto', sans-serif", // Modern font
        fontSize: '14px', // Slightly larger font size
        lineHeight: '1.6', // Improved readability
    }}
>
{/* Title */}
<div style={{
    display: 'flex',
    alignItems: 'center', // Align items vertically in the center
    justifyContent: 'space-between', // Push content to opposite ends
    marginBottom: '15px', // Add spacing below the container
}}>
    {/* Title */}
    <h3 style={{
        margin: 0,
        fontSize: '18px',
        fontWeight: 'bold',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        paddingBottom: '10px',
        color: '#FFD700', // Gold for title
    }}>
        How to Simulate in 3D Environment? 
    </h3>

    {/* YouTube Icon */}
    <div style={{
        display: 'flex',
        marginTop: '1px',
        marginRight: '50px', // Add spacing between text and icon
    }}>
            <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="36"
                height="36"
                fill="#FF0000"
                viewBox="0 0 24 24" 
                style={{ cursor: 'pointer' }}
                onClick={openModal} // Open modal on click
            >
                <path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12c0 5.52 4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
            </svg>
    </div>
</div>

    {/* Dynamic Instruction Text */}
    <p style={{ 
        margin: '0 0 15px 0', 
        fontSize: '14px', 
        color: '#00BFFF' // Light blue for dynamic text
    }}>
        {simulationSettings[currentItem]?.instructionText}
    </p>

    {/* Step 1 */}
    <h2 style={{ 
        margin: '20px 0 10px 0', 
        fontSize: '16px', 
        fontWeight: 'bold', 
        color: '#FFA500' // Orange for step headers
    }}>
        Step 1: Adjust Model to its Target Model Position
    </h2>
    <p style={{ 
        margin: '0 0 15px 0', 
        fontSize: '14px', 
        color: '#FFFFFF' 
    }}>
        <strong>Objective:</strong> Move the model to the exact coordinates (
        <span style={{ color: '#00FF00' }}> {/* Green for coordinates */}
            {simulationSettings[currentItem]?.positionText}
        </span>
        ).
    </p>
    <ul style={{ 
        margin: '0 0 15px 0', 
        paddingLeft: '20px', 
        fontSize: '12px', 
        color: 'rgba(255, 255, 255, 0.8)' 
    }}>
        <li>Locate the <span style={{ color: '#FF4500' }}>Model</span>.</li> {/* Red for keywords */}
        <li>Drag the model to the target coordinates.</li>
        <li>
            Verify the position matches:
            <div style={{ 
                color: '#00FF00', // Green for coordinates
                fontSize: '14px', 
                marginTop: '5px', // Add spacing between text and value
                marginLeft: '20px' // Indent for better readability
            }}>
               ( {simulationSettings[currentItem]?.positionText} )
            </div>
        </li>
    </ul>

    {/* Step 2 */}
    <h2 style={{ 
        margin: '20px 0 10px 0', 
        fontSize: '16px', 
        fontWeight: 'bold', 
        color: '#FFA500' // Orange for step headers
    }}>
        Step 2: Adjust Model to its Target Model Rotation
    </h2>
    <p style={{ 
        margin: '0 0 15px 0', 
        fontSize: '14px', 
        color: '#FFFFFF' 
    }}>
        <strong>Objective:</strong> Rotate the model to the orientation (
        <span style={{ color: '#00FF00' }}> {/* Green for angles */}
            {simulationSettings[currentItem]?.rotationText}
        </span>
        ).
    </p>
    <ul style={{ 
        margin: '0 0 15px 0', 
        paddingLeft: '20px', 
        fontSize: '14px', 
        color: 'rgba(255, 255, 255, 0.8)' 
    }}>
        <li>Locate the <span style={{ color: '#FF4500' }}>Rotation Slider</span>.</li> {/* Red for keywords */}
        <li>Control the sliders to rotate the target angles.</li>
        <li>
            Verify the rotation matches:
            <div style={{ 
                color: '#00FF00', // Green for angles
                fontSize: '14px', 
                marginTop: '5px', // Add spacing between text and value
                marginLeft: '20px' // Indent for better readability
            }}>
            ( {simulationSettings[currentItem]?.rotationText})
            </div>
        </li>
    </ul>

    {/* Step 3 */}
    <h2 style={{ 
        margin: '20px 0 10px 0', 
        fontSize: '16px', 
        fontWeight: 'bold', 
        color: '#FFA500' // Orange for step headers
    }}>
        Step 3: Confirm the Placement
    </h2>
    <p style={{ 
        margin: '0 0 15px 0', 
        fontSize: '14px', 
        color: '#FFFFFF' 
    }}>
        <strong>Objective:</strong> Validate the model's position and rotation.
    </p>
    <ul style={{ 
        margin: '0 0 15px 0', 
        paddingLeft: '20px', 
        fontSize: '14px', 
        color: 'rgba(255, 255, 255, 0.8)' 
    }}>
        <li>Locate the <strong style={{ color: '#FF4500' }}>Verify Placement</strong> button.</li> {/* Red for button */}
        <li>Click the button to check accuracy.</li>
        <li>Review feedback and refine if necessary.</li>
    </ul>

    {/* Step 4 */}
    <h2 style={{ 
        margin: '20px 0 10px 0', 
        fontSize: '16px', 
        fontWeight: 'bold', 
        color: '#FFA500' // Orange for step headers
    }}>
        Step 4: Continue the Simulation
    </h2>
    <p style={{ 
        margin: '0 0 15px 0', 
        fontSize: '14px', 
        color: '#FFFFFF' 
    }}>
        <strong>Objective:</strong> Proceed to the next stage of the simulation.
    </p>
    <ul style={{ 
        margin: '0 0 15px 0', 
        paddingLeft: '20px', 
        fontSize: '14px', 
        color: 'rgba(255, 255, 255, 0.8)' 
    }}>
        <li>Locate the <strong style={{ color: '#FF4500' }}>Next</strong> button.</li> {/* Red for button */}
        <li>Click the button to continue if verified.</li>
        <li>Refine and retry if verification fails.</li>
    </ul>
</div>
        {/* Model Viewer */}
                    <div
                        id="model-viewer"
                        ref={modelViewerRef}
                        className="model-viewer"
                    ></div>

                    {/* Verify Placement Button */}
                    <button
                        onClick={handleVerifyPlacement}
                        className="verify-button"
                        disabled={disableControls}
                    >
                        Verify Placement
                    </button>

                    {/* Next Button */}
                    {passedCurrentItem && currentItem < simulationSettings.length - 1 && (
                        <button
                            onClick={handleNextItem}
                            className="next-button"
                        >
                            Next
                        </button>
                    )}


                    {/* Model Info */}
                    <div className="model-info">
                        <div>Model Position: (x: {handPosition.x.toFixed(2)}, y: {handPosition.y.toFixed(2)}, z: {handPosition.z.toFixed(2)})</div>
                        <div>Model Rotation: (x: {(handRotation.x * 180 / Math.PI).toFixed(2)}°, y: {(handRotation.y * 180 / Math.PI).toFixed(2)}°, z: {(handRotation.z * 180 / Math.PI).toFixed(2)}°)</div>
                    </div>

                    {/* Rotation Controls */}
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

                    {/* Timer */}
                    <div className="timer">
                        <p>Time Remaining: {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Simulation;