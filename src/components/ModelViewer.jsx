import React, { useMemo, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Center, Environment, ContactShadows, useTexture, Text } from '@react-three/drei';
import * as THREE from 'three';
import { createIPhoneModel } from '../model';
import { defaultInternalWallpaper } from '../assets/default_wallpaper';




const PhoneModel = forwardRef(({
    color = '#111111',
    textureUrl = null,
    movementType = 'static',
    rotationSpeed = 0.5,
    bounceSpeed,
    bounceHeight,
    wiggleSpeed,
    wiggleIntensity,
    defaultModelOrientation = null,
    autoSnapBack = false,
    shouldCaptureOrientation = 0,
    onCaptureOrientation,
    userInteraction = true,
    screenRoughness = 0.2, // Default if not passed
    screenEmissive = 0.0, // Default if not passed
    children
}, ref) => {
    const groupRef = useRef();
    const model = useMemo(() => createIPhoneModel(), []);
    const prevCaptureRef = useRef(0);
    const isUserInteracting = useRef(false);
    const timeOffset = useRef(0);
    const currentTime = useRef(0);

    // Drag-to-rotate state
    const isDragging = useRef(false);
    const previousPointer = useRef({ x: 0, y: 0 });
    const userRotation = useRef({ x: 0, y: 0 });

    useImperativeHandle(ref, () => ({
        resetRotation: () => {
            userRotation.current = { x: 0, y: 0 };
            timeOffset.current = currentTime.current;
        },
        getGroup: () => groupRef.current
    }));

    // Update Body Color
    useEffect(() => {
        model.traverse((child) => {
            if (child.isMesh) {
                child.material.color.set(color);
                child.material.roughness = 0.4;
                child.material.metalness = 0.6;
            }
        });

        // Fix rotation order to prevent Gimbal Lock and allow proper Yaw/Pitch
        if (groupRef.current) {
            groupRef.current.rotation.order = 'YXZ';
        }
    }, [model, color]);

    // Reset animation time when movement type changes
    useEffect(() => {
        timeOffset.current = currentTime.current;
    }, [movementType]);

    // Capture orientation when requested
    useEffect(() => {
        if (shouldCaptureOrientation && shouldCaptureOrientation !== prevCaptureRef.current) {
            prevCaptureRef.current = shouldCaptureOrientation;
            if (groupRef.current && onCaptureOrientation) {
                onCaptureOrientation({
                    position: groupRef.current.position.toArray(),
                    rotation: [groupRef.current.rotation.x, groupRef.current.rotation.y, groupRef.current.rotation.z]
                });
            }
        }
    }, [shouldCaptureOrientation, onCaptureOrientation]);

    // Get base orientation from saved default or use zeros
    const basePos = defaultModelOrientation?.position || [0, 0, 0];
    const baseRot = defaultModelOrientation?.rotation || [0, 0, 0];

    // Movement Animation
    useFrame((state, delta) => {
        if (!groupRef.current) return;

        currentTime.current = state.clock.getElapsedTime();
        const time = currentTime.current - timeOffset.current;

        if (movementType === 'bounceWiggle') {
            // Refined "Back and Forth" wiggle - add animation offset to base orientation
            groupRef.current.position.y = basePos[1] + Math.sin(time * (bounceSpeed || 1.5)) * (bounceHeight || 1.5);
            groupRef.current.position.x = basePos[0];
            groupRef.current.position.z = basePos[2];

            // Rocking motion added to base rotation
            const wSpeed = wiggleSpeed || 1.0;
            const wIntensity = wiggleIntensity !== undefined ? wiggleIntensity : 1.0;

            groupRef.current.rotation.x = baseRot[0] + Math.sin(time * 1 * wSpeed) * 0.02 * wIntensity + userRotation.current.x;
            groupRef.current.rotation.y = baseRot[1] + Math.sin(time * 0.8 * wSpeed) * 0.05 * wIntensity + userRotation.current.y;
            groupRef.current.rotation.z = baseRot[2] + Math.sin(time * 1.2 * wSpeed) * 0.03 * wIntensity;
        } else if (movementType === 'parallax') {
            // Parallax Effect - add parallax offset to base orientation
            const x = state.pointer.x;
            const y = state.pointer.y;

            const targetRotX = baseRot[0] - (y * 0.2) + userRotation.current.x;
            const targetRotY = baseRot[1] + (x * 0.4) + userRotation.current.y;
            const targetRotZ = baseRot[2] + (x * 0.1);

            groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.1);
            groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.1);
            groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, targetRotZ, 0.1);

            const targetPosX = basePos[0] + x * 2.0;
            const targetPosY = basePos[1] + y * 2.0;

            groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetPosX, 0.1);
            groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetPosY, 0.1);
            groupRef.current.position.z = basePos[2];

        } else if (movementType === 'static') {
            // In static mode, apply user drag rotation to base orientation
            groupRef.current.position.set(basePos[0], basePos[1], basePos[2]);
            groupRef.current.rotation.x = baseRot[0] + userRotation.current.x;
            groupRef.current.rotation.y = baseRot[1] + userRotation.current.y;
            groupRef.current.rotation.z = baseRot[2];
        } else if (movementType === 'autoRotate') {
            // AutoRotate rotates the model around its Y axis
            groupRef.current.position.set(basePos[0], basePos[1], basePos[2]);
            groupRef.current.rotation.x = baseRot[0] + userRotation.current.x;
            groupRef.current.rotation.y = baseRot[1] + (time * rotationSpeed) + userRotation.current.y; // Rotate over time + user drag
            groupRef.current.rotation.z = baseRot[2];
        }

        // Snap back: gradually reduce user rotation when not dragging
        // Modified to work for ALL modes if autoSnapBack is on
        if (autoSnapBack && !isDragging.current) {
            userRotation.current.x = THREE.MathUtils.lerp(userRotation.current.x, 0, 0.08);
            userRotation.current.y = THREE.MathUtils.lerp(userRotation.current.y, 0, 0.08);
        }
    });

    // Screen Texture
    const texture = useTexture(textureUrl || defaultInternalWallpaper);
    texture.colorSpace = THREE.SRGBColorSpace;

    // Pointer event handlers for drag-to-rotate
    const handlePointerDown = (e) => {
        if (!userInteraction) return;
        e.stopPropagation();
        isDragging.current = true;
        previousPointer.current = { x: e.clientX, y: e.clientY };
        // Capture pointer to receive events even when moving outside
        e.target.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e) => {
        if (!isDragging.current) return;
        const deltaX = e.clientX - previousPointer.current.x;
        const deltaY = e.clientY - previousPointer.current.y;

        // Adjust rotation based on pointer movement
        userRotation.current.x += deltaY * 0.005; // Pitch (inverted for natural feel)
        userRotation.current.y += deltaX * 0.005; // Yaw

        previousPointer.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = (e) => {
        isDragging.current = false;
        e.target.releasePointerCapture(e.pointerId);
    };

    return (
        <group
            ref={groupRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={() => { isDragging.current = false; }}
        >
            {/* Model is now centered at 0,0,0 in model.js, so we only need orientation rotations */}
            <group rotation={[0, Math.PI, 0]}>
                <group rotation={[-Math.PI / 2, 0, 0]}>
                    <primitive object={model} />

                    {/* Screen Overlay - positioned relative to centered model */}
                    <mesh
                        ref={(mesh) => {
                            if (mesh) {
                                mesh.geometry.computeBoundingBox();
                                const box = mesh.geometry.boundingBox;
                                const size = new THREE.Vector3();
                                box.getSize(size);
                                const uvAttribute = mesh.geometry.attributes.uv;
                                const posAttribute = mesh.geometry.attributes.position;

                                for (let i = 0; i < posAttribute.count; i++) {
                                    const x = posAttribute.getX(i);
                                    const y = posAttribute.getY(i);
                                    // Normalize UVs to 0..1 based on bounding box
                                    const u = (x - box.min.x) / size.x;
                                    const v = (y - box.min.y) / size.y;
                                    uvAttribute.setXY(i, u, v);
                                }
                                uvAttribute.needsUpdate = true;
                            }
                        }}
                        position={[0, 7.0, 0]}
                        rotation={[-Math.PI / 2, 0, Math.PI]}
                    >
                        <shapeGeometry args={[
                            (() => {
                                const shape = new THREE.Shape();
                                const width = 76.0;
                                const height = 161.0;
                                const radius = 12.0;
                                const x = -width / 2;
                                const y = -height / 2;

                                shape.moveTo(x, y + radius);
                                shape.lineTo(x, y + height - radius);
                                shape.absarc(x + radius, y + height - radius, radius, Math.PI, Math.PI / 2, true);
                                shape.lineTo(x + width - radius, y + height);
                                shape.absarc(x + width - radius, y + height - radius, radius, Math.PI / 2, 0, true);
                                shape.lineTo(x + width, y + radius);
                                shape.absarc(x + width - radius, y + radius, radius, 0, -Math.PI / 2, true);
                                shape.lineTo(x + radius, y);
                                shape.absarc(x + radius, y + radius, radius, -Math.PI / 2, Math.PI, true);

                                return shape;
                            })()
                        ]} />
                        <meshStandardMaterial
                            color={new THREE.Color().setScalar(Math.max(0, 1 - screenEmissive))} // Darken base as emission increases
                            map={texture}
                            toneMapped={false}
                            roughness={screenRoughness} // controlled by prop
                            metalness={0.1}
                            emissive={new THREE.Color(0xffffff)}
                            emissiveMap={texture}
                            emissiveIntensity={screenEmissive} // controlled by prop
                        />
                    </mesh>
                </group>
            </group>
            {children}
        </group>
    );
});

