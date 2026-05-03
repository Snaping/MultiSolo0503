<template>
  <div id="cesiumContainer" ref="cesiumContainer"></div>
  
  <div class="toolbar">
    <h2>🛡️ Cesium智能报警系统</h2>
    <button @click="setAlarmType('110')">🚔 110报警</button>
    <button @click="setAlarmType('120')">🚑 120报警</button>
    <button @click="setAlarmType('119')">🚒 119报警</button>
    <button @click="clearAllAlarms">清除报警</button>
    <button @click="showRescueUnits">显示救援单位</button>
  </div>

  <div class="panel" v-if="showPanel">
    <h3>{{ panelTitle }}</h3>
    
    <div v-if="panelType === 'alarm'">
      <div class="form-group">
        <label>报警类型</label>
        <select v-model="alarmForm.type">
          <option value="110">🚔 110 - 治安报警</option>
          <option value="120">🚑 120 - 医疗急救</option>
          <option value="119">🚒 119 - 火灾救援</option>
        </select>
      </div>
      
      <div class="form-group">
        <label>报警位置 (点击地图选择)</label>
        <input type="text" v-model="alarmForm.location" readonly placeholder="请点击地图选择位置">
      </div>
      
      <div class="form-group">
        <label>报警描述</label>
        <textarea v-model="alarmForm.description" placeholder="请输入报警描述..."></textarea>
      </div>
      
      <button class="btn btn-danger" @click="submitAlarm">提交报警</button>
      <button class="btn" @click="showPanel = false">取消</button>
    </div>

    <div v-if="panelType === 'disposal'">
      <div class="alarm-list">
        <div 
          v-for="alarm in alarmRecords" 
          :key="alarm.id"
          :class="['alarm-item', 'alarm-type-' + alarm.type]"
          @click="selectAlarm(alarm)"
        >
          <div><strong>{{ getAlarmTypeName(alarm.type) }}</strong></div>
          <div style="font-size: 12px; color: #aaa;">{{ alarm.location }}</div>
          <div style="font-size: 12px; margin-top: 5px;">{{ alarm.description }}</div>
          <div style="font-size: 11px; color: #888; margin-top: 5px;">
            状态: <span :style="{ color: alarm.status === 'pending' ? '#ff6600' : alarm.status === 'dispatched' ? '#00aaff' : '#00cc66' }">
              {{ getStatusName(alarm.status) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="panelType === 'route'">
      <div v-if="selectedAlarm" class="route-info">
        <h4>{{ getAlarmTypeName(selectedAlarm.type) }}</h4>
        <p><strong>报警位置:</strong> {{ selectedAlarm.location }}</p>
        <p><strong>描述:</strong> {{ selectedAlarm.description }}</p>
      </div>
      
      <div class="form-group" style="margin-top: 15px;">
        <label>选择救援单位</label>
        <select v-model="selectedUnit">
          <option value="">-- 选择单位 --</option>
          <option v-for="unit in rescueUnits" :key="unit.id" :value="unit.id">
            {{ unit.name }} ({{ unit.type }})
          </option>
        </select>
      </div>
      
      <div v-if="selectedUnit">
        <button class="btn btn-primary" @click="planRoute">规划路线</button>
        <button class="btn btn-success" @click="startNavigation">开始导航</button>
      </div>
      
      <div v-if="routeInfo" class="route-info" style="margin-top: 15px;">
        <h4>🗺️ 路线信息</h4>
        <p><strong>起点:</strong> {{ routeInfo.start }}</p>
        <p><strong>终点:</strong> {{ routeInfo.end }}</p>
        <p><strong>预计距离:</strong> {{ routeInfo.distance }}</p>
        <p><strong>预计时间:</strong> {{ routeInfo.duration }}</p>
        <p><strong>路线:</strong> {{ routeInfo.route }}</p>
      </div>
    </div>

    <div v-if="panelType === 'unitManagement'">
      <div class="form-group">
        <label>单位类型</label>
        <select v-model="unitForm.type">
          <option value="110">🚔 公安局</option>
          <option value="120">🚑 医院</option>
          <option value="119">🚒 消防队</option>
        </select>
      </div>
      <div class="form-group">
        <label>单位名称</label>
        <input type="text" v-model="unitForm.name" placeholder="请输入单位名称">
      </div>
      <div class="form-group">
        <label>位置 (点击地图选择)</label>
        <input type="text" v-model="unitForm.location" readonly placeholder="请点击地图选择位置">
      </div>
      <button class="btn btn-primary" @click="addRescueUnit">添加单位</button>
      
      <div style="margin-top: 20px;">
        <h4>已添加单位:</h4>
        <div v-for="unit in rescueUnits" :key="unit.id" class="alarm-item" style="cursor: pointer;">
          <div>{{ unit.name }} ({{ unit.type }})</div>
          <div style="font-size: 12px; color: #aaa;">{{ unit.location }}</div>
        </div>
      </div>
    </div>
  </div>

  <div class="panel" style="bottom: 10px; top: auto; right: 10px; width: 280px;">
    <h3>📊 系统状态</h3>
    <div class="route-info">
      <p>当前报警: {{ alarmRecords.length }} 条</p>
      <p>处理中: {{ alarmRecords.filter(a => a.status === 'dispatched').length }} 条</p>
      <p>已完成: {{ alarmRecords.filter(a => a.status === 'completed').length }} 条</p>
    </div>
    <div style="margin-top: 15px;">
      <button class="btn btn-primary" @click="switchPanel('disposal')">报警处置</button>
      <button class="btn btn-primary" @click="switchPanel('route')">路线规划</button>
      <button class="btn btn-primary" @click="switchPanel('unitManagement')">单位管理</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import * as Cesium from 'cesium'

const cesiumContainer = ref(null)
let viewer = null
let clickHandler = null
let alarmMarker = null
let unitMarkers = []
let routeLine = null

const showPanel = ref(false)
const panelType = ref('alarm')
const panelTitle = ref('')

const alarmForm = reactive({
  type: '110',
  location: '',
  description: '',
  longitude: null,
  latitude: null
})

const unitForm = reactive({
  type: '110',
  name: '',
  location: '',
  longitude: null,
  latitude: null
})

const alarmRecords = ref([])
const rescueUnits = ref([
  { id: 1, name: '市公安局指挥中心', type: '110', longitude: 116.397428, latitude: 39.90923, location: '北京市东城区' },
  { id: 2, name: '朝阳分局', type: '110', longitude: 116.437428, latitude: 39.91923, location: '北京市朝阳区' },
  { id: 3, name: '海淀分局', type: '110', longitude: 116.317428, latitude: 39.94923, location: '北京市海淀区' },
  { id: 4, name: '北京医院', type: '120', longitude: 116.427428, latitude: 39.92923, location: '北京市东城区' },
  { id: 5, name: '协和医院', type: '120', longitude: 116.407428, latitude: 39.93923, location: '北京市东城区' },
  { id: 6, name: '东城消防支队', type: '119', longitude: 116.417428, latitude: 39.89923, location: '北京市东城区' },
  { id: 7, name: '朝阳消防支队', type: '119', longitude: 116.447428, latitude: 39.90923, location: '北京市朝阳区' }
])

const selectedAlarm = ref(null)
const selectedUnit = ref('')
const routeInfo = ref(null)
const locationPickCallback = ref(null)

const getAlarmTypeName = (type) => {
  const types = { '110': '🚔 治安报警', '120': '🚑 医疗急救', '119': '🚒 火灾救援' }
  return types[type] || type
}

const getStatusName = (status) => {
  const statuses = { pending: '待处理', dispatched: '已派警', completed: '已完成' }
  return statuses[status] || status
}

const setAlarmType = (type) => {
  alarmForm.type = type
  showPanel.value = true
  panelType.value = 'alarm'
  panelTitle.value = '📝 ' + getAlarmTypeName(type)
  
  setupLocationPicker((lon, lat) => {
    alarmForm.longitude = lon
    alarmForm.latitude = lat
    alarmForm.location = `经度:${lon.toFixed(6)}, 纬度:${lat.toFixed(6)}`
  })
}

const setupLocationPicker = (callback) => {
  if (clickHandler) {
    clickHandler()
  }
  
  clickHandler = viewer.screenSpaceEventHandler.setInputAction((click) => {
    const ray = viewer.camera.getPickRay(click.position)
    const cartesian = viewer.scene.globe.pick(ray, viewer.scene)
    
    if (cartesian) {
      const cartographic = Cesium.Cartographic.fromCartesian(cartesian)
      const lon = Cesium.Math.toDegrees(cartographic.longitude)
      const lat = Cesium.Math.toDegrees(cartographic.latitude)
      
      callback(lon, lat)
      
      if (alarmMarker) {
        viewer.entities.remove(alarmMarker)
      }
      
      alarmMarker = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(lon, lat, 10),
        billboard: {
          image: createAlarmIcon(alarmForm.type),
          scale: 0.8,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM
        },
        label: {
          text: getAlarmTypeName(alarmForm.type),
          font: '14px Microsoft YaHei',
          fillColor: Cesium.Color.YELLOW,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.TOP,
          pixelOffset: new Cesium.Cartesian2(0, -30)
        }
      })
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
}

const createAlarmIcon = (type) => {
  const colors = { '110': '#ff6600', '120': '#ff0066', '119': '#ff0000' }
  const color = colors[type] || '#ff0000'
  
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(32, 32, 28, 0, Math.PI * 2)
  ctx.fill()
  
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.arc(32, 32, 24, 0, Math.PI * 2)
  ctx.stroke()
  
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 24px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(type, 32, 33)
  
  return canvas.toDataURL()
}

const submitAlarm = () => {
  if (!alarmForm.longitude || !alarmForm.description) {
    alert('请填写完整信息并选择位置')
    return
  }
  
  const alarm = {
    id: Date.now(),
    type: alarmForm.type,
    location: alarmForm.location,
    description: alarmForm.description,
    longitude: alarmForm.longitude,
    latitude: alarmForm.latitude,
    status: 'pending',
    time: new Date().toLocaleString()
  }
  
  alarmRecords.value.push(alarm)
  
  alarmForm.location = ''
  alarmForm.description = ''
  alarmForm.longitude = null
  alarmForm.latitude = null
  
  if (alarmMarker) {
    viewer.entities.remove(alarmMarker)
    alarmMarker = null
  }
  
  showPanel.value = false
  alert('报警提交成功！')
}

const clearAllAlarms = () => {
  if (alarmMarker) {
    viewer.entities.remove(alarmMarker)
    alarmMarker = null
  }
  
  unitMarkers.forEach(marker => viewer.entities.remove(marker))
  unitMarkers = []
  
  if (routeLine) {
    viewer.entities.remove(routeLine)
    routeLine = null
  }
  
  alarmRecords.value = []
  routeInfo.value = null
}

const showRescueUnits = () => {
  unitMarkers.forEach(marker => viewer.entities.remove(marker))
  unitMarkers = []
  
  rescueUnits.value.forEach(unit => {
    const marker = viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(unit.longitude, unit.latitude, 10),
      billboard: {
        image: createUnitIcon(unit.type),
        scale: 0.6,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM
      },
      label: {
        text: unit.name,
        font: '12px Microsoft YaHei',
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 1,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        verticalOrigin: Cesium.VerticalOrigin.TOP,
        pixelOffset: new Cesium.Cartesian2(0, -25),
        show: true
      }
    })
    unitMarkers.push(marker)
  })
  
  viewer.flyTo(unitMarkers)
}

const createUnitIcon = (type) => {
  const icons = {
    '110': { bg: '#ff6600', text: '🚔' },
    '120': { bg: '#ff0066', text: '🚑' },
    '119': { bg: '#ff0000', text: '🚒' }
  }
  const config = icons[type] || { bg: '#666666', text: '🏢' }
  
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  
  ctx.fillStyle = config.bg
  ctx.fillRect(8, 8, 48, 48)
  
  ctx.fillStyle = '#ffffff'
  ctx.font = '28px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(config.text, 32, 34)
  
  return canvas.toDataURL()
}

const switchPanel = (type) => {
  showPanel.value = true
  panelType.value = type
  panelTitle.value = {
    disposal: '📋 报警处置',
    route: '🗺️ 路线规划',
    unitManagement: '🏢 单位管理'
  }[type]
}

const selectAlarm = (alarm) => {
  selectedAlarm.value = alarm
  
  if (alarmMarker) {
    viewer.entities.remove(alarmMarker)
  }
  
  alarmMarker = viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(alarm.longitude, alarm.latitude, 10),
    billboard: {
      image: createAlarmIcon(alarm.type),
      scale: 0.8,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM
    }
  })
  
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(alarm.longitude, alarm.latitude, 500)
  })
}

