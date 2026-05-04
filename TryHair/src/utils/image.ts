export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours().toString().padStart(2, '0')
  const minute = date.getMinutes().toString().padStart(2, '0')
  return `${month}月${day}日 ${hour}:${minute}`
}

export function compressImage(imagePath: string, quality: number = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    uni.compressImage({
      src: imagePath,
      quality,
      success: (res) => resolve(res.tempFilePath),
      fail: reject
    })
  })
}

export function getImageInfo(imagePath: string): Promise<{ width: number; height: number; type: string }> {
  return new Promise((resolve, reject) => {
    uni.getImageInfo({
      src: imagePath,
      success: resolve,
      fail: reject
    })
  })
}
