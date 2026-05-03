import React, { useState, useCallback } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import PlatformSelector from './components/PlatformSelector';
import TaskConfig from './components/TaskConfig';
import ProgressPanel from './components/ProgressPanel';
import DataTable from './components/DataTable';
import StatusBar from './components/StatusBar';
import { crawlDouyinComments, crawlKuaishouComments, crawlXiaohongshuComments, crawlTaobaoComments, crawlCustomUrl } from './services/crawler';
import { exportToExcel, exportToCSV, generateFilename } from './services/exportService';

function AppContent() {
  const { state, dispatch } = useAppContext();
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const handleStart = useCallback(async () => {
    if (isRunning && !isPaused) return;

    if (isPaused) {
      setIsPaused(false);
      dispatch({ type: 'SET_TASK_STATUS', payload: 'running' });
      return;
    }

    setIsRunning(true);
    setIsPaused(false);
    dispatch({ type: 'SET_TASK_STATUS', payload: 'running' });
    dispatch({ type: 'RESET_PROGRESS' });
    dispatch({ type: 'SET_ERROR', payload: null });

    const { selectedPlatform, url, config } = state;
    const options = {
      maxCount: config.maxCount,
      delay: config.delay,
      includeReplies: config.includeReplies
    };

    const callbacks = {
      onProgress: (progress) => {
        dispatch({
          type: 'SET_PROGRESS',
          payload: {
            current: progress.current,
            total: progress.total,
            speed: progress.speed.toFixed(1),
            remainingTime: isFinite(progress.remainingTime) ? Math.ceil(progress.remainingTime) : 0
          }
        });
      },
      onData: (comments) => {
        dispatch({ type: 'ADD_DATA', payload: comments });
        dispatch({
          type: 'SET_PROGRESS',
          payload: { successCount: state.progress.successCount + comments.length }
        });
      },
      onError: (errorMsg) => {
        dispatch({ type: 'SET_ERROR', payload: errorMsg });
        dispatch({ type: 'SET_TASK_STATUS', payload: 'stopped' });
        setIsRunning(false);
      },
      onComplete: () => {
        dispatch({ type: 'SET_TASK_STATUS', payload: 'completed' });
        setIsRunning(false);
      }
    };

    let result;
    switch (selectedPlatform) {
      case 'douyin':
        result = await crawlDouyinComments(url, options, callbacks);
        break;
      case 'kuaishou':
        result = await crawlKuaishouComments(url, options, callbacks);
        break;
      case 'xiaohongshu':
        result = await crawlXiaohongshuComments(url, options, callbacks);
        break;
      case 'taobao':
        result = await crawlTaobaoComments(url, options, callbacks);
        break;
      case 'custom':
      default:
        result = await crawlCustomUrl(url, options, callbacks);
        break;
    }

    if (!result.success && result.error) {
      console.error('Crawl error:', result.error);
    }
  }, [state, dispatch, isRunning, isPaused]);

  const handlePause = useCallback(() => {
    setIsPaused(true);
    dispatch({ type: 'SET_TASK_STATUS', payload: 'paused' });
  }, [dispatch]);

  const handleStop = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    dispatch({ type: 'SET_TASK_STATUS', payload: 'stopped' });
  }, [dispatch]);

  const handleDeleteData = useCallback((index) => {
    const newData = [...state.data];
    newData.splice(index, 1);
    dispatch({ type: 'SET_DATA', payload: newData });
  }, [state.data, dispatch]);

  const handleClearData = useCallback(() => {
    if (window.confirm('确定要清空所有数据吗？')) {
      dispatch({ type: 'SET_DATA', payload: [] });
      dispatch({ type: 'RESET_PROGRESS' });
    }
  }, [dispatch]);

  const handleExportExcel = useCallback(() => {
    if (state.data.length === 0) {
      alert('没有数据可导出');
      return;
    }
    const filename = generateFilename('评论数据', 'xlsx');
    exportToExcel(state.data, filename);
  }, [state.data]);

  const handleExportCSV = useCallback(() => {
    if (state.data.length === 0) {
      alert('没有数据可导出');
      return;
    }
    const filename = generateFilename('评论数据', 'csv');
    exportToCSV(state.data, filename);
  }, [state.data]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-500 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">多平台评论抓取系统</h1>
            <p className="text-xs text-gray-500">支持抖音、快手、小红书、淘宝</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6 space-y-6">
        <PlatformSelector />
        <TaskConfig onStart={handleStart} onPause={handlePause} onStop={handleStop} />
        <ProgressPanel />
        <DataTable data={state.data} onDelete={handleDeleteData} />
      </main>

      <StatusBar
        onExportExcel={handleExportExcel}
        onExportCSV={handleExportCSV}
        onClear={handleClearData}
      />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
