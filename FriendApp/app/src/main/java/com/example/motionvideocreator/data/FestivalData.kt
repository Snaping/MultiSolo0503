package com.example.motionvideocreator.data

data class FestivalItem(
    val id: String,
    val name: String,
    val icon: String,
    val type: FestivalType
)

enum class FestivalType {
    SOLAR_TERM,
    TRADITIONAL,
    MODERN,
    WESTERN
}

object FestivalRepository {
    val festivals = listOf(
        FestivalItem("spring_festival", "春节", "🎉", FestivalType.TRADITIONAL),
        FestivalItem("lantern_festival", "元宵节", "🏮", FestivalType.TRADITIONAL),
        FestivalItem("qingming_festival", "清明节", "🌸", FestivalType.TRADITIONAL),
        FestivalItem("dragon_boat_festival", "端午节", "🐉", FestivalType.TRADITIONAL),
        FestivalItem("mid_autumn_festival", "中秋节", "🥮", FestivalType.TRADITIONAL),
        FestivalItem("national_day", "国庆节", "🇨🇳", FestivalType.MODERN),
        FestivalItem("new_year", "元旦", "🎊", FestivalType.MODERN),
        FestivalItem("women_day", "妇女节", "💐", FestivalType.MODERN),
        FestivalItem("may_day", "劳动节", "🛠️", FestivalType.MODERN),
        FestivalItem("childrens_day", "儿童节", "🎈", FestivalType.MODERN),
        FestivalItem("teachers_day", "教师节", "📚", FestivalType.MODERN),
        FestivalItem("valentines_day", "情人节", "💝", FestivalType.WESTERN),
        FestivalItem("april_fools", "愚人节", "🤡", FestivalType.WESTERN),
        FestivalItem("halloween", "万圣节", "🎃", FestivalType.WESTERN),
        FestivalItem("christmas", "圣诞节", "🎄", FestivalType.WESTERN),
        FestivalItem("lichun", "立春", "🌱", FestivalType.SOLAR_TERM),
        FestivalItem("yushui", "雨水", "💧", FestivalType.SOLAR_TERM),
        FestivalItem("jingzhe", "惊蛰", "🦋", FestivalType.SOLAR_TERM),
        FestivalItem("chunfen", "春分", "⚖️", FestivalType.SOLAR_TERM),
        FestivalItem("qingming", "清明", "🌿", FestivalType.SOLAR_TERM),
        FestivalItem("guyu", "谷雨", "🌧️", FestivalType.SOLAR_TERM),
        FestivalItem("lixia", "立夏", "🌞", FestivalType.SOLAR_TERM),
        FestivalItem("xiaoman", "小满", "🌾", FestivalType.SOLAR_TERM),
        FestivalItem("mangzhong", "芒种", "🌾", FestivalType.SOLAR_TERM),
        FestivalItem("xiazhi", "夏至", "☀️", FestivalType.SOLAR_TERM),
        FestivalItem("xiaoshu", "小暑", "🔥", FestivalType.SOLAR_TERM),
        FestivalItem("dashu", "大暑", "🌡️", FestivalType.SOLAR_TERM),
        FestivalItem("liqiu", "立秋", "🍂", FestivalType.SOLAR_TERM),
        FestivalItem("chushu", "处暑", "🌤️", FestivalType.SOLAR_TERM),
        FestivalItem("baihu", "白露", "💨", FestivalType.SOLAR_TERM),
        FestivalItem("qiufen", "秋分", "🍁", FestivalType.SOLAR_TERM),
        FestivalItem("hanlu", "寒露", "🍃", FestivalType.SOLAR_TERM),
        FestivalItem("shuangjiang", "霜降", "❄️", FestivalType.SOLAR_TERM),
        FestivalItem("lidong", "立冬", "🍂", FestivalType.SOLAR_TERM),
        FestivalItem("xiaoxue", "小雪", "🌨️", FestivalType.SOLAR_TERM),
        FestivalItem("daxue", "大雪", "❄️", FestivalType.SOLAR_TERM),
        FestivalItem("dongzhi", "冬至", "☃️", FestivalType.SOLAR_TERM),
        FestivalItem("xiaohan", "小寒", "⛄", FestivalType.SOLAR_TERM),
        FestivalItem("dahan", "大寒", "🧊", FestivalType.SOLAR_TERM)
    )

    fun getDefaultFestival(): FestivalItem {
        val month = java.time.LocalDate.now().month.value
        val day = java.time.LocalDate.now().dayOfMonth
        
        return when (month) {
            1 -> if (day >= 20) festivals.find { it.id == "dahan" } else festivals.find { it.id == "xiaohan" }
            2 -> if (day >= 4) festivals.find { it.id == "lichun" } else festivals.find { it.id == "dahan" }
            3 -> if (day >= 20) festivals.find { it.id == "chunfen" } else if (day >= 5) festivals.find { it.id == "jingzhe" } else festivals.find { it.id == "yushui" }
            4 -> if (day >= 20) festivals.find { it.id == "guyu" } else if (day >= 4) festivals.find { it.id == "qingming" } else festivals.find { it.id == "chunfen" }
            5 -> if (day >= 21) festivals.find { it.id == "lixia" } else festivals.find { it.id == "guyu" }
            6 -> if (day >= 21) festivals.find { it.id == "xiazhi" } else if (day >= 6) festivals.find { it.id == "mangzhong" } else festivals.find { it.id == "xiaoman" }
            7 -> if (day >= 23) festivals.find { it.id == "dashu" } else if (day >= 7) festivals.find { it.id == "xiaoshu" } else festivals.find { it.id == "xiazhi" }
            8 -> if (day >= 23) festivals.find { it.id == "chushu" } else if (day >= 7) festivals.find { it.id == "liqiu" } else festivals.find { it.id == "dashu" }
            9 -> if (day >= 23) festivals.find { it.id == "baihu" } else festivals.find { it.id == "chushu" }
            10 -> if (day >= 24) festivals.find { it.id == "qiufen" } else if (day >= 8) festivals.find { it.id == "hanlu" } else festivals.find { it.id == "baihu" }
            11 -> if (day >= 22) festivals.find { it.id == "lidong" } else if (day >= 7) festivals.find { it.id == "shuangjiang" } else festivals.find { it.id == "qiufen" }
            12 -> if (day >= 22) festivals.find { it.id == "dongzhi" } else if (day >= 7) festivals.find { it.id == "daxue" } else festivals.find { it.id == "xiaoxue" }
            else -> festivals[0]
        } ?: festivals[0]
    }
}