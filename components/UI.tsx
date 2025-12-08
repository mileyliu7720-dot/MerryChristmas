import React from 'react';
import { useAppStore } from '../store';
import { AppState } from '../types';

export const UI: React.FC = () => {
  const { state, toggleState } = useAppStore();

  const isTree = state === AppState.TREE_SHAPE;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 z-10">
      
      {/* Header */}
      <header className="flex flex-col items-center mt-4 opacity-90 transition-opacity duration-1000">
        <h1 className="text-4xl md:text-6xl font-serif text-amber-400 tracking-widest uppercase drop-shadow-[0_2px_10px_rgba(212,175,55,0.5)]" style={{ fontFamily: 'Cinzel, serif' }}>
          Merry Christmas
        </h1>
        <p className="text-amber-200/70 text-sm md:text-base tracking-[0.3em] mt-2 font-serif italic">
          The Interactive Collection
        </p>
      </header>

      {/* Center Prompt (Only visible if needed, maybe fading out) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
        {/* Intentionally left empty for visual clarity of the tree */}
      </div>

      {/* Footer Controls */}
      <footer className="flex flex-col items-center mb-8 pointer-events-auto">
        <div className="bg-black/40 backdrop-blur-md border border-amber-500/30 p-1 px-1 rounded-full flex gap-4 transition-all hover:border-amber-500/60">
            <button 
                onClick={toggleState}
                className="group relative px-8 py-3 rounded-full overflow-hidden transition-all duration-500"
            >
                <div className={`absolute inset-0 transition-opacity duration-500 ${isTree ? 'bg-amber-600/20' : 'bg-emerald-900/40'}`} />
                <span className="relative z-10 font-serif text-amber-100 tracking-widest text-xs md:text-sm uppercase flex items-center gap-2">
                    {isTree ? 'Deconstruct' : 'Assemble'}
                    <span className={`block w-2 h-2 rounded-full transition-colors ${isTree ? 'bg-amber-400 box-shadow-[0_0_10px_#fbbf24]' : 'bg-emerald-500'}`}></span>
                </span>
                
                {/* Button Hover Glow */}
                <div className="absolute inset-0 bg-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
        </div>
        
        <div className="mt-4 flex gap-4 text-[10px] text-amber-500/40 uppercase tracking-widest font-mono">
           <span>Three.js</span>
           <span>•</span>
           <span>React 19</span>
           <span>•</span>
           <span>R3F</span>
        </div>
      </footer>
    </div>
  );
};