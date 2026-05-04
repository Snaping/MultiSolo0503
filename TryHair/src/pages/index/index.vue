<template>
  <view class="index-page">
    <view class="header">
      <text class="title">发型试戴</text>
      <text class="subtitle">发现你的完美发型</text>
    </view>

    <view class="main-content">
      <view class="camera-area" @click="handleCameraClick">
        <view class="camera-icon">
          <text class="iconfont">📷</text>
        </view>
        <text class="camera-text">点击拍照</text>
        <text class="camera-hint">或从相册选择照片</text>
      </view>

      <view class="upload-area">
        <view class="upload-btn" @click="chooseFromAlbum">
          <text class="upload-icon">📁</text>
          <text class="upload-text">从相册选择</text>
        </view>
      </view>

      <view class="features">
        <view class="feature-item">
          <text class="feature-icon">✨</text>
          <text class="feature-name">AI换发</text>
        </view>
        <view class="feature-item">
          <text class="feature-icon">🎨</text>
          <text class="feature-name">多样发型</text>
        </view>
        <view class="feature-item">
          <text class="feature-icon">💯</text>
          <text class="feature-name">真实效果</text>
        </view>
      </view>
    </view>

    <view class="footer safe-area-bottom">
      <view class="history-section">
        <view class="section-header">
          <text class="section-title">最近试戴</text>
          <text class="section-more" @click="goToGallery">查看全部 →</text>
        </view>
        <scroll-view class="history-scroll" scroll-x>
          <view class="history-list">
            <view 
              v-for="result in recentResults" 
              :key="result.id" 
              class="history-item"
              @click="viewResult(result)"
            >
              <image :src="result.resultImage" mode="aspectFill" class="history-image" />
            </view>
            <view v-if="recentResults.length === 0" class="empty-history">
              <text class="empty-text">暂无试戴记录</text>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useHairStore } from '@/stores/hairStore'

const store = useHairStore()

const recentResults = computed(() => store.tryOnResults.slice(0, 5))

function handleCameraClick() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['camera'],
    success: (res) => {
      processImage(res.tempFilePaths[0])
    },
    fail: (err) => {
      console.log('拍照失败:', err)
      uni.showToast({ title: '拍照失败', icon: 'none' })
    }
  })
}

function chooseFromAlbum() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album'],
    success: (res) => {
      processImage(res.tempFilePaths[0])
    },
    fail: (err) => {
      console.log('选择图片失败:', err)
      uni.showToast({ title: '选择图片失败', icon: 'none' })
    }
  })
}

function processImage(imagePath: string) {
  store.setUserImage(imagePath)
  uni.navigateTo({ url: '/pages/gallery/gallery?fromCamera=1' })
}

function viewResult(result: typeof store.tryOnResults[0]) {
  uni.navigateTo({ url: `/pages/result/result?id=${result.id}` })
}

function goToGallery() {
  uni.switchTab({ url: '/pages/gallery/gallery' })
}
</script>

<style lang="scss" scoped>
.index-page {
  min-height: 100vh;
  background: linear-gradient(180deg, $bg-secondary 0%, $bg-color 100%);
  display: flex;
  flex-direction: column;
}

.header {
  padding: $spacing-xl $spacing-lg $spacing-base;
  text-align: center;
  
  .title {
    display: block;
    font-size: $font-size-xxl;
    font-weight: 700;
    color: $text-primary;
    margin-bottom: $spacing-xs;
  }
  
  .subtitle {
    font-size: $font-size-sm;
    color: $text-secondary;
  }
}

.main-content {
  flex: 1;
  padding: $spacing-lg;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.camera-area {
  width: 600rpx;
  height: 600rpx;
  border-radius: $radius-full;
  background: linear-gradient(135deg, $primary-color 0%, $primary-dark 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: $shadow-lg;
  margin-bottom: $spacing-lg;
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.95);
  }
  
  .camera-icon {
    font-size: 120rpx;
    margin-bottom: $spacing-base;
  }
  
  .camera-text {
    font-size: $font-size-lg;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: $spacing-xs;
  }
  
  .camera-hint {
    font-size: $font-size-sm;
    color: rgba(255, 255, 255, 0.7);
  }
}

.upload-area {
  margin-bottom: $spacing-xl;
  
  .upload-btn {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-base $spacing-xl;
    background: $bg-card;
    border-radius: $radius-full;
    border: 2rpx solid $border-color;
    
    &:active {
      background: $bg-secondary;
    }
    
    .upload-icon {
      font-size: $font-size-lg;
    }
    
    .upload-text {
      font-size: $font-size-base;
      color: $text-secondary;
    }
  }
}

.features {
  display: flex;
  gap: $spacing-xl;
  
  .feature-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $spacing-xs;
    
    .feature-icon {
      font-size: 56rpx;
    }
    
    .feature-name {
      font-size: $font-size-xs;
      color: $text-muted;
    }
  }
}

.footer {
  padding: $spacing-base;
  background: $bg-color;
}

.history-section {
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-base;
    
    .section-title {
      font-size: $font-size-lg;
      font-weight: 600;
      color: $text-primary;
    }
    
    .section-more {
      font-size: $font-size-sm;
      color: $primary-color;
    }
  }
  
  .history-scroll {
    white-space: nowrap;
  }
  
  .history-list {
    display: inline-flex;
    gap: $spacing-sm;
    
    .history-item {
      width: 120rpx;
      height: 120rpx;
      border-radius: $radius-base;
      overflow: hidden;
      border: 2rpx solid $border-color;
      
      .history-image {
        width: 100%;
        height: 100%;
      }
    }
    
    .empty-history {
      width: 100%;
      padding: $spacing-lg;
      text-align: center;
      
      .empty-text {
        font-size: $font-size-sm;
        color: $text-muted;
      }
    }
  }
}
</style>
