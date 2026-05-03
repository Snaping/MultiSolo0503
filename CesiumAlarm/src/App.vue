<template>
  <div id="cesiumContainer" ref="cesiumContainer"></div>
  
  <!-- 加载状态提示 -->
  <div class="loading-overlay" v-if="loading">
    <div class="loading-spinner"></div>
    <div class="loading-text">{{ loadingText }}</div>
  </div>
  
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
      
      <div class="form-group">
        <label>路线模式</label>
        <select v-model="routeMode">
          <option value="driving">🚗 驾车</option>
          <option value="walking">🚶 步行</option>
        </select>
      </div>
      
      <div v-if="selectedUnit">
        <button class="btn btn-primary" @click="planRoute" :disabled="isPlanning">
          {{ isPlanning ? '⏳ 规划中...' : '🧭 规划路线' }}
        </button>
        <button v-if="hasRoute" class="btn btn-success" @click="startNavigation">
          🚀 开始导航
        </button>
        <button v-if="isNavigating" class="btn" @click="stopNavigation">
          ⏹ 停止导航
        </button>
      </div>
      
      <div v-if="routeInfo" class="route-info" style="margin-top: 15px;">
        <h4>🗺️ 路线信息</h4>
        <p><strong>起点:</strong> {{ routeInfo.start }}</p>
        <p><strong>终点:</strong> {{ routeInfo.end }}</p>
        <p><strong>距离:</strong> {{ routeInfo.distance }}</p>
        <p><strong>预计时间:</strong> {{ routeInfo.duration }}</p>
        <p><strong>转弯次数:</strong> {{ routeInfo.turns }}</p>
        
        <div v-if="routeInfo.steps" style="margin-top: 10px; max-height: 200px; overflow-y: auto;">
          <h5>📝 导航步骤:</h5>
          <div v-for="(step, index) in routeInfo.steps" :key="index" 
               style="padding: 8px; margin: 5px 0; background: rgba(0,100,150,0.3); border-radius: 4px;">
            <div style="display: flex; justify-content: space-between;">
              <span>{{ index + 1 }}. {{ step.instruction }}</span>
              <span style="color: #00ffff; font-size: 12px;">{{ step.distance }}</span>
            </div>
          </div>
        </div>
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

  <!-- 导航控制面板 -->
  <div class="navigation-panel" v-if="isNavigating">
    <div class="nav-header">
      <h3>🚀 导航中</h3>
      <button class="btn" style="padding: 4px 8px; font-size: 12px;" @click="stopNavigation">关闭</button>
    </div>
    <div class="nav-progress">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: navProgress + '%' }"></div>
      </div>
      <div style="margin-top: 8px; text-align: center;">
        <span style="color: #00ffff;">{{ navProgress.toFixed(0) }}%</span>
      </div>
    </div>
    <div class="nav-info">
      <p><strong>当前:</strong> {{ currentInstruction }}</p>
      <p><strong>剩余:</strong> {{ remainingDistance }} / {{ remainingTime }}</p>
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
let navEntity = null
let navInterval = null

const loading = ref(true)
const loadingText = ref('正在初始化地图...')
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
  { id: 2, name: '朝阳分局', type: '110', longitude: 116.457428, latitude: 39.92923, location: '北京市朝阳区' },
  { id: 3, name: '海淀分局', type: '110', longitude: 116.317428, latitude: 39.95923, location: '北京市海淀区' },
  { id: 4, name: '北京医院', type: '120', longitude: 116.427428, latitude: 39.92923, location: '北京市东城区' },
  { id: 5, name: '协和医院', type: '120', longitude: 116.407428, latitude: 39.93923, location: '北京市东城区' },
  { id: 6, name: '东城消防支队', type: '119', longitude: 116.417428, latitude: 39.88923, location: '北京市东城区' },
  { id: 7, name: '朝阳消防支队', type: '119', longitude: 116.447428, latitude: 39.91923, location: '北京市朝阳区' }
])

const selectedAlarm = ref(null)
const selectedUnit = ref('')
const routeInfo = ref(null)
const routeMode = ref('driving')
const isPlanning = ref(false)
const hasRoute = ref(false)
const isNavigating = ref(false)
const navProgress = ref(0)
const currentInstruction = ref('准备出发...')
const remainingDistance = ref('0 km')
const remainingTime = ref('0 分钟')
let routePath = []