const planRoute = () => {
  if (!selectedAlarm.value || !selectedUnit.value) {
    alert('请选择报警和救援单位')
    return
  }
  
  const unit = rescueUnits.value.find(u => u.id === selectedUnit.value)
  const alarm = selectedAlarm.value
  
  if (routeLine) {
    viewer.entities.remove(routeLine)
  }
  
  const startLon = unit.longitude
  const startLat = unit.latitude
  const endLon = alarm.longitude
  const endLat = alarm.latitude
  
  const distance = calculateDistance(startLat, startLon, endLat, endLon)
  const duration = Math.ceil(distance / 500)
  
  const routePoints = generateRoutePoints(startLon, startLat, endLon, endLat)
  
  routeLine = viewer.entities.add({
    polyline: {
      positions: Cesium.Cartesian3.fromDegreesArray(routePoints),
      width: 5,
      material: new Cesium.PolylineGlowMaterialProperty({
        glowPower: 0.2,
        color: Cesium.Color.YELLOW
      }),
      clampToGround: true
    }
  })
  
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(startLon, startLat, 10),
    billboard: {
      image: createStartIcon(),
      scale: 0.5,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM
    },
    label: {
      text: '起点: ' + unit.name,
      font: '12px Microsoft YaHei',
      fillColor: Cesium.Color.LIME,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 1,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      verticalOrigin: Cesium.VerticalOrigin.TOP,
      pixelOffset: new Cesium.Cartesian2(0, -25)
    }
  })
  
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(endLon, endLat, 10),
    billboard: {
      image: createEndIcon(),
      scale: 0.5,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM
    },
    label: {
      text: '终点: 报警位置',
      font: '12px Microsoft YaHei',
      fillColor: Cesium.Color.RED,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 1,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      verticalOrigin: Cesium.VerticalOrigin.TOP,
      pixelOffset: new Cesium.Cartesian2(0, -25)
    }
  })
  
  const unitName = unit.type === '110' ? '公安局' : unit.type === '120' ? '医院' : '消防队'
  
  routeInfo.value = {
    start: unit.name + ' (' + unitName + ')',
    end: '报警位置',
    distance: distance.toFixed(2) + ' 公里',
    duration: duration + ' 分钟',
    route: generateRouteDescription(startLon, startLat, endLon, endLat)
  }
  
  viewer.flyTo(routeLine)
}

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

