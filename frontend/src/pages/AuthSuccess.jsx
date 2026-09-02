import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const error = params.get('error');

    if (error) {
      navigate('/login?error=' + error);
      return;
    }

    if (token) {
      const handleLogin = async () => {
        try {
          const user = await loginWithToken(token);
          console.log('Logged in as:', user.username, user.email);
          setTimeout(() => {
            navigate('/dashboard');
          }, 1000);
        } catch (error) {
          console.error('Login error:', error);
          navigate('/login?error=auth-failed');
        }
      };
      handleLogin();
    } else {
      navigate('/login');
    }
  }, [loginWithToken, navigate]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#0b132b] font-mono">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-black text-white tracking-[0.2em] [text-shadow:0_0_40px_rgba(0,229,255,0.1)] mb-4">
          EVENT HORIZON
        </h1>
        <p className="text-[0.8rem] text-[rgba(255,255,255,0.5)] mb-4">Authenticating with Google...</p>
        <div className="flex gap-2 justify-center">
          <div className="w-3.5 h-3.5 rounded-full border-2 border-transparent border-t-[#00e5ff] animate-spin" />
          <div className="w-3.5 h-3.5 rounded-full border-2 border-transparent border-t-[#ff007f] animate-spin [animation-delay:0.2s]" />
          <div className="w-3.5 h-3.5 rounded-full border-2 border-transparent border-t-white animate-spin [animation-delay:0.4s]" />
        </div>
      </div>
    </div>
  );
};

export default AuthSuccess;