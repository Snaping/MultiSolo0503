import React from 'react';
import { useAppContext } from '../context/AppContext';

function StatusBar({ onExportExcel, onExportCSV, onClear }) {
  const { state } = useAppContext();

  return (
    <div className="bg-white border-t border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="text-sm text-gray-600">
            总记录数: <span className="font-semibold text-gray-900">{state.data.length}</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onClear}
            disabled={state.data.length === 0}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            清理数据
          </button>
          <button
            onClick={onExportExcel}
            disabled={state.data.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-success-500 rounded-md hover:bg-success-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            导出Excel
          </button>
          <button
            onClick={onExportCSV}
            disabled={state.data.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            导出CSV
          </button>
        </div>
      </div>
    </div>
  );
}

export default StatusBar;
