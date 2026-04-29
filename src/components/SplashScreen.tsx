import React from 'react';

interface SplashScreenProps {
  isFadingOut?: boolean;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ isFadingOut }) => {
  return (
    <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0a0a0a] transition-all duration-700 ${isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      {/* Background patterns - Subtle and neutral */}
      <div className="absolute inset-0 opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      <div className="relative flex flex-col items-center">
        {/* Universal Loading Spinner - Sleek and modern */}
        <div className="mb-10 relative">
          {/* Outer glow */}
          <div className="absolute inset-0 blur-2xl bg-white/5 rounded-full"></div>
          
          {/* Spinner track */}
          <div className="w-16 h-16 border-2 border-white/10 rounded-full"></div>
          
          {/* Active spinner */}
          <div className="absolute inset-0 w-16 h-16 border-t-2 border-white rounded-full animate-spin"></div>
        </div>

        {/* Generic Loading Text */}
        <div className="text-center">
          <h2 className="text-white text-sm font-light tracking-[0.5em] uppercase opacity-60">
            Cargando
          </h2>
          
          {/* Progress bar style loader */}
          <div className="mt-6 w-32 h-[1px] bg-white/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-white/40 w-1/2 animate-[loading_1.5s_infinite_ease-in-out]"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
