import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { HairStyle, TryOnResult } from '@/types'
import { hairStyles } from '@/data/hairStyles'

export const useHairStore = defineStore('hair', () => {
  const selectedHair = ref<HairStyle | null>(null)
  const userImage = ref<string>('')
  const tryOnResults = ref<TryOnResult[]>([])

  const categories = computed(() => {
    const cats = new Set(hairStyles.map(h => h.category))
    return Array.from(cats)
  })

  const filteredStyles = computed(() => {
    return hairStyles
  })

  function selectHair(style: HairStyle) {
    selectedHair.value = style
  }

  function setUserImage(image: string) {
    userImage.value = image
  }

  function addTryOnResult(result: TryOnResult) {
    tryOnResults.value.unshift(result)
    if (tryOnResults.value.length > 10) {
      tryOnResults.value.pop()
    }
  }

  function clearSelected() {
    selectedHair.value = null
    userImage.value = ''
  }

  return {
    selectedHair,
    userImage,
    tryOnResults,
    categories,
    filteredStyles,
    selectHair,
    setUserImage,
    addTryOnResult,
    clearSelected
  }
})
