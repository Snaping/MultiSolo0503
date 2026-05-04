export interface HairStyle {
  id: string
  name: string
  category: string
  image: string
  preview: string
  tags: string[]
  gender: 'male' | 'female' | 'unisex'
  length: 'short' | 'medium' | 'long'
}

export interface TryOnResult {
  id: string
  userImage: string
  hairStyle: HairStyle
  resultImage: string
  timestamp: number
}

export type ImageSource = 'camera' | 'album'