const generateRoutePoints = (startLon, startLat, endLon, endLat) => {
  const points = []
  const steps = 20
  
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const lon = startLon + (endLon - startLon) * t
    const lat = startLat + (endLat - startLat) * t
    
    const offset = Math.sin(t * Math.PI) * 0.002
    const finalLon = lon + offset
    const finalLat = lat - offset * 0.5
    
    points.push(finalLon, finalLat)
  }
  
  return points
}

const generateRouteDescription = (startLon, startLat, endLon, endLat) => {
  const directions = []
  
  if (endLon > startLon) directions.push('向东')
  else if (endLon < startLon) directions.push('向西')
  
  if (endLat > startLat) directions.push('向北')
  else if (endLat < startLat) directions.push('向南')
  
  return directions.join('') + '方向行驶约' + calculateDistance(startLat, startLon, endLat, endLon).toFixed(1) + '公里'
}

const createStartIcon = () => {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  
  ctx.fillStyle = '#00ff00'
  ctx.beginPath()
  ctx.moveTo(32, 8)
  ctx.lineTo(56, 56)
  ctx.lineTo(8, 56)
  ctx.closePath()
  ctx.fill()
  
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 20px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('S', 32, 38)
  
  return canvas.toDataURL()
}

const createEndIcon = () => {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  
  ctx.fillStyle = '#ff0000'
  ctx.beginPath()
  ctx.arc(32, 32, 28, 0, Math.PI * 2)
  ctx.fill()
  
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 20px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('E', 32, 34)
  
  return canvas.toDataURL()
}

