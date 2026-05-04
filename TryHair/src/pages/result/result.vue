<template>
  <view class="result-page">
    <view class="nav-header">
      <view class="nav-back" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="nav-title">试戴效果</text>
      <view class="nav-action" @click="saveImage">
        <text class="action-icon">💾</text>
      </view>
    </view>

    <view class="result-content" v-if="!loading">
      <view class="preview-area">
        <view class="preview-container">
          <image :src="store.userImage" mode="aspectFill" class="user-image" />
          <image 
            :src="store.selectedHair?.image" 
            mode="aspectFit" 
            class="hair-overlay"
            :style="hairStyle"
          />
        </view>
        <view class="preview-controls">
          <view class="control-btn" @click="adjustPosition(-10, 0)">
            <text>↑</text>
          </view>
          <view class="control-row">
            <view class="control-btn" @click="adjustPosition(0, -10)">
              <text>←</text>
            </view>
            <view class="control-btn" @click="resetPosition">
              <text>⟲</text>
            </view>
            <view class="control-btn" @click="adjustPosition(0, 10)">
              <text>→</text>
            </view>
          </view>
          <view class="control-btn" @click="adjustPosition(10, 0)">
            <text>↓</text>
          </view>
        </view>
      </view>

      <view class="hair-info">
        <text class="hair-title">{{ store.selectedHair?.name }}</text>
        <view class="hair-meta">
          <text class="meta-item">{{ store.selectedHair?.category }}</text>
          <text class="meta-divider">|</text>
          <text class="meta-item">{{ getLengthText(store.selectedHair?.length) }}</text>
        </view>
        <view class="hair-tags">
          <text v-for="tag in store.selectedHair?.tags" :key="tag" class="tag">{{ tag }}</text>
        </view>
      </view>

      <view class="actions">
        <view class="action-btn secondary" @click="changeHair">
          <text>换一个发型</text>
        </view>
        <view class="action-btn primary" @click="confirmTryOn">
          <text>确认试戴</text>
        </view>
      </view>

      <view class="tips">
        <text class="tips-title">💡 小提示</text>
        <text class="tips-content">您可以通过方向按钮调整发型位置，找到最适合您的效果</text>
      </view>
    </view>

    <view class="loading-state" v-else>
      <view class="loading-spinner">
        <text class="spinner">◐</text>
      </view>
      <text class="loading-text">AI正在处理中...</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useHairStore } from '@/stores/hairStore'
import { generateId } from '@/utils/image'
import type { TryOnResult } from '@/types'

const store = useHairStore()

const loading = ref(true)
const position = reactive({ x: 0, y: 0, scale: 1 })

const hairStyle = computed(() => ({
  transform: `translate(${position.x}px, ${position.y}px) scale(${position.scale})`,
  transition: 'transform 0.2s ease'
}))

onMounted(() => {
  simulateAIProcessing()
})

function simulateAIProcessing() {
  setTimeout(() => {
    loading.value = false
  }, 1500)
}

function getLengthText(length?: string) {
  const map: Record<string, string> = {
    short: '短发',
    medium: '中长发',
    long: '长发'
  }
  return map[length || ''] || ''
}

function adjustPosition(dx: number, dy: number) {
  position.x += dx
  position.y += dy
}

function resetPosition() {
  position.x = 0
  position.y = 0
  position.scale = 1
}

function goBack() {
  uni.navigateBack()
}

function changeHair() {
  uni.navigateTo({ url: '/pages/gallery/gallery' })
}

function confirmTryOn() {
  const result: TryOnResult = {
    id: generateId(),
    userImage: store.userImage,
    hairStyle: store.selectedHair!,
    resultImage: store.selectedHair!.image,
    timestamp: Date.now()
  }
  
  store.addTryOnResult(result)
  
  uni.showToast({
    title: '试戴成功',
    icon: 'success'
  })
  
  setTimeout(() => {
    uni.switchTab({ url: '/pages/index/index' })
  }, 1500)
}

