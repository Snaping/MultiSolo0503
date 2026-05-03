import React from 'react';
import { useAppContext } from '../context/AppContext';

function TaskConfig({ onStart, onPause, onStop }) {
  const { state, dispatch } = useAppContext();
  const { selectedPlatform, url, config, taskStatus } = state;

  const handleUrlChange = (e) => {
    dispatch({ type: 'SET_URL', payload: e.target.value });
  };

  const handleConfigChange = (key, value) => {
    dispatch({
      type: 'SET_CONFIG',
      payload: { [key]: value }
    });
  };

  const handleStart = () => {
    if (!selectedPlatform) {
      alert('请先选择平台');
      return;
    }
    if (!url.trim()) {
      alert('请输入链接');
      return;
    }
    onStart();
  };

  const getPlaceholder = () => {
    switch (selectedPlatform) {
      case 'douyin':
        return '请输入抖音视频链接或分享代码';
      case 'kuaishou':
        return '请输入快手视频链接';
      case 'xiaohongshu':
        return '请输入小红书笔记链接';
      case 'taobao':
        return '请输入淘宝商品链接';
      case 'custom':
        return '请输入自定义URL链接';
      default:
        return '请先选择平台';
    }
  };

  return (
    <div className="bg-white rounded-card shadow-card p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">任务配置</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            内容链接
          </label>
          <input
            type="text"
            value={url}
            onChange={handleUrlChange}
            placeholder={getPlaceholder()}
            disabled={taskStatus === 'running'}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              抓取数量
            </label>
            <input
              type="number"
              value={config.maxCount}
              onChange={(e) => handleConfigChange('maxCount', parseInt(e.target.value) || 0)}
              min="1"
              max="10000"
              disabled={taskStatus === 'running'}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              请求延迟 (ms)
            </label>
            <input
              type="number"
              value={config.delay}
              onChange={(e) => handleConfigChange('delay', parseInt(e.target.value) || 0)}
              min="0"
              max="10000"
              disabled={taskStatus === 'running'}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              抓取回复
            </label>
            <div className="flex items-center h-full pt-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.includeReplies}
                  onChange={(e) => handleConfigChange('includeReplies', e.target.checked)}
                  disabled={taskStatus === 'running'}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 disabled:opacity-50"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          {taskStatus === 'idle' || taskStatus === 'stopped' ? (
            <button
              onClick={handleStart}
              className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              开始抓取
            </button>
          ) : taskStatus === 'running' ? (
            <>
              <button
                onClick={onPause}
                className="px-6 py-3 bg-warning-500 text-white font-medium rounded-lg hover:bg-warning-600 transition-colors shadow-sm flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                暂停
              </button>
              <button
                onClick={onStop}
                className="px-6 py-3 bg-danger-500 text-white font-medium rounded-lg hover:bg-danger-600 transition-colors shadow-sm flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
                停止
              </button>
            </>
          ) : taskStatus === 'paused' ? (
            <>
              <button
                onClick={onStart}
                className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                继续
              </button>
              <button
                onClick={onStop}
                className="px-6 py-3 bg-danger-500 text-white font-medium rounded-lg hover:bg-danger-600 transition-colors shadow-sm flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
                停止
              </button>
            </>
          ) : (
            <button
              onClick={handleStart}
              className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              开始抓取
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default TaskConfig;