const startNavigation = () => {
  if (!routeLine) {
    alert('请先规划路线')
    return
  }
  
  alert('🚗 导航已开始！\n\n请按照以下路线行驶：\n' + routeInfo.value.route + '\n\n预计到达时间：' + routeInfo.value.duration)
}

const addRescueUnit = () => {
  if (!unitForm.name || !unitForm.longitude) {
    alert('请填写单位名称并选择位置')
    return
  }
  
  const unit = {
    id: Date.now(),
    type: unitForm.type,
    name: unitForm.name,
    longitude: unitForm.longitude,
    latitude: unitForm.latitude,
    location: `经度:${unitForm.longitude.toFixed(6)}, 纬度:${unitForm.latitude.toFixed(6)}`
  }
  
  rescueUnits.value.push(unit)
  
  unitForm.name = ''
  unitForm.location = ''
  unitForm.longitude = null
  unitForm.latitude = null
  
  alert('单位添加成功！')
  showRescueUnits()
}

onMounted(async () => {
  Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYWE1OWUxNy1mMWZiLTQzYjYtYTQ0OS1kMWFjYmFkNjc5YzciLCJpZCI6NTc2ODksImlhdCI6MTYyMTg1NzgxOX0.XcKpgANiY19MC4bdFUXMVEBToBmqS8kuYpUlxJHYZxk'
  
  viewer = new Cesium.Viewer(cesiumContainer.value, {
    terrainProvider: await Cesium.createWorldTerrainAsync(),
    imageryProvider: new Cesium.BingMapsImageryProvider({
      url: 'https://dev.virtualearth.net',
      key: 'Ar6mHpu0T-vvZ6Y5R2oZ8FVmP6ZP0gG-nBjMMw1vP8a8Qzj1kXQPbKvS8hLvCqK'
    }),
    baseLayerPicker: false,
    geocoder: false,
    timeline: false,
    animation: false,
    sceneModePicker: false,
    navigationHelpButton: false
  })
  
  viewer.scene.globe.enableLighting = false
  viewer.scene.fog.enabled = true
  viewer.scene.fog.density = 0.0001
  
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(116.397428, 39.90923, 2000),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-45),
      roll: 0
    }
  })
  
  try {
    const tileset = await Cesium.Cesium3DTileset.fromIonAssetId(43978)
    viewer.scene.primitives.add(tileset)
    
    tileset.style = new Cesium.Cesium3DTileStyle({
      show: true
    })
    
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(116.397428, 39.90923, 500),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-45),
        roll: 0
      },
      duration: 3
    })
  } catch (error) {
    console.log('3Dtiles加载失败，将使用默认地形显示')
  }
  
  showRescueUnits()
})
</script>