// CameraCapturer captures camera position when shouldCapture timestamp changes
function CameraCapturer({ shouldCapture, onCapture }) {
    const { camera, controls } = useThree();
    const prevCaptureRef = useRef(0);

    useEffect(() => {
        if (shouldCapture && shouldCapture !== prevCaptureRef.current) {
            prevCaptureRef.current = shouldCapture;
            if (controls && onCapture) {
                onCapture({
                    position: camera.position.toArray(),
                    target: controls.target.toArray()
                });
            }
        }
    }, [shouldCapture, camera, controls, onCapture]);

    return null;
}

function ControlsWrapper({ movementType, rotationSpeed, userInteraction, autoSnapBack, defaultCameraPosition }) {
    const { camera, controls } = useThree();
    const isInteracting = useRef(false);
    const interactionEndTime = useRef(0);
    const lastElapsedTime = useRef(0);
    const SNAP_DELAY = 0.15; // seconds to wait after interaction ends before snapping

    useFrame((state, delta) => {
        if (!controls) return;

        // Track elapsed time for use in onEnd callback
        lastElapsedTime.current = state.clock.elapsedTime;

        const timeSinceInteractionEnd = state.clock.elapsedTime - interactionEndTime.current;

        // Auto Snap Back Logic - snap camera back to default position
        // Wait a short delay after interaction ends to let OrbitControls damping settle
        if (autoSnapBack && defaultCameraPosition && !isInteracting.current && timeSinceInteractionEnd > SNAP_DELAY) {
            const targetPos = new THREE.Vector3().fromArray(defaultCameraPosition.position);
            const targetLook = new THREE.Vector3().fromArray(defaultCameraPosition.target);

            // Use spherical interpolation to maintain distance from target
            // This prevents the "zoom in" effect when lerping in a straight line
            const lerpFactor = 0.08;

            // Interpolate the target/look-at point first
            controls.target.lerp(targetLook, lerpFactor);

            // Get current and target offsets from the look-at point
            const currentOffset = camera.position.clone().sub(controls.target);
            const targetOffset = targetPos.clone().sub(targetLook);

            // Get the target distance (how far the camera should be from the center)
            const targetDistance = targetOffset.length();
            const currentDistance = currentOffset.length();

            // Interpolate the distance
            const newDistance = THREE.MathUtils.lerp(currentDistance, targetDistance, lerpFactor);

            // Interpolate the direction using spherical interpolation (slerp)
            // Normalize both offsets to get directions
            const currentDir = currentOffset.normalize();
            const targetDir = targetOffset.normalize();

            // Create quaternions from the directions for proper slerp
            const currentQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), currentDir);
            const targetQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), targetDir);
            currentQuat.slerp(targetQuat, lerpFactor);

            // Convert back to direction vector
            const newDir = new THREE.Vector3(0, 0, 1).applyQuaternion(currentQuat);

            // Set new camera position: target + direction * distance
            camera.position.copy(controls.target).add(newDir.multiplyScalar(newDistance));

            controls.update();
        }
    });

    return (
        <OrbitControls
            makeDefault
            autoRotate={false}
            autoRotateSpeed={rotationSpeed || 0.5}
            enabled={userInteraction}
            enablePan={false}
            enableRotate={false} // Camera stays fixed - rotation happens on model
            dampingFactor={0.05}
            enableDamping
            minDistance={50}
            maxDistance={500}
            onStart={() => {
                isInteracting.current = true;
            }}
            onEnd={() => {
                isInteracting.current = false;
                interactionEndTime.current = lastElapsedTime.current;
            }}
        />
    );
}