// 街道网络节点
const streetNetwork = reactive({
  nodes: [],
  edges: []
})

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
  
  if (navEntity) {
    viewer.entities.remove(navEntity)
    navEntity = null
  }
  
  if (navInterval) {
    clearInterval(navInterval)
    navInterval = null
  }
  
  alarmRecords.value = []
  routeInfo.value = null
  hasRoute.value = false
  isNavigating.value = false
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
  
  if (type === 'unitManagement') {
    setupLocationPicker((lon, lat) => {
      unitForm.longitude = lon
      unitForm.latitude = lat
      unitForm.location = `经度:${lon.toFixed(6)}, 纬度:${lat.toFixed(6)}`
    })
  }
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

// 初始化街道网络
const initStreetNetwork = () => {
  const centerLon = 116.397428
  const centerLat = 39.90923
  
  // 创建网格状街道节点
  const gridSize = 8
  const cellSize = 0.005
  
  streetNetwork.nodes = []
  for (let i = -gridSize; i <= gridSize; i++) {
    for (let j = -gridSize; j <= gridSize; j++) {
      streetNetwork.nodes.push({
        id: `${i},${j}`,
        lon: centerLon + i * cellSize,
        lat: centerLat + j * cellSize
      })
    }
  }
  
  // 创建街道边（连接相邻节点）
  streetNetwork.edges = []
  for (let i = -gridSize; i <= gridSize; i++) {
    for (let j = -gridSize; j <= gridSize; j++) {
      if (i < gridSize) {
        streetNetwork.edges.push({
          from: `${i},${j}`,
          to: `${i+1},${j}`,
          type: Math.random() > 0.3 ? 'main' : 'secondary'
        })
      }
      if (j < gridSize) {
        streetNetwork.edges.push({
          from: `${i},${j}`,
          to: `${i},${j+1}`,
          type: Math.random() > 0.3 ? 'main' : 'secondary'
        })
      }
      // 添加一些对角线街道
      if (i < gridSize && j < gridSize && Math.random() > 0.7) {
        streetNetwork.edges.push({
          from: `${i},${j}`,
          to: `${i+1},${j+1}`,
          type: 'secondary'
        })
      }
    }
  }
  
  // 绘制街道
  drawStreets()
}

// 绘制街道
const drawStreets = () => {
  const streetPositions = []
  streetNetwork.edges.forEach(edge => {
    const fromNode = streetNetwork.nodes.find(n => n.id === edge.from)
    const toNode = streetNetwork.nodes.find(n => n.id === edge.to)
    if (fromNode && toNode) {
      streetPositions.push(Cesium.Cartesian3.fromDegrees(fromNode.lon, fromNode.lat, 1))
      streetPositions.push(Cesium.Cartesian3.fromDegrees(toNode.lon, toNode.lat, 1))
    }
  })
  
  viewer.entities.add({
    polyline: {
      positions: streetPositions,
      width: 2,
      material: Cesium.Color.fromCssColorString('#334455').withAlpha(0.5)
    }
  })
}

