<script setup>
</script>

<template>
  <view class="app-container">
    <slot />
  </view>
</template>

<style>
@import url('./static/index.css');

.app-container {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f5f5;
}
</style>