const CaptureController = React.forwardRef(({ phoneRef }, ref) => {
    const { gl, scene, camera, size } = useThree();
    const recordingRef = useRef(null);

    const getCropRegion = (group) => {
        if (!group) return null;

        const box = new THREE.Box3().setFromObject(group);
        if (box.isEmpty()) return null;

        const corners = [
            new THREE.Vector3(box.min.x, box.min.y, box.min.z),
            new THREE.Vector3(box.min.x, box.min.y, box.max.z),
            new THREE.Vector3(box.min.x, box.max.y, box.min.z),
            new THREE.Vector3(box.min.x, box.max.y, box.max.z),
            new THREE.Vector3(box.max.x, box.min.y, box.min.z),
            new THREE.Vector3(box.max.x, box.min.y, box.max.z),
            new THREE.Vector3(box.max.x, box.max.y, box.min.z),
            new THREE.Vector3(box.max.x, box.max.y, box.max.z)
        ];

        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        const width = gl.domElement.width;
        const height = gl.domElement.height;

        corners.forEach(v => {
            v.project(camera);
            const x = (v.x + 1) * 0.5 * width;
            const y = (1 - v.y) * 0.5 * height;

            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
        });

        // Add padding
        const padding = 20 * (gl.getPixelRatio()); // Scale padding with DPI
        minX = Math.max(0, minX - padding);
        minY = Math.max(0, minY - padding);
        maxX = Math.min(width, maxX + padding);
        maxY = Math.min(height, maxY + padding);

        if (maxX <= minX || maxY <= minY) return null;

        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    };

    React.useImperativeHandle(ref, () => ({
        takeScreenshot: async () => {
            // Render a single frame to ensure we capture the latest state
            gl.render(scene, camera);

            // For 4K resolution, we'd ideally resize, but for now we'll use the current high-DPI canvas
            // To properly do 4K, we might need a dedicated render target or resizing logic that is complex with R3F
            // A simple approach is maximizing pixel ratio momentarily
            const originalPixelRatio = gl.getPixelRatio();
            gl.setPixelRatio(3); // Bump up resolution
            gl.render(scene, camera);

            // Calculate crop region
            let crop = null;
            if (phoneRef && phoneRef.current && phoneRef.current.getGroup) {
                crop = getCropRegion(phoneRef.current.getGroup());
            }

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (crop) {
                canvas.width = crop.width;
                canvas.height = crop.height;
                ctx.drawImage(gl.domElement, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
            } else {
                canvas.width = gl.domElement.width;
                canvas.height = gl.domElement.height;
                ctx.drawImage(gl.domElement, 0, 0);
            }

            const dataUrl = canvas.toDataURL('image/png', 1.0);
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `mockup-${Date.now()}.png`;
            link.click();

            // Restore
            gl.setPixelRatio(originalPixelRatio);
        },
        recordVideo: (duration = 5000) => {
            const stream = gl.domElement.captureStream(60);
            const recorder = new MediaRecorder(stream, {
                mimeType: 'video/webm;codecs=vp9'
            });

            const chunks = [];
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `mockup-video-${Date.now()}.webm`;
                link.click();
            };

            recorder.start();
            setTimeout(() => {
                recorder.stop();
            }, duration);
        }
    }));

    return null;
});