// A* 寻路算法
const findPath = (startLon, startLat, endLon, endLat) => {
  // 找到最近的节点
  const findNearestNode = (lon, lat) => {
    let nearest = null
    let minDist = Infinity
    streetNetwork.nodes.forEach(node => {
      const dist = Math.hypot(node.lon - lon, node.lat - lat)
      if (dist < minDist) {
        minDist = dist
        nearest = node
      }
    })
    return nearest
  }
  
  const startNode = findNearestNode(startLon, startLat)
  const endNode = findNearestNode(endLon, endLat)
  
  if (!startNode || !endNode) return null
  
  // 构建邻接表
  const neighbors = {}
  streetNetwork.nodes.forEach(node => {
    neighbors[node.id] = []
  })
  streetNetwork.edges.forEach(edge => {
    const speed = edge.type === 'main' ? 60 : 40
    neighbors[edge.from].push({ id: edge.to, speed })
    neighbors[edge.to].push({ id: edge.from, speed })
  })
  
  // A*算法
  const openSet = [startNode.id]
  const cameFrom = {}
  const gScore = {}
  const fScore = {}
  
  const heuristic = (a, b) => {
    const nodeA = streetNetwork.nodes.find(n => n.id === a)
    const nodeB = streetNetwork.nodes.find(n => n.id === b)
    return Math.hypot(nodeA.lon - nodeB.lon, nodeA.lat - nodeB.lat) * 100
  }
  
  streetNetwork.nodes.forEach(node => {
    gScore[node.id] = Infinity
    fScore[node.id] = Infinity
  })
  gScore[startNode.id] = 0
  fScore[startNode.id] = heuristic(startNode.id, endNode.id)
  
  while (openSet.length > 0) {
    let current = openSet[0]
    for (let i = 1; i < openSet.length; i++) {
      if (fScore[openSet[i]] < fScore[current]) {
        current = openSet[i]
      }
    }
    
    if (current === endNode.id) {
      const path = []
      let curr = current
      while (curr in cameFrom) {
        const node = streetNetwork.nodes.find(n => n.id === curr)
        path.unshift({ lon: node.lon, lat: node.lat })
        curr = cameFrom[curr]
      }
      const firstNode = streetNetwork.nodes.find(n => n.id === startNode.id)
      path.unshift({ lon: firstNode.lon, lat: firstNode.lat })
      
      // 添加起点和终点
      path.unshift({ lon: startLon, lat: startLat })
      path.push({ lon: endLon, lat: endLat })
      return path
    }
    
    openSet.splice(openSet.indexOf(current), 1)
    
    neighbors[current].forEach(neighbor => {
      const tentativeGScore = gScore[current] + (heuristic(current, neighbor.id) / neighbor.speed)
      if (tentativeGScore < gScore[neighbor.id]) {
        cameFrom[neighbor.id] = current
        gScore[neighbor.id] = tentativeGScore
        fScore[neighbor.id] = gScore[neighbor.id] + heuristic(neighbor.id, endNode.id)
        if (!openSet.includes(neighbor.id)) {
          openSet.push(neighbor.id)
        }
      }
    })
  }
  
  return null
}

// 规划路线
const planRoute = async () => {
  if (!selectedAlarm.value || !selectedUnit.value) {
    alert('请选择报警和救援单位')
    return
  }
  
  isPlanning.value = true
  
  const unit = rescueUnits.value.find(u => u.id === selectedUnit.value)
  const alarm = selectedAlarm.value
  
  if (routeLine) {
    viewer.entities.remove(routeLine)
    routeLine = null
  }
  
  // 清除之前的起点终点标记
  viewer.entities.entities.forEach(entity => {
    if (entity.label && (entity.label.text.includes('起点') || entity.label.text.includes('终点'))) {
      viewer.entities.remove(entity)
    }
  })
  
  // 使用A*算法规划路线
  routePath = findPath(unit.longitude, unit.latitude, alarm.longitude, alarm.latitude)
  
  if (!routePath || routePath.length === 0) {
    alert('无法找到路线')
    isPlanning.value = false
    return
  }
  
  // 计算总距离和时间
  let totalDistance = 0
  const avgSpeed = routeMode.value === 'driving' ? 50 : 6
  
  for (let i = 0; i < routePath.length - 1; i++) {
    const dist = calculateDistance(
      routePath[i].lat, routePath[i].lon,
      routePath[i+1].lat, routePath[i+1].lon
    )
    totalDistance += dist
  }
  
  const totalTime = Math.ceil(totalDistance / avgSpeed * 60)
  
  // 生成导航步骤
  const steps = []
  for (let i = 0; i < routePath.length - 1; i++) {
    const dist = calculateDistance(
      routePath[i].lat, routePath[i].lon,
      routePath[i+1].lat, routePath[i+1].lon
    )
    
    let instruction = ''
    if (i === 0) {
      instruction = `从 ${unit.name} 出发，沿当前道路行驶`
    } else if (i === routePath.length - 2) {
      instruction = '到达目的地'
    } else {
      const dx = routePath[i+1].lon - routePath[i].lon
      const dy = routePath[i+1].lat - routePath[i].lat
      const prevDx = routePath[i].lon - routePath[i-1].lon
      const prevDy = routePath[i].lat - routePath[i-1].lat
      
      const cross = prevDx * dy - prevDy * dx
      const dot = prevDx * dx + prevDy * dy
      
      if (cross > 0.0001) {
        instruction = '左转'
      } else if (cross < -0.0001) {
        instruction = '右转'
      } else {
        instruction = '直行'
      }
    }
    
    steps.push({
      instruction,
      distance: `${(dist * 1000).toFixed(0)} 米`
    })
  }
  
  // 绘制路线
  const positions = routePath.map(p => Cesium.Cartesian3.fromDegrees(p.lon, p.lat, 5))
  
  routeLine = viewer.entities.add({
    polyline: {
      positions,
      width: 8,
      material: new Cesium.PolylineGlowMaterialProperty({
        glowPower: 0.3,
        color: Cesium.Color.CYAN
      })
    }
  })
  
  // 起点终点标记
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(unit.longitude, unit.latitude, 20),
    billboard: {
      image: createStartIcon(),
      scale: 0.6,
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
      pixelOffset: new Cesium.Cartesian2(0, -30)
    }
  })
  
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(alarm.longitude, alarm.latitude, 20),
    billboard: {
      image: createEndIcon(),
      scale: 0.6,
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
      pixelOffset: new Cesium.Cartesian2(0, -30)
    }
  })
  
  const unitName = unit.type === '110' ? '公安局' : unit.type === '120' ? '医院' : '消防队'
  
  routeInfo.value = {
    start: unit.name + ' (' + unitName + ')',
    end: '报警位置',
    distance: totalDistance.toFixed(2) + ' 公里',
    duration: totalTime + ' 分钟',
    turns: steps.filter(s => s.instruction === '左转' || s.instruction === '右转').length,
    steps
  }
  
  hasRoute.value = true
  isPlanning.value = false
  
  viewer.flyTo(routeLine, { offset: new Cesium.HeadingPitchRange(0, -0.8, 1500) })
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

