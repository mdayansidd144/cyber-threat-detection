import React, { useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as THREE from 'three';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!loading || !canvasRef.current) return;

    const container = canvasRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 400;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b132b);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404060);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00e5ff, 1, 20);
    pointLight.position.set(2, 3, 5);
    scene.add(pointLight);

    const magentaLight = new THREE.PointLight(0xff007f, 0.6, 20);
    magentaLight.position.set(-3, -1, 4);
    scene.add(magentaLight);

    const ringGeometry = new THREE.TorusGeometry(2.2, 0.06, 32, 64);
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      emissive: 0x00e5ff,
      emissiveIntensity: 0.3,
      metalness: 0.9,
      roughness: 0.1,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 3;
    ring.rotation.z = 0.2;
    scene.add(ring);

    const innerRingGeo = new THREE.TorusGeometry(1.6, 0.04, 24, 48);
    const innerRingMat = new THREE.MeshStandardMaterial({
      color: 0xff007f,
      emissive: 0xff007f,
      emissiveIntensity: 0.5,
      metalness: 0.8,
      roughness: 0.2,
    });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRing.rotation.x = Math.PI / 2.5;
    innerRing.rotation.z = -0.3;
    scene.add(innerRing);

    const coreGeo = new THREE.SphereGeometry(0.35, 32, 32);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 2,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.set(0, 0, 0);
    scene.add(core);

    const glowGeo = new THREE.SphereGeometry(0.55, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xff007f,
      transparent: true,
      opacity: 0.15,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.set(0, 0, 0);
    scene.add(glow);

    const particleCount = 600;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const radius = 1.5 + Math.random() * 4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 2;
      positions[i * 3] = radius * Math.sin(theta) * Math.cos(phi);
      positions[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
      positions[i * 3 + 2] = radius * Math.cos(theta);
      const mix = Math.random();
      colors[i * 3] = 0.0 + mix * 1.0;
      colors[i * 3 + 1] = 0.9 - mix * 0.9;
      colors[i * 3 + 2] = 1.0 - mix * 0.6;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.06,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    const animate = () => {
      const elapsedTime = performance.now() / 1000;
      ring.rotation.y += 0.005;
      innerRing.rotation.y -= 0.008;
      const pulse = 1 + Math.sin(elapsedTime * 3) * 0.15;
      core.scale.set(pulse, pulse, pulse);
      glow.scale.set(pulse * 1.8, pulse * 1.8, pulse * 1.8);
      glowMat.opacity = 0.1 + Math.sin(elapsedTime * 3) * 0.05;
      particles.rotation.y += 0.001;
      particles.rotation.x += 0.0005;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight || 400;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [loading]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0b132b] font-mono">
        <div ref={canvasRef} className="absolute inset-0 z-0" />
        <div className="relative z-10 flex flex-col items-center gap-6 bg-[rgba(11,19,43,0.6)] backdrop-blur-lg px-8 md:px-12 py-10 rounded-2xl border border-[rgba(255,0,127,0.2)] shadow-[0_0_80px_rgba(255,0,127,0.05)]">
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl md:text-3xl font-black text-white tracking-[0.2em] [text-shadow:0_0_30px_rgba(0,229,255,0.15)]">
              EVENT HORIZON
            </span>
            <span className="text-[0.6rem] text-[rgba(0,229,255,0.4)] tracking-[0.4em] uppercase animate-pulse">
              authenticating...
            </span>
          </div>
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full border-2 border-transparent border-t-[#00e5ff] animate-spin" />
            <div className="w-3 h-3 rounded-full border-2 border-transparent border-t-[#ff007f] animate-spin [animation-delay:0.2s]" />
            <div className="w-3 h-3 rounded-full border-2 border-transparent border-t-white animate-spin [animation-delay:0.4s]" />
          </div>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;