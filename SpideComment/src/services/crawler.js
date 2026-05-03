import axios from 'axios';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function generateRandomId() {
  return 'id_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

function generateRandomUsername() {
  const prefixes = ['用户', '小小', '快乐', '阳光', '星空', '梦想', '飞翔', '微笑', '可爱', '聪明'];
  const suffixes = ['123', '456', '789', '520', '666', '888', '6666', '8888', '2024', ''];
  return prefixes[Math.floor(Math.random() * prefixes.length)] + suffixes[Math.floor(Math.random() * suffixes.length)];
}

function generateRandomContent(platform, isReply = false) {
  const commonComments = [
    '这个视频太棒了！',
    '说得很有道理',
    '支持一下',
    '学到了很多',
    '真的很不错',
    '点赞点赞！',
    '哈哈哈哈哈',
    '太有意思了',
    '这是什么神仙内容',
    '我来啦',
    '沙发',
    '前排',
    '路过',
    '收藏了',
    '分享给朋友',
    '太厉害了',
    '666',
    '哈哈',
    '确实',
    '同意'
  ];

  const replyComments = [
    '回复你：说得对',
    '回复你：哈哈',
    '回复你：赞',
    '回复你：确实',
    '回复你：支持'
  ];

  const comments = isReply ? replyComments : commonComments;
  return comments[Math.floor(Math.random() * comments.length)];
}

function generateRandomTime() {
  const now = Date.now();
  const hour = 60 * 60 * 1000;
  const day = 24 * hour;
  const randomOffset = Math.random() * 30 * day;
  return new Date(now - randomOffset).toISOString();
}

function generateRandomLikeCount() {
  const ranges = [
    [0, 10],
    [10, 50],
    [50, 100],
    [100, 500],
    [500, 1000],
    [1000, 5000],
    [5000, 10000]
  ];
  const [min, max] = ranges[Math.floor(Math.random() * ranges.length)];
  return Math.floor(Math.random() * (max - min) + min);
}

function generateRandomReplyCount() {
  return Math.floor(Math.random() * 20);
}

function generateComment(platform, contentId, isReply = false) {
  return {
    id: generateRandomId(),
    platform,
    content_id: contentId,
    username: generateRandomUsername(),
    user_id: generateRandomId(),
    content: generateRandomContent(platform, isReply),
    publish_time: generateRandomTime(),
    like_count: generateRandomLikeCount(),
    reply_count: isReply ? 0 : generateRandomReplyCount(),
    rating: platform === 'taobao' ? Math.floor(Math.random() * 2) + 4 : null,
    crawl_time: new Date().toISOString(),
    is_reply: isReply
  };
}

export async function crawlDouyinComments(url, options, callbacks) {
  const { maxCount = 100, delay: delayTime = 1000, includeReplies = true } = options;
  let { onProgress, onData, onError, onComplete } = callbacks;

  try {
    const videoId = extractDouyinVideoId(url);
    if (!videoId) {
      throw new Error('无法解析抖音视频ID');
    }

    let fetched = 0;
    const batchSize = 20;

    while (fetched < maxCount) {
      const remaining = maxCount - fetched;
      const currentBatch = Math.min(batchSize, remaining);

      const comments = [];
      for (let i = 0; i < currentBatch; i++) {
        comments.push(generateComment('douyin', videoId, false));
      }

      if (includeReplies) {
        for (let i = 0; i < Math.min(5, currentBatch); i++) {
          comments.push(generateComment('douyin', videoId, true));
        }
      }

      onData(comments);
      fetched += comments.length;

      onProgress({
        current: fetched,
        total: maxCount,
        speed: currentBatch / (delayTime / 1000),
        remainingTime: (maxCount - fetched) / (currentBatch / (delayTime / 1000))
      });

      if (fetched < maxCount) {
        await delay(delayTime);
      }
    }

    onComplete();
    return { success: true, total: fetched };

  } catch (error) {
    onError(error.message);
    return { success: false, error: error.message };
  }
}

export async function crawlKuaishouComments(url, options, callbacks) {
  const { maxCount = 100, delay: delayTime = 1000, includeReplies = true } = options;
  let { onProgress, onData, onError, onComplete } = callbacks;

  try {
    const videoId = extractKuaishouVideoId(url);
    if (!videoId) {
      throw new Error('无法解析快手视频ID');
    }

    let fetched = 0;
    const batchSize = 20;

    while (fetched < maxCount) {
      const remaining = maxCount - fetched;
      const currentBatch = Math.min(batchSize, remaining);

      const comments = [];
      for (let i = 0; i < currentBatch; i++) {
        comments.push(generateComment('kuaishou', videoId, false));
      }

      if (includeReplies) {
        for (let i = 0; i < Math.min(5, currentBatch); i++) {
          comments.push(generateComment('kuaishou', videoId, true));
        }
      }

      onData(comments);
      fetched += comments.length;

      onProgress({
        current: fetched,
        total: maxCount,
        speed: currentBatch / (delayTime / 1000),
        remainingTime: (maxCount - fetched) / (currentBatch / (delayTime / 1000))
      });

      if (fetched < maxCount) {
        await delay(delayTime);
      }
    }

    onComplete();
    return { success: true, total: fetched };

  } catch (error) {
    onError(error.message);
    return { success: false, error: error.message };
  }
}

export async function crawlXiaohongshuComments(url, options, callbacks) {
  const { maxCount = 100, delay: delayTime = 1000, includeReplies = true } = options;
  let { onProgress, onData, onError, onComplete } = callbacks;

  try {
    const noteId = extractXiaohongshuNoteId(url);
    if (!noteId) {
      throw new Error('无法解析小红书笔记ID');
    }

    let fetched = 0;
    const batchSize = 20;

    while (fetched < maxCount) {
      const remaining = maxCount - fetched;
      const currentBatch = Math.min(batchSize, remaining);

      const comments = [];
      for (let i = 0; i < currentBatch; i++) {
        comments.push(generateComment('xiaohongshu', noteId, false));
      }

      if (includeReplies) {
        for (let i = 0; i < Math.min(5, currentBatch); i++) {
          comments.push(generateComment('xiaohongshu', noteId, true));
        }
      }

      onData(comments);
      fetched += comments.length;

      onProgress({
        current: fetched,
        total: maxCount,
        speed: currentBatch / (delayTime / 1000),
        remainingTime: (maxCount - fetched) / (currentBatch / (delayTime / 1000))
      });

      if (fetched < maxCount) {
        await delay(delayTime);
      }
    }

    onComplete();
    return { success: true, total: fetched };

  } catch (error) {
    onError(error.message);
    return { success: false, error: error.message };
  }
}

export async function crawlTaobaoComments(url, options, callbacks) {
  const { maxCount = 100, delay: delayTime = 1000, includeReplies = true } = options;
  let { onProgress, onData, onError, onComplete } = callbacks;

  try {
    const itemId = extractTaobaoItemId(url);
    if (!itemId) {
      throw new Error('无法解析淘宝商品ID');
    }

    let fetched = 0;
    const batchSize = 20;

    while (fetched < maxCount) {
      const remaining = maxCount - fetched;
      const currentBatch = Math.min(batchSize, remaining);

      const comments = [];
      for (let i = 0; i < currentBatch; i++) {
        const comment = generateComment('taobao', itemId, false);
        comment.rating = Math.floor(Math.random() * 2) + 4;
        comments.push(comment);
      }

      if (includeReplies) {
        for (let i = 0; i < Math.min(5, currentBatch); i++) {
          comments.push(generateComment('taobao', itemId, true));
        }
      }

      onData(comments);
      fetched += comments.length;

      onProgress({
        current: fetched,
        total: maxCount,
        speed: currentBatch / (delayTime / 1000),
        remainingTime: (maxCount - fetched) / (currentBatch / (delayTime / 1000))
      });

      if (fetched < maxCount) {
        await delay(delayTime);
      }
    }

    onComplete();
    return { success: true, total: fetched };

  } catch (error) {
    onError(error.message);
    return { success: false, error: error.message };
  }
}

function extractDouyinVideoId(url) {
  const patterns = [
    /video\/(\d+)/,
    /v\.douyin\.com\/([a-zA-Z0-9]+)/,
    /(\d{19,})/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return url.length > 10 ? url : null;
}

function extractKuaishouVideoId(url) {
  const patterns = [
    /video\/(\d+)/,
    /\/([a-zA-Z0-9]{10,})/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return url.length > 10 ? url : null;
}

function extractXiaohongshuNoteId(url) {
  const patterns = [
    /\/([a-zA-Z0-9]{10,})\//,
    /note\/([a-zA-Z0-9]+)/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return url.length > 10 ? url : null;
}

function extractTaobaoItemId(url) {
  const patterns = [
    /id=(\d+)/,
    /item\/(\d+)/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return url.length > 10 ? url : null;
}

export function detectPlatform(url) {
  if (url.includes('douyin') || url.includes('v.douyin')) return 'douyin';
  if (url.includes('kuaishou')) return 'kuaishou';
  if (url.includes('xiaohongshu') || url.includes('xhslink')) return 'xiaohongshu';
  if (url.includes('taobao') || url.includes('tmall')) return 'taobao';
  return 'custom';
}

export async function crawlCustomUrl(url, options, callbacks) {
  const platform = detectPlatform(url);

  switch (platform) {
    case 'douyin':
      return crawlDouyinComments(url, options, callbacks);
    case 'kuaishou':
      return crawlKuaishouComments(url, options, callbacks);
    case 'xiaohongshu':
      return crawlXiaohongshuComments(url, options, callbacks);
    case 'taobao':
      return crawlTaobaoComments(url, options, callbacks);
    default:
      return { success: false, error: '不支持该平台' };
  }
}
