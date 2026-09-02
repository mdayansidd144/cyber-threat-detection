import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';

const NotFound = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const container = canvasRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 300;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b132b);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 6);
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

    const ringGeometry = new THREE.TorusGeometry(1.8, 0.05, 32, 64);
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

    const innerRingGeo = new THREE.TorusGeometry(1.2, 0.03, 24, 48);
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

    const coreGeo = new THREE.SphereGeometry(0.25, 32, 32);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 2,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    const particleCount = 400;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const radius = 1.5 + Math.random() * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 2;
      positions[i * 3] = radius * Math.sin(theta) * Math.cos(phi);
      positions[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
      positions[i * 3 + 2] = radius * Math.cos(theta);
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.05,
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.6,
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
      particles.rotation.y += 0.001;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight || 300;
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
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#0b132b] font-mono overflow-hidden">
      <div ref={canvasRef} className="absolute inset-0 z-0" />
      <div className="relative z-10 text-center bg-[rgba(11,19,43,0.8)] backdrop-blur-lg px-8 md:px-12 py-10 rounded-2xl border border-[rgba(255,0,127,0.15)] shadow-[0_0_80px_rgba(255,0,127,0.05)]">
        <div className="text-7xl md:text-8xl font-black bg-gradient-to-r from-[#00e5ff] to-[#ff007f] bg-clip-text text-transparent">
          404
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-wider mt-4">Event Horizon Lost</h1>
        <p className="text-[0.9rem] text-[rgba(255,255,255,0.4)] mt-2 mb-6">
          The page you're looking for has been consumed by the void.
        </p>
        <Link
          to="/dashboard"
          className="inline-block px-6 py-3 bg-gradient-to-r from-[rgba(0,229,255,0.1)] to-[rgba(255,0,127,0.1)] border border-[rgba(0,229,255,0.2)] rounded-full text-[#00e5ff] font-mono text-sm font-semibold tracking-wider transition-all hover:bg-gradient-to-r hover:from-[rgba(0,229,255,0.2)] hover:to-[rgba(255,0,127,0.2)] hover:border-[#00e5ff] hover:shadow-[0_0_40px_rgba(0,229,255,0.1)] hover:scale-105"
        >
          Return to Safety
        </Link>
      </div>
    </div>
  );
};

export default NotFound;