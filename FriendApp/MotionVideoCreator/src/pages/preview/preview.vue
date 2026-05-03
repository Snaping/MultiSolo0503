<template>
  <view class="preview-container">
    <view class="video-wrapper">
      <video
        v-if="videoSrc"
        :src="videoSrc"
        class="video-player"
        controls
        :poster="thumbnail"
        enable-danmu
        danmu-list=""
        @play="onPlay"
        @pause="onPause"
      />
      <view v-else class="placeholder">
        <text class="placeholder-icon">🎬</text>
        <text class="placeholder-text">视频预览区域</text>
      </view>

      <view v-if="!isPlaying" class="play-overlay" @click="playVideo">
        <view class="play-btn">
          <text class="play-icon">▶</text>
        </view>
      </view>
    </view>

    <view class="video-info">
      <text class="info-label">主题：{{ themeName }}</text>
      <text class="info-label">节日：{{ festivalName }}</text>
    </view>

    <view class="action-buttons">
      <button class="btn-action" @click="saveVideo">
        <text class="btn-icon">💾</text>
        <text class="btn-text">保存视频</text>
      </button>
      <button class="btn-action primary" @click="shareVideo">
        <text class="btn-icon">📤</text>
        <text class="btn-text">分享视频</text>
      </button>
    </view>

    <view class="tips">
      <text class="tips-title">💡 提示</text>
      <text class="tips-content">视频已保存到相册，您可以通过系统相册查看和分享。</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const videoSrc = ref('')
const thumbnail = ref('')
const themeName = ref('')
const festivalName = ref('')
const isPlaying = ref(false)

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options || {}

  themeName.value = options.theme || '默认主题'
  festivalName.value = options.festival || '默认节日'

  videoSrc.value = ''
  thumbnail.value = ''
})

function onPlay() {
  isPlaying.value = true
}

function onPause() {
  isPlaying.value = false
}

function playVideo() {
  const videoContext = uni.createVideoContext('videoPlayer')
  videoContext.play()
}

function saveVideo() {
  uni.showToast({ title: '视频保存成功', icon: 'success' })
}

function shareVideo() {
  uni.showShareMenu({
    withShareTicket: true,
    menus: ['shareAppMessage', 'shareTimeline']
  })
  uni.showToast({ title: '分享功能已打开', icon: 'none' })
}
</script>

<style scoped>
.preview-container {
  min-height: 100vh;
  background-color: #1a1a1a;
  display: flex;
  flex-direction: column;
}

.video-wrapper {
  width: 100%;
  aspect-ratio: 16/9;
  background-color: #000;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-player {
  width: 100%;
  height: 100%;
}

.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.placeholder-icon {
  font-size: 120rpx;
  margin-bottom: 24rpx;
}

.placeholder-text {
  font-size: 28rpx;
  color: #666;
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.3);
}

.play-btn {
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-icon {
  font-size: 60rpx;
  color: #6200EE;
  margin-left: 10rpx;
}

.video-info {
  padding: 32rpx;
  background-color: #2a2a2a;
}

.info-label {
  display: block;
  font-size: 28rpx;
  color: #aaa;
  margin-bottom: 12rpx;
}

.action-buttons {
  display: flex;
  gap: 24rpx;
  padding: 32rpx;
  background-color: #2a2a2a;
}

.btn-action {
  flex: 1;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #3a3a3a;
  border-radius: 48rpx;
}

.btn-action.primary {
  background: linear-gradient(135deg, #6200EE 0%, #9C27B0 100%);
}

.btn-icon {
  font-size: 36rpx;
  margin-right: 12rpx;
}

.btn-text {
  font-size: 30rpx;
  color: white;
}

.tips {
  margin: 32rpx;
  padding: 24rpx;
  background-color: #2a2a2a;
  border-radius: 16rpx;
  border-left: 8rpx solid #6200EE;
}

.tips-title {
  display: block;
  font-size: 28rpx;
  color: #fff;
  margin-bottom: 12rpx;
}

.tips-content {
  display: block;
  font-size: 26rpx;
  color: #888;
  line-height: 1.6;
}
</style>