// 开始导航
const startNavigation = () => {
  if (!hasRoute.value || routePath.length === 0) {
    alert('请先规划路线')
    return
  }
  
  isNavigating.value = true
  navProgress.value = 0
  
  // 创建导航实体（车辆图标）
  const startPos = Cesium.Cartesian3.fromDegrees(routePath[0].lon, routePath[0].lat, 30)
  
  navEntity = viewer.entities.add({
    position: startPos,
    model: {
      uri: 'data:@base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect fill="#00ffff" width="60" height="30" x="2" y="17" rx="5"/><rect fill="#0088aa" width="30" height="20" x="17" y="7" rx="3"/><circle fill="#333" cx="15" cy="42" r="6"/><circle fill="#333" cx="49" cy="42" r="6"/><circle fill="#333" cx="15" cy="22" r="6"/><circle fill="#333" cx="49" cy="22" r="6"/></svg>'),
      scale: 8,
      minimumPixelSize: 32
    },
    label: {
      text: '🚗 救援车辆',
      font: '14px Microsoft YaHei',
      fillColor: Cesium.Color.AQUA,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, 40)
    }
  })
  
  // 计算总距离
  let totalDistance = 0
  for (let i = 0; i < routePath.length - 1; i++) {
    totalDistance += calculateDistance(
      routePath[i].lat, routePath[i].lon,
      routePath[i+1].lat, routePath[i+1].lon
    )
  }
  
  let currentIndex = 0
  let segmentProgress = 0
  const speed = 0.02 // 移动速度
  
  navInterval = setInterval(() => {
    if (currentIndex >= routePath.length - 1) {
      stopNavigation()
      alert('🎉 到达目的地！')
      return
    }
    
    segmentProgress += speed
    
    if (segmentProgress >= 1) {
      segmentProgress = 0
      currentIndex++
      
      // 更新导航指令
      if (routeInfo.value && routeInfo.value.steps && currentIndex < routeInfo.value.steps.length) {
        currentInstruction.value = routeInfo.value.steps[currentIndex].instruction
      }
    }
    
    // 计算当前位置
    const t = segmentProgress
    const from = routePath[currentIndex]
    const to = routePath[currentIndex + 1]
    const currentLon = from.lon + (to.lon - from.lon) * t
    const currentLat = from.lat + (to.lat - from.lat) * t
    
    // 更新位置
    navEntity.position = Cesium.Cartesian3.fromDegrees(currentLon, currentLat, 30)
    
    // 计算航向
    const heading = Math.atan2(to.lon - from.lon, to.lat - from.lat)
    navEntity.model = {
      ...navEntity.model,
      orientation: Cesium.Transforms.headingPitchRollQuaternion(
        Cesium.Cartesian3.fromDegrees(currentLon, currentLat, 30),
        new Cesium.HeadingPitchRoll(heading, 0, 0)
      )
    }
    
    // 更新进度
    let traveledDistance = 0
    for (let i = 0; i < currentIndex; i++) {
      traveledDistance += calculateDistance(
        routePath[i].lat, routePath[i].lon,
        routePath[i+1].lat, routePath[i+1].lon
      )
    }
    traveledDistance += calculateDistance(
      from.lat, from.lon, to.lat, to.lon
    ) * t
    
    navProgress.value = (traveledDistance / totalDistance) * 100
    
    const remainDist = totalDistance - traveledDistance
    const avgSpeed = routeMode.value === 'driving' ? 50 : 6
    const remainTime = Math.ceil(remainDist / avgSpeed * 60)
    
    remainingDistance.value = remainDist.toFixed(2) + ' 公里'
    remainingTime.value = remainTime + ' 分钟'
    
    // 更新相机跟踪
    viewer.camera.lookAt(
      Cesium.Cartesian3.fromDegrees(currentLon, currentLat),
      new Cesium.HeadingPitchRange(heading + Math.PI/2, -0.5, 300)
    )
    
  }, 50)
  
  currentInstruction.value = '开始出发...'
}

