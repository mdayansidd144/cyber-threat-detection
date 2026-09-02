import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as THREE from 'three';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { register } = useAuth();
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const container = canvasRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 300;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b132b);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 2, 8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404060);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00e5ff, 2, 30);
    pointLight.position.set(3, 4, 5);
    scene.add(pointLight);

    const magentaLight = new THREE.PointLight(0xff007f, 1.5, 30);
    magentaLight.position.set(-4, -2, 4);
    scene.add(magentaLight);

    const ringGeometry = new THREE.TorusGeometry(2.8, 0.08, 64, 128);
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      emissive: 0x00e5ff,
      emissiveIntensity: 0.8,
      metalness: 0.9,
      roughness: 0.1,
      transparent: true,
      opacity: 0.9,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2.8;
    ring.rotation.z = 0.3;
    scene.add(ring);

    const innerRingGeo = new THREE.TorusGeometry(2.0, 0.06, 48, 96);
    const innerRingMat = new THREE.MeshStandardMaterial({
      color: 0xff007f,
      emissive: 0xff007f,
      emissiveIntensity: 0.8,
      metalness: 0.8,
      roughness: 0.2,
      transparent: true,
      opacity: 0.9,
    });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRing.rotation.x = Math.PI / 2.4;
    innerRing.rotation.z = -0.3;
    scene.add(innerRing);

    const coreGeo = new THREE.SphereGeometry(0.5, 32, 32);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 3,
      metalness: 0.0,
      roughness: 0.0,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.set(0, 0, 0);
    scene.add(core);

    const glowGeo = new THREE.SphereGeometry(0.8, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xff007f,
      transparent: true,
      opacity: 0.2,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.set(0, 0, 0);
    scene.add(glow);

    const blackHoleGeo = new THREE.SphereGeometry(1.0, 48, 48);
    const blackHoleMat = new THREE.MeshBasicMaterial({
      color: 0x050510,
      transparent: true,
      opacity: 0.95,
    });
    const blackHole = new THREE.Mesh(blackHoleGeo, blackHoleMat);
    blackHole.position.set(0, 0, 0);
    scene.add(blackHole);

    const particleCount = 2000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const radius = 1.5 + Math.random() * 8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 2;
      positions[i * 3] = radius * Math.sin(theta) * Math.cos(phi);
      positions[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi) * 0.3;
      positions[i * 3 + 2] = radius * Math.cos(theta);
      const mix = Math.random();
      colors[i * 3] = 0.1 + mix * 0.5;
      colors[i * 3 + 1] = 0.1 + mix * 0.4;
      colors[i * 3 + 2] = 0.3 + mix * 0.6;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    const starCount = 4000;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const radius = 10 + Math.random() * 40;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 2;
      starPositions[i * 3] = radius * Math.sin(theta) * Math.cos(phi);
      starPositions[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi) * 0.2;
      starPositions[i * 3 + 2] = radius * Math.cos(theta);
      const brightness = 0.3 + Math.random() * 0.7;
      starColors[i * 3] = brightness;
      starColors[i * 3 + 1] = brightness * 0.8;
      starColors[i * 3 + 2] = brightness * 0.6;
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    const animate = () => {
      const elapsedTime = performance.now() / 1000;
      ring.rotation.y += 0.005;
      innerRing.rotation.y -= 0.008;
      const pulse = 1 + Math.sin(elapsedTime * 2.5) * 0.15;
      core.scale.set(pulse, pulse, pulse);
      glow.scale.set(pulse * 1.8, pulse * 1.8, pulse * 1.8);
      glowMat.opacity = 0.15 + Math.sin(elapsedTime * 2.5) * 0.05;
      particles.rotation.y += 0.0005;
      stars.rotation.y += 0.00015;
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { username, email, password } = formData;
      await register({ username, email, password });
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#0b132b] font-mono overflow-hidden">
      <div ref={canvasRef} className="fixed inset-0 z-0" />
      <div className="fixed inset-0 z-[1] pointer-events-none bg-gradient-to-b from-[rgba(11,19,43,0.2)] to-[rgba(11,19,43,0.7)]" />
      <div className="relative z-10 bg-[rgba(11,19,43,0.6)] backdrop-blur-xl border border-[rgba(255,0,127,0.1)] rounded-2xl p-10 md:p-12 w-full max-w-md shadow-2xl animate-fadeIn">
        <div className="text-center mb-8">
          <h1>
            <span className="block text-3xl md:text-4xl font-black text-white tracking-[0.3em] [text-shadow:0_0_30px_rgba(0,229,255,0.06)]">
              EVENT HORIZON
            </span>
            <span className="block text-[0.55rem] text-[rgba(0,229,255,0.2)] tracking-[0.5em] uppercase mt-1">
              cyber threat detection
            </span>
          </h1>
        </div>

        {error && (
          <div className="mb-4 p-3 text-center text-sm text-[#ff007f] bg-[rgba(255,0,127,0.05)] border border-[rgba(255,0,127,0.08)] rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-[0.65rem] font-semibold tracking-[0.15em] uppercase text-[rgba(0,229,255,0.35)] mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              required
              className="w-full px-4 py-3 bg-[rgba(0,229,255,0.02)] border border-[rgba(0,229,255,0.05)] rounded-lg text-white text-sm font-mono outline-none transition-all focus:border-[rgba(0,229,255,0.15)] focus:shadow-[0_0_30px_rgba(0,229,255,0.02)] focus:bg-[rgba(0,229,255,0.04)] placeholder:text-[rgba(255,255,255,0.06)]"
            />
          </div>
          <div className="mb-4">
            <label className="block text-[0.65rem] font-semibold tracking-[0.15em] uppercase text-[rgba(0,229,255,0.35)] mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              className="w-full px-4 py-3 bg-[rgba(0,229,255,0.02)] border border-[rgba(0,229,255,0.05)] rounded-lg text-white text-sm font-mono outline-none transition-all focus:border-[rgba(0,229,255,0.15)] focus:shadow-[0_0_30px_rgba(0,229,255,0.02)] focus:bg-[rgba(0,229,255,0.04)] placeholder:text-[rgba(255,255,255,0.06)]"
            />
          </div>
          <div className="mb-4">
            <label className="block text-[0.65rem] font-semibold tracking-[0.15em] uppercase text-[rgba(0,229,255,0.35)] mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password (min 6 characters)"
              required
              className="w-full px-4 py-3 bg-[rgba(0,229,255,0.02)] border border-[rgba(0,229,255,0.05)] rounded-lg text-white text-sm font-mono outline-none transition-all focus:border-[rgba(0,229,255,0.15)] focus:shadow-[0_0_30px_rgba(0,229,255,0.02)] focus:bg-[rgba(0,229,255,0.04)] placeholder:text-[rgba(255,255,255,0.06)]"
            />
          </div>
          <div className="mb-4">
            <label className="block text-[0.65rem] font-semibold tracking-[0.15em] uppercase text-[rgba(0,229,255,0.35)] mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
              className="w-full px-4 py-3 bg-[rgba(0,229,255,0.02)] border border-[rgba(0,229,255,0.05)] rounded-lg text-white text-sm font-mono outline-none transition-all focus:border-[rgba(0,229,255,0.15)] focus:shadow-[0_0_30px_rgba(0,229,255,0.02)] focus:bg-[rgba(0,229,255,0.04)] placeholder:text-[rgba(255,255,255,0.06)]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-[#ff007f] to-[#cc0066] rounded-lg text-white text-sm font-bold tracking-[0.15em] uppercase font-mono transition-all hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(255,0,127,0.12)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="flex items-center gap-4 my-4">
          <hr className="flex-1 border-[rgba(0,229,255,0.03)]" />
          <span className="text-[0.6rem] text-[rgba(255,255,255,0.12)] tracking-[0.15em] uppercase">or continue with</span>
          <hr className="flex-1 border-[rgba(0,229,255,0.03)]" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full py-3 bg-white border border-[rgba(255,255,255,0.08)] rounded-lg text-[#222] text-sm font-medium font-mono flex items-center justify-center gap-3 transition-all hover:bg-gray-100 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(255,255,255,0.03)]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24" height="24">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
          </svg>
          Continue with Google
        </button>

        <div className="mt-6 text-center">
          <p className="text-[0.8rem] text-[rgba(255,255,255,0.12)]">
            Already have an account?{' '}
            <Link to="/login" className="text-[rgba(0,229,255,0.35)] font-semibold hover:text-[#00e5ff] transition-colors">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;