import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Box } from 'lucide-react';

const ThreeDModel = ({ data }) => {
    const mountRef = useRef(null);
    const { three_d_model_code, three_d_model_description } = data;

    useEffect(() => {
        if (!mountRef.current) return;

        // Clean up previous renderer if any (React strict mode calls effect twice)
        while (mountRef.current.firstChild) {
            mountRef.current.removeChild(mountRef.current.firstChild);
        }

        // Setup Scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf8fafc); // Light gray-ish background matching UI

        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;

        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.set(3, 3, 5); // default position

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        mountRef.current.appendChild(renderer.domElement);

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 7);
        scene.add(directionalLight);

        // Grid Helper
        const gridHelper = new THREE.GridHelper(10, 10, 0xddd6fe, 0xe2e8f0);
        scene.add(gridHelper);

        // Execute generated code
        let updateFn = null;
        try {
            // Basic validation
            if (!three_d_model_code.includes('init3D')) {
                throw new Error("No init3D function found in generated code.");
            }

            // Wrap code to return the function
            const factory = new Function(three_d_model_code + "\nreturn init3D;");
            const init3D = factory();

            // Ensure THREE is globally available for the generated code if it relies on global THREE
            window.THREE = THREE;

            const result = init3D(scene);

            // Center camera on object if possible? 
            // For now, let's trust the default camera position or the user code.

            if (result && result.update) {
                updateFn = result.update;
            }

        } catch (e) {
            console.error("Error executing Three.js code:", e);
            const errorDiv = document.createElement('div');
            errorDiv.className = "absolute inset-0 flex items-center justify-center text-red-500 font-mono text-xs p-4 bg-red-50";
            errorDiv.innerText = 'Error rendering 3D model: ' + e.message;
            mountRef.current.appendChild(errorDiv);
        }

        // Animation Loop
        let animationId;
        const animate = (time) => {
            animationId = requestAnimationFrame(animate);
            controls.update();

            if (updateFn) {
                try {
                    updateFn(time * 0.001); // pass seconds
                } catch (err) {
                    console.error("Animation Error", err);
                    updateFn = null; // stop crashing
                }
            }

            renderer.render(scene, camera);
        };
        animate(0);

        // Handle Resize
        const handleResize = () => {
            if (!mountRef.current) return;
            const w = mountRef.current.clientWidth;
            const h = mountRef.current.clientHeight;
            renderer.setSize(w, h);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        };

        // Use ResizeObserver for more robust resizing
        const resizeObserver = new ResizeObserver(() => handleResize());
        resizeObserver.observe(mountRef.current);

        // Cleanup
        return () => {
            resizeObserver.disconnect();
            cancelAnimationFrame(animationId);

            // Dispose resources to avoid leaks
            renderer.dispose();
            // Quick dispose of scene objects
            scene.traverse((object) => {
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });

            if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
                // mountRef.current.removeChild(renderer.domElement); 
                // handled by while loop at start or React unmounting
            }
        };
    }, [three_d_model_code]);

    return (
        <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/80 backdrop-blur flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Box size={18} className="text-blue-600" />
                    <h3 className="font-semibold text-gray-800">Interactive 3D Model</h3>
                </div>
                <span className="text-xs font-mono text-gray-500 bg-white border border-gray-200 px-2 py-1 rounded">WebGL</span>
            </div>
            <div className="relative flex-1 bg-gray-50" ref={mountRef} style={{ minHeight: '400px' }}>
                {/* Canvas will be injected here */}
            </div>
            {three_d_model_description && (
                <div className="p-4 bg-white text-sm text-gray-600 border-t border-gray-100 leading-relaxed">
                    {three_d_model_description}
                </div>
            )}
        </div>
    );
};

export default ThreeDModel;
