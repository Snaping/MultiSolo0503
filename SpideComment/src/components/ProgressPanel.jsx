import React from 'react';
import { useAppContext } from '../context/AppContext';

function ProgressPanel() {
  const { state } = useAppContext();
  const { progress, taskStatus } = state;

  const percentage = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  const formatTime = (seconds) => {
    if (seconds <= 0 || !isFinite(seconds)) return '--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    if (mins > 0) {
      return `${mins}分${secs}秒`;
    }
    return `${secs}秒`;
  };

  const getStatusText = () => {
    switch (taskStatus) {
      case 'idle':
        return '等待开始';
      case 'running':
        return '抓取中';
      case 'paused':
        return '已暂停';
      case 'stopped':
        return '已停止';
      case 'completed':
        return '已完成';
      default:
        return '未知状态';
    }
  };

  const getStatusColor = () => {
    switch (taskStatus) {
      case 'running':
        return 'text-primary-600';
      case 'paused':
        return 'text-warning-500';
      case 'stopped':
        return 'text-gray-500';
      case 'completed':
        return 'text-success-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-card shadow-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">抓取进度</h2>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()} bg-opacity-10 ${taskStatus === 'running' ? 'bg-primary-100' : ''}`}
              style={{
                backgroundColor: taskStatus === 'running' ? '#DBEAFE' : taskStatus === 'paused' ? '#FEF3C7' : taskStatus === 'completed' ? '#D1FAE5' : '#F1F5F9'
              }}>
          {getStatusText()}
        </span>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">
            {progress.current} / {progress.total || state.config.maxCount} 条
          </span>
          <span className="font-medium text-primary-600">{percentage}%</span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              taskStatus === 'running' ? 'bg-gradient-to-r from-primary-600 to-primary-500 progress-bar-striped' : 'bg-primary-600'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-primary-600">{progress.speed}</div>
          <div className="text-xs text-gray-500 mt-1">条/秒</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-success-500">{progress.successCount}</div>
          <div className="text-xs text-gray-500 mt-1">成功</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-danger-500">{progress.failCount}</div>
          <div className="text-xs text-gray-500 mt-1">失败</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-600">{formatTime(progress.remainingTime)}</div>
          <div className="text-xs text-gray-500 mt-1">剩余时间</div>
        </div>
      </div>
    </div>
  );
}

export default ProgressPanel;