function saveImage() {
  uni.showToast({
    title: '保存功能开发中',
    icon: 'none'
  })
}
</script>

<style lang="scss" scoped>
.result-page {
  min-height: 100vh;
  background: $bg-color;
}

.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-lg;
  background: $bg-secondary;
  
  .nav-back, .nav-action {
    width: 80rpx;
    height: 80rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $bg-card;
    border-radius: $radius-full;
    
    &:active {
      background: $primary-color;
    }
  }
  
  .back-icon {
    font-size: $font-size-xl;
    color: $text-primary;
  }
  
  .action-icon {
    font-size: $font-size-lg;
  }
  
  .nav-title {
    font-size: $font-size-lg;
    font-weight: 600;
    color: $text-primary;
  }
}

.result-content {
  padding: $spacing-lg;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  
  .loading-spinner {
    margin-bottom: $spacing-lg;
    
    .spinner {
      font-size: 80rpx;
      color: $primary-color;
      animation: spin 1s linear infinite;
    }
  }
  
  .loading-text {
    font-size: $font-size-base;
    color: $text-secondary;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.preview-area {
  margin-bottom: $spacing-lg;
  
  .preview-container {
    position: relative;
    width: 100%;
    padding-top: 100%;
    background: $bg-card;
    border-radius: $radius-lg;
    overflow: hidden;
    
    .user-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
    
    .hair-overlay {
      position: absolute;
      top: 10%;
      left: 10%;
      width: 80%;
      height: 60%;
      object-fit: contain;
    }
  }
  
  .preview-controls {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $spacing-xs;
    margin-top: $spacing-base;
    
    .control-row {
      display: flex;
      gap: $spacing-xs;
    }
    
    .control-btn {
      width: 80rpx;
      height: 80rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      background: $bg-card;
      border-radius: $radius-base;
      border: 2rpx solid $border-color;
      
      text {
        font-size: $font-size-lg;
        color: $text-primary;
      }
      
      &:active {
        background: $primary-color;
        border-color: $primary-color;
      }
    }
  }
}

.hair-info {
  background: $bg-card;
  border-radius: $radius-lg;
  padding: $spacing-lg;
  margin-bottom: $spacing-lg;
  
  .hair-title {
    display: block;
    font-size: $font-size-xl;
    font-weight: 700;
    color: $text-primary;
    margin-bottom: $spacing-sm;
  }
  
  .hair-meta {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    margin-bottom: $spacing-base;
    
    .meta-item {
      font-size: $font-size-sm;
      color: $text-secondary;
    }
    
    .meta-divider {
      color: $text-muted;
    }
  }
  
  .hair-tags {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-xs;
    
    .tag {
      font-size: $font-size-xs;
      color: $primary-light;
      background: rgba(108, 92, 231, 0.15);
      padding: $spacing-xs $spacing-sm;
      border-radius: $radius-sm;
    }
  }
}

.actions {
  display: flex;
  gap: $spacing-base;
  margin-bottom: $spacing-lg;
  
  .action-btn {
    flex: 1;
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: $radius-base;
    font-size: $font-size-lg;
    font-weight: 500;
    
    &.primary {
      background: linear-gradient(135deg, $primary-color, $primary-dark);
      color: $text-primary;
    }
    
    &.secondary {
      background: $bg-card;
      color: $text-primary;
      border: 2rpx solid $border-color;
    }
    
    &:active {
      opacity: 0.8;
    }
  }
}

.tips {
  background: rgba(253, 203, 110, 0.1);
  border-radius: $radius-base;
  padding: $spacing-base;
  border-left: 6rpx solid $warning-color;
  
  .tips-title {
    display: block;
    font-size: $font-size-base;
    font-weight: 600;
    color: $warning-color;
    margin-bottom: $spacing-xs;
  }
  
  .tips-content {
    font-size: $font-size-sm;
    color: $text-secondary;
    line-height: 1.6;
  }
}
</style>
