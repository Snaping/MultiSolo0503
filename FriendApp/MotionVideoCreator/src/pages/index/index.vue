<template>
  <view class="container">
    <view class="header">
      <text class="title">动效视频生成器</text>
      <text class="subtitle">根据节气、主题、节假日生成精美动效视频</text>
    </view>

    <view class="content">
      <view class="card">
        <view class="card-title">选择节气/节日</view>
        <picker mode="selector" :range="festivals" range-key="name" @change="onFestivalChange">
          <view class="picker-value">
            {{ selectedFestival ? selectedFestival.icon + ' ' + selectedFestival.name : '请选择' }}
            <text class="arrow">▼</text>
          </view>
        </picker>
      </view>

      <view class="card">
        <view class="card-title">选择主题风格</view>
        <view class="theme-grid">
          <view
            v-for="theme in themes"
            :key="theme.id"
            class="theme-item"
            :class="{ active: selectedTheme && selectedTheme.id === theme.id }"
            :style="{ backgroundColor: theme.color }"
            @click="onThemeSelect(theme)"
          >
            <text class="theme-name">{{ theme.name }}</text>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-title">上传图片</view>
        <view class="image-upload-area" @click="takePhoto">
          <image
            v-if="imagePath"
            :src="imagePath"
            class="uploaded-image"
            mode="aspectFill"
          />
          <view v-else class="upload-hint">
            <text class="icon">📷</text>
            <text class="text">点击上传图片</text>
          </view>
        </view>
        <view class="btn-row">
          <button class="btn-secondary" @click="takePhoto">拍照</button>
          <button class="btn-secondary" @click="selectFromGallery">从相册选择</button>
        </view>
      </view>

      <view class="card">
        <view class="card-title">输入描述文案</view>
        <textarea
          v-model="prompt"
          class="prompt-input"
          placeholder="输入您想要的视频描述..."
          maxlength="200"
        />
      </view>
    </view>

    <view class="footer">
      <button
        class="btn-primary"
        :disabled="isGenerating"
        @click="generateVideo"
      >
        {{ isGenerating ? '正在生成视频...' : '生成视频' }}
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { festivals as festivalData } from '../../utils/festival.js'
import { themes as themeData } from '../../utils/theme.js'

const festivals = ref(festivalData)
const themes = ref(themeData)
const selectedFestival = ref(null)
const selectedTheme = ref(null)
const imagePath = ref('')
const prompt = ref('')
const isGenerating = ref(false)

onMounted(() => {
  const defaultFestival = getDefaultFestival()
  selectedFestival.value = defaultFestival
})

function getDefaultFestival() {
  const now = new Date()
  const month = now.getMonth() + 1
  const day = now.getDate()

  const solarTerms = {
    1: { start: 20, festival: 'dahan' },
    2: { start: 4, festival: 'lichun' },
    3: { start: 20, festival: 'chunfen' },
    4: { start: 20, festival: 'guyu' },
    5: { start: 21, festival: 'lixia' },
    6: { start: 21, festival: 'xiazhi' },
    7: { start: 23, festival: 'dashu' },
    8: { start: 23, festival: 'chushu' },
    9: { start: 23, festival: 'baihu' },
    10: { start: 24, festival: 'qiufen' },
    11: { start: 22, festival: 'lidong' },
    12: { start: 22, festival: 'dongzhi' }
  }

  const info = solarTerms[month]
  if (info && day >= info.start) {
    return festivals.value.find(f => f.id === info.festival) || festivals.value[0]
  } else if (month > 1 && solarTerms[month - 1]) {
    return festivals.value.find(f => f.id === solarTerms[month - 1].festival) || festivals.value[0]
  }
  return festivals.value[0]
}

function onFestivalChange(e) {
  selectedFestival.value = festivals.value[e.detail.value]
}

function onThemeSelect(theme) {
  selectedTheme.value = theme
}

function takePhoto() {
  uni.chooseImage({
    count: 1,
    sourceType: ['camera'],
    success: (res) => {
      imagePath.value = res.tempFilePaths[0]
    },
    fail: () => {
      uni.showToast({ title: '请授予相机权限', icon: 'none' })
    }
  })
}

function selectFromGallery() {
  uni.chooseImage({
    count: 1,
    sourceType: ['album'],
    success: (res) => {
      imagePath.value = res.tempFilePaths[0]
    }
  })
}

function validateInputs() {
  if (!selectedTheme.value) {
    uni.showToast({ title: '请选择主题风格', icon: 'none' })
    return false
  }
  if (!imagePath.value) {
    uni.showToast({ title: '请上传图片', icon: 'none' })
    return false
  }
  if (!prompt.value.trim()) {
    uni.showToast({ title: '请输入描述文案', icon: 'none' })
    return false
  }
  return true
}

function generateVideo() {
  if (!validateInputs()) return

  isGenerating.value = true

  setTimeout(() => {
    uni.showLoading({ title: '正在生成视频...' })

    setTimeout(() => {
      uni.hideLoading()
      isGenerating.value = false
      uni.navigateTo({
        url: `/pages/preview/preview?theme=${selectedTheme.value.name}&festival=${selectedFestival.value.name}`
      })
    }, 3000)
  }, 500)
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120rpx;
}

.header {
  background: linear-gradient(135deg, #6200EE 0%, #9C27B0 100%);
  padding: 40rpx 32rpx;
  color: white;
}

.title {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  margin-bottom: 12rpx;
}

.subtitle {
  display: block;
  font-size: 26rpx;
  opacity: 0.9;
}

.content {
  padding: 32rpx;
}

.card {
  background-color: white;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.card-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #212121;
  margin-bottom: 24rpx;
}

.picker-value {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  background-color: #f5f5f5;
  border-radius: 16rpx;
  font-size: 30rpx;
}

.arrow {
  font-size: 24rpx;
  color: #757575;
}

.theme-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.theme-item {
  width: 150rpx;
  height: 80rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  transition: all 0.3s;
}

.theme-item.active {
  opacity: 1;
  transform: scale(1.05);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.3);
}

.theme-name {
  color: white;
  font-size: 26rpx;
  font-weight: 500;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
}

.image-upload-area {
  width: 100%;
  height: 400rpx;
  background-color: #f5f5f5;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-bottom: 24rpx;
}

.uploaded-image {
  width: 100%;
  height: 100%;
}

.upload-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.upload-hint .icon {
  font-size: 80rpx;
  margin-bottom: 16rpx;
}

.upload-hint .text {
  font-size: 28rpx;
  color: #757575;
}

.btn-row {
  display: flex;
  gap: 24rpx;
}

.btn-secondary {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  background-color: white;
  border: 2rpx solid #6200EE;
  border-radius: 40rpx;
  color: #6200EE;
  font-size: 28rpx;
}

.btn-secondary:active {
  background-color: #f5f5f5;
}

.prompt-input {
  width: 100%;
  height: 240rpx;
  padding: 24rpx;
  background-color: #f5f5f5;
  border-radius: 16rpx;
  font-size: 30rpx;
  box-sizing: border-box;
}

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 32rpx;
  background-color: white;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.btn-primary {
  width: 100%;
  height: 96rpx;
  line-height: 96rpx;
  background: linear-gradient(135deg, #6200EE 0%, #9C27B0 100%);
  border-radius: 48rpx;
  color: white;
  font-size: 34rpx;
  font-weight: bold;
}

.btn-primary:active:not(:disabled) {
  opacity: 0.9;
}

.btn-primary:disabled {
  opacity: 0.6;
}
</style>