// 停止导航
const stopNavigation = () => {
  isNavigating.value = false
  if (navInterval) {
    clearInterval(navInterval)
    navInterval = null
  }
  if (navEntity) {
    viewer.entities.remove(navEntity)
    navEntity = null
  }
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
  loadingText.value = '正在初始化地图...'
  
  viewer = new Cesium.Viewer(cesiumContainer.value, {
    baseLayerPicker: false,
    geocoder: false,
    timeline: false,
    animation: false,
    sceneModePicker: false,
    navigationHelpButton: false,
    infoBox: false,
    selectionIndicator: false,
    shadows: false,
    shouldAnimate: true
  })
  
  viewer.cesiumWidget.creditContainer.style.display = 'none'
  
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
  
  loadingText.value = '正在生成城市街道网络...'
  initStreetNetwork()
  
  loadingText.value = '正在生成城市建筑...'
  addMockBuildings()
  
  loadingText.value = '正在初始化救援单位...'
  showRescueUnits()
  
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(116.397428, 39.90923, 800),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-45),
      roll: 0
    },
    duration: 2
  })
  
  setTimeout(() => {
    loading.value = false
  }, 1000)
})

// 添加模拟建筑
const addMockBuildings = () => {
  const centerLon = 116.397428
  const centerLat = 39.90923
  
  for (let i = 0; i < 150; i++) {
    const angle = (i / 150) * Math.PI * 2
    const radius = 0.002 + Math.random() * 0.01
    const lon = centerLon + Math.cos(angle) * radius
    const lat = centerLat + Math.sin(angle) * radius
    const height = 15 + Math.random() * 180
    const width = 15 + Math.random() * 50
    
    viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(lon, lat, height / 2),
      box: {
        dimensions: new Cesium.Cartesian3(width, width, height),
        material: Cesium.Color.fromRandom({
          red: 0.6,
          green: 0.6,
          blue: 0.75,
          alpha: 0.9
        }),
        outline: true,
        outlineColor: Cesium.Color.BLACK
      }
    })
  }
  
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(centerLon, centerLat, 180),
    box: {
      dimensions: new Cesium.Cartesian3(90, 90, 360),
      material: Cesium.Color.GOLD.withAlpha(0.85),
      outline: true,
      outlineColor: Cesium.Color.BLACK
    }
  })
  
  console.log('✅ 模拟建筑添加完成')
}
</script>
