package com.example.motionvideocreator.data

data class ThemeItem(
    val id: String,
    val name: String,
    val color: String,
    val animationType: AnimationType
)

enum class AnimationType {
    FADE_IN,
    SLIDE_UP,
    ZOOM_IN,
    ROTATE,
    WAVE,
    GLITCH,
    PARTY,
    ROMANTIC
}

object ThemeRepository {
    val themes = listOf(
        ThemeItem("romantic", "浪漫温馨", "#FF69B4", AnimationType.ROMANTIC),
        ThemeItem("cute", "可爱萌趣", "#FFB6C1", AnimationType.PARTY),
        ThemeItem("retro", "复古怀旧", "#DAA520", AnimationType.FADE_IN),
        ThemeItem("minimal", "简约清新", "#87CEEB", AnimationType.SLIDE_UP),
        ThemeItem("dynamic", "动感活力", "#FF6347", AnimationType.WAVE),
        ThemeItem("elegant", "优雅古典", "#9370DB", AnimationType.ZOOM_IN),
        ThemeItem("mysterious", "神秘奇幻", "#4B0082", AnimationType.GLITCH),
        ThemeItem("warm", "温暖治愈", "#FFA500", AnimationType.ROTATE)
    )
}