function GradientBackground({ visible, startColor, endColor, angle }) {
    const materialRef = useRef();

    // Imperatively update uniforms when props change to ensure instant feedback
    useEffect(() => {
        if (materialRef.current) {
            materialRef.current.uniforms.uStartColor.value.set(startColor || '#ffffff');
            materialRef.current.uniforms.uEndColor.value.set(endColor || '#e5e7eb');
            materialRef.current.uniforms.uAngle.value = (angle || 45) * (Math.PI / 180);
        }
    }, [startColor, endColor, angle]);

    return (
        <mesh visible={visible} position={[0, 0, -1]} renderOrder={-100}>
            <planeGeometry args={[2, 2]} />
            <shaderMaterial
                ref={materialRef}
                depthTest={false}
                depthWrite={false}
                uniforms={useMemo(() => ({
                    uStartColor: { value: new THREE.Color(startColor || '#ffffff') },
                    uEndColor: { value: new THREE.Color(endColor || '#e5e7eb') },
                    uAngle: { value: (angle || 45) * (Math.PI / 180) }
                }), [])} // Empty dependency array to prevent material reconstruction
                vertexShader={`
                        varying vec2 vUv;
                        void main() {
                            vUv = uv;
                            gl_Position = vec4(position, 1.0);
                        }
                    `}
                fragmentShader={`
                        uniform vec3 uStartColor;
                        uniform vec3 uEndColor;
                        uniform float uAngle;
                        varying vec2 vUv;

                        void main() {
                            vec2 uv = vUv - 0.5;
                            float c = cos(uAngle);
                            float s = sin(uAngle);
                            mat2 rotation = mat2(c, -s, s, c);
                            vec2 rotatedUv = rotation * uv;
                            // Map back to 0-1 range roughly for the gradient
                            float t = rotatedUv.y + 0.5; 
                            // Clamp to avoid artifacts
                            t = clamp(t, 0.0, 1.0);
                            
                            gl_FragColor = vec4(mix(uStartColor, uEndColor, t), 1.0);
                        }
                    `}
            />
        </mesh>
    );
}

