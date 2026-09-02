import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));

// Splash screen
const splash = document.createElement('div');
splash.id = 'splash-screen';
splash.className = 'fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0b132b] font-mono transition-opacity duration-800';
splash.innerHTML = `
  <div class="flex flex-col items-center gap-6">
    <div class="text-4xl md:text-5xl font-black text-[#00e5ff] tracking-[0.2em] [text-shadow:0_0_40px_rgba(0,229,255,0.2)]">
      EVENT HORIZON
    </div>
    <div class="flex gap-2">
      <div class="w-3 h-3 rounded-full border-2 border-transparent border-t-[#00e5ff] animate-spin"></div>
      <div class="w-3 h-3 rounded-full border-2 border-transparent border-t-[#ff007f] animate-spin [animation-delay:0.2s]"></div>
      <div class="w-3 h-3 rounded-full border-2 border-transparent border-t-white animate-spin [animation-delay:0.4s]"></div>
    </div>
    <div class="text-xs text-[rgba(0,229,255,0.3)] tracking-[0.3em] uppercase">
      Securing your digital frontier...
    </div>
  </div>
`;

document.body.appendChild(splash);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

setTimeout(() => {
  splash.style.opacity = '0';
  setTimeout(() => {
    if (splash.parentNode) splash.parentNode.removeChild(splash);
  }, 800);
}, 500);

window.addEventListener('error', () => {
  if (splash.parentNode) splash.parentNode.removeChild(splash);
});

window.addEventListener('unhandledrejection', () => {
  if (splash.parentNode) splash.parentNode.removeChild(splash);
});

if (process.env.NODE_ENV === 'development') {
  console.log('%cEVENT HORIZON', 'font-size:20px;font-weight:bold;color:#00e5ff;');
  console.log('%cSecurity Operations Center Active', 'font-size:12px;color:rgba(0,229,255,0.5);');
}