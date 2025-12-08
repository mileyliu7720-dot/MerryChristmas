import React, { Suspense } from 'react';
import { Experience } from './components/Experience';
import { UI } from './components/UI';
import { StateProvider } from './store';

const App: React.FC = () => {
  return (
    <StateProvider>
      <div className="relative w-full h-screen bg-[#020403] overflow-hidden">
        
        {/* Loading / Suspense Fallback */}
        <Suspense fallback={
          <div className="absolute inset-0 flex items-center justify-center text-amber-500 font-serif tracking-widest animate-pulse">
            LOADING ARIX EXPERIENCE...
          </div>
        }>
          <Experience />
        </Suspense>

        {/* User Interface Overlay */}
        <UI />
        
        {/* Vignette Overlay (CSS based for extra texture if needed, but R3F vignette handles it) */}
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.8)]"></div>
      </div>
    </StateProvider>
  );
};

export default App;