function Background({ config }) {
    const { backgroundType, backgroundColor, backgroundGradientStart, backgroundGradientEnd, backgroundGradientAngle } = config;
    const { scene } = useThree();

    // Handle solid and transparent backgrounds imperatively
    useEffect(() => {
        if (backgroundType === 'solid') {
            scene.background = new THREE.Color(backgroundColor || '#e5e7eb');
        } else {
            // For gradient or transparent, we clear the solid scene background
            scene.background = null;
        }
    }, [backgroundType, backgroundColor, scene]);

    return (
        <GradientBackground
            visible={backgroundType === 'gradient'}
            startColor={backgroundGradientStart}
            endColor={backgroundGradientEnd}
            angle={backgroundGradientAngle}
        />
    );
}

const ModelViewer = React.forwardRef(({ config = {}, setConfig }, ref) => {
    const {
        color = '#111111',
        textureUrl = null,
        movementType = 'static',
        userInteraction = true,
        backgroundAlpha = 1.0,
        shouldCaptureDefault = 0,
        defaultModelOrientation = null,
        autoSnapBack = false,
        rotationSpeed = 0.5,
        bounceSpeed = 1.5,
        bounceHeight = 1.5,
        wiggleSpeed = 1.0,
        wiggleIntensity = 1.0,
        lightingPreset = 'city',
        aspectRatio = 'native',
        screenRoughness = 0.2,
        screenEmissive = 0.0,
    } = config;

    const phoneRef = useRef();
    const captureRef = useRef();

    useImperativeHandle(ref, () => ({
        takeScreenshot: () => captureRef.current?.takeScreenshot(),
        recordVideo: (duration) => captureRef.current?.recordVideo(duration),
        resetModel: () => phoneRef.current?.resetRotation()
    }));

    const handleOrientationCapture = (orientation) => {
        if (setConfig) {
            setConfig(prev => ({ ...prev, defaultModelOrientation: orientation }));
        }
    };

    const handleCameraCapture = (cameraState) => {
        if (setConfig) {
            setConfig(prev => ({ ...prev, defaultCameraPosition: cameraState }));
        }
    };

    return (
        <div style={{
            display: 'flex',
            position: 'relative',
            marginLeft: '340px',
            width: 'calc(100% - 340px)',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden'
        }}>
            <div style={
                aspectRatio === 'native' ? {
                    width: '100%',
                    height: '100%'
                } : {
                    aspectRatio: aspectRatio.replace(':', '/'),
                    width: 'auto',
                    height: 'auto',
                    maxWidth: '90%',
                    maxHeight: '90%',
                    boxShadow: '0 0 0 1px rgba(0,0,0,0.05), 0 20px 50px rgba(0,0,0,0.1)',
                    position: 'relative'
                }
            }>
                <Canvas
                    camera={{ position: [0, 0, 275], fov: 45 }}
                    gl={{ preserveDrawingBuffer: true, alpha: true }}
                    resize={{ scroll: false, debounce: { scroll: 50, resize: 0 } }}
                    style={{ width: '100%', height: '100%', display: 'block' }}
                >
                    <Background config={config} />

                    {/* Lighting */}
                    <Environment preset={lightingPreset} />
                    <ambientLight intensity={0.5} />

                    <PhoneModel
                        ref={phoneRef}
                        color={color}
                        textureUrl={textureUrl}
                        movementType={movementType}
                        rotationSpeed={rotationSpeed}
                        bounceSpeed={bounceSpeed}
                        bounceHeight={bounceHeight}
                        wiggleSpeed={wiggleSpeed}
                        wiggleIntensity={wiggleIntensity}
                        defaultModelOrientation={defaultModelOrientation}
                        autoSnapBack={autoSnapBack}
                        shouldCaptureOrientation={shouldCaptureDefault}
                        onCaptureOrientation={handleOrientationCapture}
                        userInteraction={userInteraction}
                        screenRoughness={screenRoughness}
                        screenEmissive={screenEmissive}
                    />



                    <CaptureController ref={captureRef} phoneRef={phoneRef} />

                    <CameraCapturer
                        shouldCapture={shouldCaptureDefault}
                        onCapture={handleCameraCapture}
                    />

                    <ControlsWrapper
                        movementType={movementType}
                        rotationSpeed={rotationSpeed}
                        userInteraction={userInteraction}
                        autoSnapBack={autoSnapBack}
                        defaultCameraPosition={config.defaultCameraPosition}
                    />
                </Canvas>
            </div>
        </div>
    );
});

export default ModelViewer;
