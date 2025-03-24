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
                instructionText: "Properly simulate the PA Hand position",
                guideText: [
                    {
                        type: "heading",
                        content: ""
                    },
                    {
                        type: "section",
                        content: {
                            technicalFactors: [
                                "Minimum SID: 40 inches (100 cm).",
                                "IR size: 10 x 12 inches (24 x 30 cm), portrait; collimate to area of interest.",
                                "kVp range: 55 to 65.",
                            ],
                            shielding: "Shield radiosensitive tissues outside the region of interest.",
                            patientPosition: "Seat patient at the end of the table with hand and forearm extended.",
                            partPosition: [
                                "Pronate hand with palmar surface in contact with IR; spread fingers slightly.",
                                "Align the long axis of hand and forearm with the long axis of IR.",
                                "Center hand and wrist to IR."
                            ],
                            cr: "CR perpendicular to IR, directed to third MCP joint."
                        }
                    },
                    {
                        type: "heading",
                        content: <strong>How to Simulate in 3D Environment?</strong>
                    },
                    {
                        type: "list",
                        items: [
                            "- Adjust model to its Target Model Position: (0.61, -8.88, -7.22)",
                            "- Adjust model to its Target Model Rotation: (0°, 0°, 0°)",
                            "- To confirm, click Verify Placement",
                            "- If verified, click Next to continue the simulation.",
                            "- If verification fails, refine the position and rotation until the criteria are met."
                        ]
                    }
                ],
                imagePath: '/pics/hand.png' // Add image path here
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
                instructionText: "Properly simulate the Lateral Wrist position",
                guideText: [
                    {
                        type: "heading",
                        content: ""
                    },
                    {
                        type: "section",
                        content: {
                            technicalFactors: [
                                "Minimum SID: 40 inches (100 cm).",
                                "IR size: 8 x 10 inches (18 x 24 cm), portrait; smallest IR available and collimate to area of interest",
                                "kVp range: 60 to 70 ."
                            ],
                            shielding: "Shield radiosensitive tissues outside the region of interest.",
                            patientPosition: "Seat patient at the end of the table, with arm and forearm resting on the table. Place wrist and hand on IR in a thumb-up lateral position. Shoulder, elbow, and wrist should be on the same horizontal plane.",
                            partPosition: [
                                "Align and center hand and wrist to the long axis of IR.",
                                "Adjust hand and wrist into a true lateral position, with fingers comfortably extended; if support is needed to prevent motion, use a radiolucent support block and sandbag, and place the block against extended hand and fingers.",
                            ],
                            cr: "CR perpendicular to IR, directed to midcarpal area."
                        }
                    },
                    {
                        type: "heading",
                        content: <strong>How to Simulate in 3D Environment?</strong>
                    },
                    {
                        type: "list",
                        items: [
                            "- Adjust model to its Target Model Position: (1.39, 0.08, -0.42 )",
                            "- Adjust model to its Target Model Rotation: (0°, 0°, -90°)",
                            "- To confirm, click Verify Placement",
                            "- If verified, click Next to continue the simulation.",
                            "- If verification fails, refine the position and rotation until the criteria are met.",

                        ]
                    },
                ],
                imagePath: '/pics/wrist.png' // Add image path here
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
                instructionText: "Properly simulate the AP Elbow position",
                guideText: [
                    {
                        type: "heading",
                        content: ""
                    },
                    {
                        type: "section",
                        content: {
                            technicalFactors: [
                                "Minimum SID: 40 inches (100 cm).",
                                "IR size: 10 x 12 inches (24 x 30 cm), portrait; smallest IR available and collimate to area of interest",
                                "kVp range: 65 to 75 ."
                            ],
                            shielding: "Shield radiosensitive tissues outside the region of interest.",
                            patientPosition: "Seat patient at the end of the table, with elbow fully extended, if possible. ",
                            partPosition: [
                                "Extend elbow, supinate hand, and align arm and forearm with the long axis of IR.",
                                "Ask the patient to lean laterally as necessary for true AP projection. Palpate humeral epicondyles to ensure that the interepicondylar plane is parallel to the IR. </",
                            ],
                            cr: "CR perpendicular to IR, directed to mid-elbow joint, which is approximately 3/4 inch (2 cm) distal to the midpoint of a line between epicondyles."
                        }
                    },
                    {
                        type: "heading",
                        content: <strong>How to Simulate in 3D Environment?</strong>
                    },
                    {
                        type: "list",
                        items: [
                            "- Adjust model to its Target Model Position: (-3.63, -3.33, 4.66)",
                            "- Adjust model to its Target Model Rotation: (0°, 0°, -180° / 180°)",
                            "- To confirm, click Verify Placement",
                            "- If verified, click Next to continue the simulation.",
                            "- If verification fails, refine the position and rotation until the criteria are met.",

                        ]
                    },
                ],
                imagePath: '/pics/elbow.png' // Add image path here
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
                instructionText: "Properly simulate the AP Foot position",
                guideText: [
                    {
                        type: "heading",
                        content: ""
                    },
                    {
                        type: "section",
                        content: {
                            technicalFactors: [
                                "Minimum SID: 40 inches (100 cm).",
                                "IR size:10 x 12 inches (24 x 30 cm), portrait",
                                "kVp range: 55 to 65 ."
                            ],
                            shielding: "Shield radiosensitive tissues outside the region of interest.",
                            patientPosition: "Place patient supine; provide a pillow for the patient’s head; flex knee and place plantar surface (sole) of affected foot flat on IR",
                            partPosition: [
                                "Extend (plantar flex) foot but maintain plantar surface resting flat and firmly on IR.",
                                "Align and center long axis of foot to CR and to the long axis of the portion of IR being exposed.",
                                "Use sandbags if necessary to prevent IR from slipping on the tabletop.",
                                "If immobilization is needed, flex opposite knee and rest against affected knee for support.",
                            ],
                            cr: "Angle CR 10° posteriorly (toward heel) with CR perpendicular to metatarsals."
                        }
                    },
                    {
                        type: "heading",
                        content: <strong>How to Simulate in 3D Environment?</strong>
                    },
                    {
                        type: "list",
                        items: [
                            "- Adjust model to its Target Model Position: (0.22, -7.90, 1.26 )",
                            "- Adjust model to its Target Model Rotation: (0°, 0°, 0°)",
                            "- To confirm, click Verify Placement",
                            "- If verified, click Next to continue the simulation.",
                            "- If verification fails, refine the position and rotation until the criteria are met.",

                        ]
                    },
                ],
                imagePath: '/pics/foot.png' // Add image path here
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
                instructionText: "Properly simulate the Lateral Ankle position",
                guideText: [
                    {
                        type: "heading",
                        content: ""
                    },
                    {
                        type: "section",
                        content: {
                            technicalFactors: [
                                "Minimum SID: 40 inches (100 cm).",
                                "IR size: 10 x 12 inches (24 x 30 cm), portrait. ",
                                "kVp range: 60 to 75."
                            ],
                            shielding: "Shield radiosensitive tissues outside the region of interest.",
                            patientPosition: "Place the patient in the lateral recumbent position, affected side down; provide a pillow for the patient’s head; flex the knee of the affected limb approximately 45°. Place the opposite leg behind the injured limb to prevent over-rotation.",
                            partPosition: [
                                "Center and align the ankle joint to the CR and the long axis of the portion of the IR being exposed.",
                                "Place support under the knee as needed to place the leg and foot in a true lateral position.",
                            ],
                            cr: "CR perpendicular to IR, directed to the medial malleolus."
                        }
                    },
                    {
                        type: "heading",
                        content: <strong>How to Simulate in 3D Environment?</strong>
                    },
                    {
                        type: "list",
                        items: [
                            "- Adjust model to its Target Model Position: (-8.67, 0.24, 1.59 )",
                            "- Adjust model to its Target Model Rotation: (-180°, 90°, -90°)",
                            "- To confirm, click Verify Placement",
                            "- If verified, click Next to continue the simulation.",
                            "- If verification fails, refine the position and rotation until the criteria are met.",

                        ]
                    },
                ],
                imagePath: '/pics/ankle.png' // Add image path here
            }
        ];

        const toggleGuide = () => {
            setShowGuide((prev) => !prev);
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
            
            // Save any remaining model data for failed attempts
            for (let i = 0; i < totalItems; i++) {
                // Check if this model already has performance data
                if (!modelPerformanceData.some(data => data.modelName === getModelName(i))) {
                    // If no data exists, it means the user failed or skipped this model
                    const { targetPosition, targetRotation } = simulationSettings[i];
                    setModelPerformanceData(prev => [...prev, {
                        modelName: getModelName(i),
                        targetPosition,
                        targetRotation: {
                            x: targetRotation.x * (180 / Math.PI),
                            y: targetRotation.y * (180 / Math.PI),
                            z: targetRotation.z * (180 / Math.PI)
                        },
                        userPosition: handPosition, // Use handPosition here
                        userRotation: {
                            x: Model.rotation.x * (180 / Math.PI),
                            y: Model.rotation.y * (180 / Math.PI),
                            z: Model.rotation.z * (180 / Math.PI)
                        },
                        result: "Fail",
                        timeToComplete: 60 // Max time
                    }]);
                }
            }
            
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
            
            if (user) {
                // Save the score to Firestore
                const userDocRef = doc(db, "users", user.uid); // Reference to the user's document
                const scoreData = {
                    score: rawScore,
                    total: totalItems,
                    timestamp: new Date(),
                    performanceData: modelPerformanceData,
                    startTime: simulationStartTime,
                    endTime: new Date()
                };
        
                // Update or create a 'scores' subcollection for the user
                const scoreDocRef = doc(userDocRef, "scores", new Date().toISOString()); // Unique ID based on timestamp
                setDoc(scoreDocRef, scoreData)
                    .then(() => {
                        console.log("Score saved to Firestore successfully.");
                    })
                    .catch((error) => {
                        console.error("Error saving score to Firestore:", error);
                    });
            }
        
            // Optionally, keep the Google Forms submission if needed
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
    
                        {/* Red Book Icon */}
                        <div className="book-icon" onClick={toggleGuide}>
                            📖
                        </div>
    
                        {/* Popup Guide */}
{showGuide && (
    <div className="popup-guide-overlay">
        <div className="popup-guide">
            <button
                className="close-guide-button"
                onClick={toggleGuide}
            >
                X
            </button>
            <h3>Instructions:</h3>
<div className="guide-content">
    {/* Image */}
    <div className="guide-image">
        <img src={simulationSettings[currentItem]?.imagePath} alt="Guide" />
    </div>
    {/* Text */}
    <div className="guide-text">
        {simulationSettings[currentItem]?.guideText.map((section, index) => {
            if (section.type === "heading") {
                return <h4 key={index}>{section.content}</h4>;
            } else if (section.type === "list") {
                return (
                    <ul key={index}>
                        {section.items.map((item, idx) => (
                            <li key={idx}>{item}</li>
                        ))}
                    </ul>
                );
            } else if (section.type === "section") {
                return (
                    <div key={index} className="scrollable-section">
                        {/* Technical Factors */}
                        <h4><strong>Technical Factors:</strong></h4>
                        <ul>
                            {section.content.technicalFactors.map((item, idx) => (
                                <li key={idx}>{item}</li>
                            ))}
                        </ul>

                        {/* Shielding */}
                        <h4><strong>Shielding:</strong></h4>
                        <p>{section.content.shielding}</p>

                        {/* Patient Position */}
                        <h4><strong>Patient Position:</strong></h4>
                        <p>{section.content.patientPosition}</p>

                        {/* Part Position */}
                        <h4><strong>Part Position:</strong></h4>
                        <ul>
                            {section.content.partPosition.map((item, idx) => (
                                <li key={idx}>{item}</li>
                            ))}
                        </ul>

                        {/* CR */}
                        <h4><strong>CR:</strong></h4>
                        <p>{section.content.cr}</p>
                    </div>
                );  
                        }
                        return null; // Ignore invalid sections
                    })}
                </div>
            </div>
        </div>
    </div>
)}
    
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
    
                        {/* Feedback Message */}
                        {feedbackMessage && (
                            <div 
                                className="feedback-message"
                                style={{ color: feedbackColor }}
                            >
                                {feedbackMessage}
                            </div>
                        )}
    
                        {/* Model Info */}
                        <div className="model-info">
                            <div>Model Position: ({handPosition.x.toFixed(2)}, {handPosition.y.toFixed(2)}, {handPosition.z.toFixed(2)})</div>
                            <div>Model Rotation: ({(handRotation.x * 180 / Math.PI).toFixed(2)}°, {(handRotation.y * 180 / Math.PI).toFixed(2)}°, {(handRotation.z * 180 / Math.PI).toFixed(2)}°)</div>
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