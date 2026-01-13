export function generateEmbedCode(config) {
    const { color, textureUrl, autoRotate, backgroundAlpha } = config;

    // Note regarding textureUrl: In a real app, this should be an uploaded URL (S3/Cloudinary).
    // For this LOCAL demo, blob URLs won't work in a separate window/user's site.
    // We will warn the user or use a placeholder if it's a blob.

    const isBlob = textureUrl?.startsWith('blob:');
    const safeTexture = isBlob ? 'YOUR_IMAGE_URL_HERE' : (textureUrl || 'https://placehold.co/1080x1920/png?text=Screen');

    return `
<!DOCTYPE html>
<html>
<head>
    <title>3D iPhone Mockup</title>
    <style>
        body { margin: 0; overflow: hidden; background-color: ${backgroundAlpha === 0 ? 'transparent' : '#eeeeee'}; }
        canvas { display: block; }
    </style>
    <!-- Import Map for React/Three/Fiber modules (Simplified for vanilla three.js usage) -->
    <!-- For a true standalone vanilla export without build steps, standard Three.js is best -->
    <script type="importmap">
        {
            "imports": {
                "three": "https://unpkg.com/three@0.160.0/build/three.module.js",
                "three/addons/": "https://unpkg.com/three@0.160.0/examples/jsm/"
            }
        }
    </script>
</head>
<body>
    <script type="module">
        import * as THREE from 'three';
        import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
        import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

        // --- Configuration ---
        const CONFIG = {
            color: "${color}",
            textureUrl: "${safeTexture}",
            movementType: "${config.movementType || 'static'}",
            userInteraction: ${config.userInteraction},
            cameraPosition: ${JSON.stringify(config.cameraPosition)},
            backgroundAlpha: ${backgroundAlpha}
        };

        // --- Scene Setup ---
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        
        if (CONFIG.cameraPosition) {
            camera.position.fromArray(CONFIG.cameraPosition.position);
        } else {
            camera.position.set(0, 150, 150);
        }

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        document.body.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.enabled = CONFIG.userInteraction;
        controls.autoRotate = CONFIG.movementType === 'autoRotate';
        
        if (CONFIG.cameraPosition) {
            controls.target.fromArray(CONFIG.cameraPosition.target);
            controls.update();
        }

        // --- Lighting & Environment ---
        new RGBELoader()
            .setPath('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/equirectangular/')
            .load('royal_esplanade_1k.hdr', function (texture) {
                texture.mapping = THREE.EquirectangularReflectionMapping;
                scene.environment = texture;
            });
            
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        // --- Geometry (Mock Representation) ---
        // Note: The actual complex geometry from model.js is too large to inline here easily.
        // For this export demo, we will use a simple Box to represent the phone 
        // unless we export the GLTF or fetch the vertex data.
        // To make this "Real", we would need to host the model file.
        
        const group = new THREE.Group();
        scene.add(group);

        // Body
        const bodyGeo = new THREE.BoxGeometry(70, 145, 10);
        const bodyMat = new THREE.MeshStandardMaterial({ 
            color: CONFIG.color,
            roughness: 0.4,
            metalness: 0.6
        });
        const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
        group.add(bodyMesh);

        // Screen
        const screenGeo = new THREE.PlaneGeometry(65, 140);
        const textureLoader = new THREE.TextureLoader();
        const screenMat = new THREE.MeshBasicMaterial({ 
            color: 0xffffff
        });
        
        if (CONFIG.textureUrl) {
            textureLoader.load(CONFIG.textureUrl, (tex) => {
                tex.colorSpace = THREE.SRGBColorSpace;
                screenMat.map = tex;
                screenMat.needsUpdate = true;
            });
        }
        
        const screenMesh = new THREE.Mesh(screenGeo, screenMat);
        screenMesh.position.set(0, 0, 5.1); // Slightly in front of box
        group.add(screenMesh);

        // --- Animation Loop ---
        const clock = new THREE.Clock();
        function animate() {
            requestAnimationFrame(animate);
            controls.update();

            const time = clock.getElapsedTime();
            if (CONFIG.movementType === 'bounceWiggle') {
                group.position.y = Math.sin(time * 2) * 2;
                group.rotation.x = Math.sin(time * 1.5) * 0.05;
                group.rotation.y = Math.sin(time * 1) * 0.1;
                group.rotation.z = Math.sin(time * 1.2) * 0.05;
            } else if (CONFIG.movementType === 'static' || CONFIG.movementType === 'autoRotate') {
                 group.position.y = 0;
                 group.rotation.set(0,0,0);
            }

            renderer.render(scene, camera);
        }
        animate();

        // --- Resize Handler ---
        window.addEventListener('resize', onWindowResize, false);
        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
    </script>
</body>
</html>
    `.trim();
}
