import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/api';
import * as THREE from 'three';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || loading) return;

    const container = canvasRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 200;

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

    const magentaLight = new THREE.PointLight(0xff007f, 0.6, 20);
    magentaLight.position.set(-3, -1, 4);
    scene.add(magentaLight);

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

    const coreGeo = new THREE.SphereGeometry(0.2, 32, 32);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 2,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    const particleCount = 300;
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
      particles.rotation.x += 0.0005;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight || 200;
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardService.getDashboard();
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

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
              securing your data...
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

  const stats = dashboardData?.stats || {
    total: 0,
    active: 0,
    investigating: 0,
    contained: 0,
    resolved: 0,
  };

  const threatLevel = stats.active > 50 ? 'Critical' : stats.active > 20 ? 'High' : stats.active > 5 ? 'Medium' : 'Low';
  const threatColor = threatLevel === 'Critical' ? '#ff007f' : threatLevel === 'High' ? '#ff4d00' : threatLevel === 'Medium' ? '#ffcc00' : '#00e5ff';

  return (
    <div className="min-h-screen bg-[#0b132b] font-mono">
      <div className="p-4 md:p-8 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-[rgba(0,229,255,0.06)]">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-wider [text-shadow:0_0_30px_rgba(0,229,255,0.05)]">
              Security Operations Center
            </h1>
            <p className="text-[0.7rem] md:text-[0.8rem] text-[rgba(0,229,255,0.4)] tracking-wider mt-1">
              Real-time threat intelligence · {new Date().toLocaleDateString()}
            </p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2 w-full md:w-auto">
            <div className="flex items-center gap-3 px-4 py-1.5 border rounded-full text-xs font-semibold uppercase tracking-wider" style={{ borderColor: threatColor }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: threatColor }} />
              <span style={{ color: threatColor }}>{threatLevel} Threat Level</span>
            </div>
            <div className="text-sm text-[rgba(255,255,255,0.5)]">
              <span></span> Welcome back, <strong className="text-white">{user?.username || 'Analyst'}</strong>
              <span className="text-[0.6rem] text-[rgba(0,229,255,0.3)] ml-2">({user?.email || ''})</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4 mb-6">
          {[
            { icon: '', value: stats.total, label: 'Total Threats' },
            { icon: '', value: stats.active, label: 'Active', active: true },
            { icon: '', value: stats.investigating, label: 'Investigating' },
            { icon: '', value: stats.contained, label: 'Contained' },
            { icon: '', value: stats.resolved, label: 'Resolved' },
          ].map((stat, index) => (
            <div
              key={index}
              className={`p-4 text-center rounded-xl border transition-all hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(0,229,255,0.05)] ${
                stat.active
                  ? 'border-[rgba(255,0,127,0.3)] bg-[rgba(255,0,127,0.05)] relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5 before:bg-gradient-to-r before:from-transparent before:via-[#ff007f] before:to-transparent before:animate-[scanline_2s_ease-in-out_infinite]'
                  : 'border-[rgba(0,229,255,0.06)] bg-[rgba(0,229,255,0.02)]'
              }`}
            >
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className={`text-2xl md:text-3xl font-black ${stat.active ? 'text-[#ff007f] [text-shadow:0_0_20px_rgba(255,0,127,0.1)]' : 'text-[#00e5ff] [text-shadow:0_0_20px_rgba(0,229,255,0.1)]'}`}>
                {stat.value}
              </div>
              <div className="text-[0.6rem] md:text-[0.65rem] text-[rgba(255,255,255,0.4)] uppercase tracking-wider mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Map Section */}
          <div className="p-4 md:p-6 rounded-xl border border-[rgba(0,229,255,0.06)] bg-[rgba(0,229,255,0.02)] hover:border-[rgba(0,229,255,0.1)] transition-all">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base md:text-lg font-bold text-white tracking-wider"> Live Threat Map</h2>
              <span className="text-[0.55rem] px-3 py-1 rounded-full bg-[rgba(0,229,255,0.05)] border border-[rgba(0,229,255,0.1)] text-[rgba(0,229,255,0.6)] uppercase tracking-wider">
                Live
              </span>
            </div>
            <div className="flex flex-col items-center justify-center min-h-[200px] bg-[rgba(0,229,255,0.02)] rounded-lg relative">
              <div className="relative w-16 h-16 mb-4">
                <div className="absolute inset-0 rounded-full border-2 border-[rgba(0,229,255,0.2)] animate-[pulse-ring_2s_ease-out_infinite]" />
                <div className="absolute inset-0 rounded-full border-2 border-[rgba(255,0,127,0.15)] animate-[pulse-ring_2s_ease-out_infinite_0.7s]" />
                <div className="absolute inset-0 rounded-full border-2 border-[rgba(0,229,255,0.1)] animate-[pulse-ring_2s_ease-out_infinite_1.4s]" />
              </div>
              <p className="text-[0.8rem] text-[rgba(255,255,255,0.3)]">Global threat visualization coming soon...</p>
              <span className="text-[0.6rem] text-[rgba(0,229,255,0.3)] tracking-wider mt-2">Monitoring 184 countries</span>
            </div>
          </div>

          {/* Chart Section */}
          <div className="p-4 md:p-6 rounded-xl border border-[rgba(0,229,255,0.06)] bg-[rgba(0,229,255,0.02)] hover:border-[rgba(0,229,255,0.1)] transition-all">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base md:text-lg font-bold text-white tracking-wider"> Threat Timeline</h2>
              <span className="text-[0.55rem] px-3 py-1 rounded-full bg-[rgba(0,229,255,0.05)] border border-[rgba(0,229,255,0.1)] text-[rgba(0,229,255,0.6)] uppercase tracking-wider">
                24h
              </span>
            </div>
            <div className="flex flex-col items-center justify-end min-h-[200px] py-4">
              <div className="flex items-end gap-1 w-full h-[140px] px-2">
                {[60, 80, 40, 90, 70, 50, 85, 30, 75, 95, 55, 65].map((height, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-t transition-all hover:opacity-70 hover:scale-y-105 ${
                      i % 2 === 0 ? 'bg-gradient-to-t from-[#00e5ff] to-[rgba(0,229,255,0.1)]' : 'bg-gradient-to-t from-[#ff007f] to-[rgba(255,0,127,0.1)]'
                    }`}
                    style={{ height: `${height}%`, minHeight: '8px' }}
                  />
                ))}
              </div>
              <p className="text-[0.6rem] text-[rgba(255,255,255,0.2)] tracking-wider mt-3">Last 24 hours · Threat activity</p>
            </div>
          </div>
        </div>

        {/* Alerts Section */}
        <div className="p-4 md:p-6 rounded-xl border border-[rgba(0,229,255,0.06)] bg-[rgba(0,229,255,0.02)] hover:border-[rgba(0,229,255,0.1)] transition-all">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base md:text-lg font-bold text-white tracking-wider"> Recent Alerts</h2>
            <span className="text-[0.55rem] px-3 py-1 rounded-full bg-[rgba(0,229,255,0.05)] border border-[rgba(0,229,255,0.1)] text-[rgba(0,229,255,0.6)] uppercase tracking-wider">
              {stats.active > 0 ? `${stats.active} new` : 'All clear'}
            </span>
          </div>
          <div className="min-h-[100px]">
            {stats.active === 0 ? (
              <div className="flex items-center justify-center gap-3 text-[rgba(255,255,255,0.3)] py-8">
                <span className="text-2xl"></span>
                <p>No active alerts · System is secure</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4 p-3 rounded-lg border-l-4 border-[#ff007f] bg-[rgba(255,0,127,0.05)] hover:bg-[rgba(255,0,127,0.08)] transition-all mb-2">
                  <span className="text-[0.55rem] font-bold uppercase tracking-wider px-2 py-1 rounded bg-[rgba(255,0,127,0.1)] text-[#ff007f]">Critical</span>
                  <span className="flex-1 text-sm text-[rgba(255,255,255,0.7)]">Multiple login attempts detected from unknown IP</span>
                  <span className="text-[0.6rem] text-[rgba(255,255,255,0.2)]">2 min ago</span>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-lg border-l-4 border-[#ff4d00] bg-[rgba(255,77,0,0.05)] hover:bg-[rgba(255,77,0,0.08)] transition-all mb-2">
                  <span className="text-[0.55rem] font-bold uppercase tracking-wider px-2 py-1 rounded bg-[rgba(255,77,0,0.1)] text-[#ff4d00]">High</span>
                  <span className="flex-1 text-sm text-[rgba(255,255,255,0.7)]">Suspicious network traffic pattern detected</span>
                  <span className="text-[0.6rem] text-[rgba(255,255,255,0.2)]">15 min ago</span>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-lg border-l-4 border-[#ffcc00] bg-[rgba(255,204,0,0.05)] hover:bg-[rgba(255,204,0,0.08)] transition-all">
                  <span className="text-[0.55rem] font-bold uppercase tracking-wider px-2 py-1 rounded bg-[rgba(255,204,0,0.1)] text-[#ffcc00]">Medium</span>
                  <span className="flex-1 text-sm text-[rgba(255,255,255,0.7)]">Unauthorized access attempt to admin panel</span>
                  <span className="text-[0.6rem] text-[rgba(255,255,255,0.2)]">1 hour ago</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;