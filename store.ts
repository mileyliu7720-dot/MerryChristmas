import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AppState } from './types';

interface StateContextType {
  state: AppState;
  toggleState: () => void;
  progress: number; // 0 to 1
  setProgress: (val: number) => void;
}

const StateContext = createContext<StateContextType | undefined>(undefined);

export const StateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(AppState.TREE_SHAPE);
  const [progress, setProgress] = useState(1); // Start fully formed

  const toggleState = () => {
    setState((prev) => (prev === AppState.SCATTERED ? AppState.TREE_SHAPE : AppState.SCATTERED));
  };

  return React.createElement(
    StateContext.Provider,
    { value: { state, toggleState, progress, setProgress } },
    children
  );
};

export const useAppStore = () => {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error('useAppStore must be used within a StateProvider');
  }
  return context;
};