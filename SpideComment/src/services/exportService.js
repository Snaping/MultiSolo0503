import * as XLSX from 'xlsx';

export function exportToExcel(data, filename) {
  const formattedData = data.map((item, index) => ({
    '序号': index + 1,
    '平台': getPlatformName(item.platform),
    '用户名': item.username || item.user_nickname || '-',
    '用户ID': item.user_id || '-',
    '评论内容': item.content || '-',
    '发布时间': formatDate(item.publish_time),
    '点赞数': item.like_count || 0,
    '回复数': item.reply_count || 0,
    '评分': item.rating || '-',
    '内容ID': item.content_id || '-',
    '抓取时间': formatDate(item.crawl_time)
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedData);

  const colWidths = [
    { wch: 8 },
    { wch: 10 },
    { wch: 20 },
    { wch: 20 },
    { wch: 50 },
    { wch: 20 },
    { wch: 10 },
    { wch: 10 },
    { wch: 8 },
    { wch: 20 },
    { wch: 20 }
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '评论数据');

  XLSX.writeFile(workbook, filename);

  return { success: true };
}

export function exportToCSV(data, filename) {
  const headers = ['序号', '平台', '用户名', '用户ID', '评论内容', '发布时间', '点赞数', '回复数', '评分', '内容ID', '抓取时间'];

  const formattedData = data.map((item, index) => [
    index + 1,
    getPlatformName(item.platform),
    (item.username || item.user_nickname || '-').replace(/"/g, '""'),
    (item.user_id || '-').replace(/"/g, '""'),
    (item.content || '-').replace(/"/g, '""'),
    formatDate(item.publish_time),
    item.like_count || 0,
    item.reply_count || 0,
    item.rating || '-',
    item.content_id || '-',
    formatDate(item.crawl_time)
  ]);

  const csvContent = [
    headers.join(','),
    ...formattedData.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return { success: true };
}

function getPlatformName(platform) {
  const names = {
    douyin: '抖音',
    kuaishou: '快手',
    xiaohongshu: '小红书',
    taobao: '淘宝',
    custom: '自定义'
  };
  return names[platform] || platform;
}

function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN');
}

export function generateFilename(prefix, extension) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');

  return `${prefix}_${year}${month}${day}_${hour}${minute}${second}.${extension}`;
}
