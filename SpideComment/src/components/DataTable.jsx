import React, { useMemo } from 'react';

function DataTable({ data, onDelete }) {
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN');
  };

  const formatNumber = (num) => {
    if (num === undefined || num === null) return '-';
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + '万';
    }
    return num.toString();
  };

  const getPlatformLabel = (platform) => {
    const labels = {
      douyin: '抖音',
      kuaishou: '快手',
      xiaohongshu: '小红书',
      taobao: '淘宝',
      custom: '自定义'
    };
    return labels[platform] || platform;
  };

  const getPlatformColor = (platform) => {
    const colors = {
      douyin: '#FE2C55',
      kuaishou: '#FF4906',
      xiaohongshu: '#FF2442',
      taobao: '#FF5000',
      custom: '#64748B'
    };
    return colors[platform] || '#64748B';
  };

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-card shadow-card p-8 flex-1 flex flex-col">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">抓取数据</h2>
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p>暂无数据</p>
            <p className="text-sm mt-1">请选择平台并开始抓取</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-card shadow-card p-6 flex-1 flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          抓取数据 <span className="text-sm font-normal text-gray-500 ml-2">共 {data.length} 条</span>
        </h2>
      </div>

      <div className="flex-1 overflow-auto scrollbar-thin">
        <table className="w-full">
          <thead className="sticky top-0 bg-gray-50">
            <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
              <th className="px-4 py-3 font-medium w-20">平台</th>
              <th className="px-4 py-3 font-medium w-28">用户名</th>
              <th className="px-4 py-3 font-medium">评论内容</th>
              <th className="px-4 py-3 font-medium w-32">发布时间</th>
              <th className="px-4 py-3 font-medium w-20 text-center">点赞</th>
              <th className="px-4 py-3 font-medium w-20 text-center">回复</th>
              <th className="px-4 py-3 font-medium w-16 text-center">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((item, index) => (
              <tr key={item.id || index} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <span
                    className="inline-flex items-center px-2 py-1 rounded text-xs font-medium text-white"
                    style={{ backgroundColor: getPlatformColor(item.platform) }}
                  >
                    {getPlatformLabel(item.platform)}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {item.username || item.user_nickname || '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 max-w-md truncate" title={item.content}>
                  {item.content || '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {formatDate(item.publish_time)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 text-center">
                  {formatNumber(item.like_count)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 text-center">
                  {formatNumber(item.reply_count)}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => onDelete(index)}
                    className="text-gray-400 hover:text-danger-500 transition-colors"
                    title="删除"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
