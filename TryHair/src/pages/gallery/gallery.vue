<template>
  <view class="gallery-page">
    <view class="header">
      <text class="title">发型库</text>
      <view class="search-box">
        <text class="search-icon">🔍</text>
        <input 
          class="search-input" 
          type="text" 
          placeholder="搜索发型" 
          v-model="searchText"
          placeholder-class="search-placeholder"
        />
      </view>
    </view>

    <scroll-view class="category-scroll" scroll-x>
      <view class="category-list">
        <view 
          v-for="cat in categories" 
          :key="cat" 
          class="category-item"
          :class="{ active: selectedCategory === cat }"
          @click="selectCategory(cat)"
        >
          <text class="category-name">{{ cat }}</text>
        </view>
      </view>
    </scroll-view>

    <scroll-view class="hair-grid-scroll" scroll-y>
      <view class="hair-grid">
        <view 
          v-for="hair in filteredHairs" 
          :key="hair.id" 
          class="hair-card"
          @click="previewHair(hair)"
        >
          <view class="hair-image-wrapper">
            <image :src="hair.image" mode="aspectFill" class="hair-image" />
            <view class="hair-overlay">
              <text class="overlay-text">试戴</text>
            </view>
          </view>
          <text class="hair-name">{{ hair.name }}</text>
          <view class="hair-tags">
            <text v-for="tag in hair.tags.slice(0, 2)" :key="tag" class="hair-tag">{{ tag }}</text>
          </view>
        </view>
      </view>
      <view v-if="filteredHairs.length === 0" class="empty-state">
        <text class="empty-icon">🔍</text>
        <text class="empty-text">没有找到匹配的发型</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useHairStore } from '@/stores/hairStore'
import type { HairStyle } from '@/types'

const store = useHairStore()

const searchText = ref('')
const selectedCategory = ref('')

const categories = computed(() => {
  return ['全部', ...store.categories]
})

const filteredHairs = computed(() => {
  let result = store.filteredStyles
  
  if (selectedCategory.value && selectedCategory.value !== '全部') {
    result = result.filter(h => h.category === selectedCategory.value)
  }
  
  if (searchText.value) {
    const keyword = searchText.value.toLowerCase()
    result = result.filter(h => 
      h.name.toLowerCase().includes(keyword) ||
      h.tags.some(tag => tag.toLowerCase().includes(keyword))
    )
  }
  
  return result
})

function selectCategory(cat: string) {
  selectedCategory.value = cat
}

function previewHair(hair: HairStyle) {
  store.selectHair(hair)
  
  if (store.userImage) {
    navigateToTryOn()
  } else {
    uni.showModal({
      title: '提示',
      content: '请先拍照或选择一张照片',
      confirmText: '去拍照',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          uni.switchTab({ url: '/pages/index/index' })
        }
      }
    })
  }
}

function navigateToTryOn() {
  uni.navigateTo({ url: '/pages/result/result' })
}
</script>

<style lang="scss" scoped>
.gallery-page {
  min-height: 100vh;
  background: $bg-color;
  display: flex;
  flex-direction: column;
}

.header {
  padding: $spacing-lg;
  background: $bg-secondary;
  
  .title {
    display: block;
    font-size: $font-size-xl;
    font-weight: 700;
    color: $text-primary;
    margin-bottom: $spacing-base;
  }
  
  .search-box {
    display: flex;
    align-items: center;
    background: $bg-card;
    border-radius: $radius-full;
    padding: $spacing-sm $spacing-base;
    border: 2rpx solid $border-color;
    
    .search-icon {
      font-size: $font-size-lg;
      margin-right: $spacing-sm;
    }
    
    .search-input {
      flex: 1;
      background: transparent;
      border: none;
      color: $text-primary;
      font-size: $font-size-base;
    }
    
    .search-placeholder {
      color: $text-muted;
    }
  }
}

.category-scroll {
  white-space: nowrap;
  background: $bg-secondary;
  padding: $spacing-sm $spacing-lg;
  border-bottom: 2rpx solid $border-color;
}

.category-list {
  display: inline-flex;
  gap: $spacing-sm;
  
  .category-item {
    padding: $spacing-sm $spacing-lg;
    border-radius: $radius-full;
    background: $bg-card;
    border: 2rpx solid transparent;
    transition: all 0.3s ease;
    
    &.active {
      background: $primary-color;
      border-color: $primary-color;
    }
    
    .category-name {
      font-size: $font-size-sm;
      color: $text-secondary;
      
      .active & {
        color: $text-primary;
      }
    }
  }
}

.hair-grid-scroll {
  flex: 1;
  padding: $spacing-base;
}

.hair-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-base;
}

.hair-card {
  background: $bg-card;
  border-radius: $radius-lg;
  overflow: hidden;
  border: 2rpx solid $border-color;
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.98);
    border-color: $primary-color;
  }
  
  .hair-image-wrapper {
    position: relative;
    width: 100%;
    padding-top: 100%;
    
    .hair-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
    
    .hair-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
      padding: $spacing-lg $spacing-base $spacing-base;
      display: flex;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
      
      .hair-card:active & {
        opacity: 1;
      }
      
      .overlay-text {
        color: $text-primary;
        font-size: $font-size-sm;
        font-weight: 600;
        background: $primary-color;
        padding: $spacing-xs $spacing-base;
        border-radius: $radius-full;
      }
    }
  }
  
  .hair-name {
    display: block;
    font-size: $font-size-base;
    font-weight: 600;
    color: $text-primary;
    padding: $spacing-sm $spacing-base 0;
  }
  
  .hair-tags {
    display: flex;
    gap: $spacing-xs;
    padding: $spacing-xs $spacing-base $spacing-base;
    
    .hair-tag {
      font-size: $font-size-xs;
      color: $text-muted;
      background: $bg-secondary;
      padding: $spacing-xs $spacing-sm;
      border-radius: $radius-sm;
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-xl * 2;
  
  .empty-icon {
    font-size: 80rpx;
    margin-bottom: $spacing-base;
  }
  
  .empty-text {
    font-size: $font-size-base;
    color: $text-muted;
  }
}
</style>
