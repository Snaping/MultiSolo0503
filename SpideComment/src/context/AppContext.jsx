import React, { createContext, useContext, useReducer } from 'react';

const AppContext = createContext();

const initialState = {
  selectedPlatform: null,
  url: '',
  config: {
    maxCount: 100,
    delay: 1000,
    includeReplies: true
  },
  taskStatus: 'idle',
  progress: {
    current: 0,
    total: 0,
    speed: 0,
    remainingTime: 0,
    successCount: 0,
    failCount: 0
  },
  data: [],
  error: null
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_PLATFORM':
      return { ...state, selectedPlatform: action.payload };
    case 'SET_URL':
      return { ...state, url: action.payload };
    case 'SET_CONFIG':
      return { ...state, config: { ...state.config, ...action.payload } };
    case 'SET_TASK_STATUS':
      return { ...state, taskStatus: action.payload };
    case 'SET_PROGRESS':
      return { ...state, progress: { ...state.progress, ...action.payload } };
    case 'ADD_DATA':
      return { ...state, data: [...state.data, ...action.payload] };
    case 'SET_DATA':
      return { ...state, data: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'RESET_PROGRESS':
      return { ...state, progress: initialState.progress };
    case 'RESET_ALL':
      return { ...initialState };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}

export default AppContext;
