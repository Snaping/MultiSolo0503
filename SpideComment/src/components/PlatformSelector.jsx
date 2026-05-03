import React from 'react';
import { useAppContext } from '../context/AppContext';

const platforms = [
  {
    id: 'douyin',
    name: '抖音',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.03.88.09v-3.5a6.37 6.37 0 0 0-.88-.05A6.34 6.34 0 0 0 4.5 14.5a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.01a8.16 8.16 0 0 0 4.77 1.52V6.84a4.83 4.83 0 0 1-1.36-.15z"/>
      </svg>
    ),
    color: '#FE2C55'
  },
  {
    id: 'kuaishou',
    name: '快手',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h2v-6h-2v6zm0-8h2V7h-2v2z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    ),
    color: '#FF4906'
  },
  {
    id: 'xiaohongshu',
    name: '小红书',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
    ),
    color: '#FF2442'
  },
  {
    id: 'taobao',
    name: '淘宝',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
    ),
    color: '#FF5000'
  },
  {
    id: 'custom',
    name: '自定义',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
      </svg>
    ),
    color: '#64748B'
  }
];

function PlatformSelector() {
  const { state, dispatch } = useAppContext();

  const handleSelect = (platformId) => {
    dispatch({ type: 'SET_PLATFORM', payload: platformId });
  };

  return (
    <div className="bg-white rounded-card shadow-card p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">选择平台</h2>
      <div className="grid grid-cols-5 gap-4">
        {platforms.map((platform) => (
          <button
            key={platform.id}
            onClick={() => handleSelect(platform.id)}
            className={`
              flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all duration-200
              ${state.selectedPlatform === platform.id
                ? 'border-primary-600 bg-primary-50 text-primary-700'
                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300'
              }
            `}
            style={{
              borderColor: state.selectedPlatform === platform.id ? platform.color : undefined,
              color: state.selectedPlatform === platform.id ? platform.color : undefined
            }}
          >
            <div style={{ color: platform.color }}>
              {platform.icon}
            </div>
            <span className="mt-2 text-sm font-medium">{platform.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default PlatformSelector;
