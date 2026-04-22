interface GeoJSONFeature {
  type: 'Feature'
  geometry: {
    type: 'LineString'
    coordinates: [number, number][]
  }
  properties: {
    id: number
    timestamp: string
  }
}

class FreehandDraw {
  map: mapboxgl.Map
  isDrawing: boolean
  isDrawMode: boolean
  points: [number, number][]
  allPaths: GeoJSONFeature[]
  canvas: HTMLCanvasElement | null
  ctx: CanvasRenderingContext2D | null
  lineColor: string
  lineWidth: number

  // 事件处理函数缓存
  private _onMouseDown: (e: MouseEvent) => void
  private _onMouseMove: (e: MouseEvent) => void
  private _onMouseUp: () => void
  private _onTouchStart: (e: TouchEvent) => void
  private _onTouchMove: (e: TouchEvent) => void
  private _onTouchEnd: () => void
  private _onResize: () => void

  // 节流控制
  private _lastDrawTime = 0
  private _drawThrottle = 16

  constructor(map: mapboxgl.Map) {
    this.map = map
    this.isDrawing = false
    this.isDrawMode = false
    this.points = []
    this.allPaths = []
    this.canvas = null
    this.ctx = null
    this.lineColor = '#000000'
    this.lineWidth = 3

    // 缓存事件处理函数
    this._onMouseDown = this.onMouseDown.bind(this)
    this._onMouseMove = this.onMouseMove.bind(this)
    this._onMouseUp = this.onMouseUp.bind(this)
    this._onTouchStart = this.onTouchStart.bind(this)
    this._onTouchMove = this.onTouchMove.bind(this)
    this._onTouchEnd = this.onTouchEnd.bind(this)
    this._onResize = this.resizeCanvas.bind(this)

    this.initCanvas()
    this.bindEvents()
  }

  // 初始化Canvas图层
  initCanvas() {
    this.canvas = document.createElement('canvas')
    this.canvas.style.position = 'absolute'
    this.canvas.style.top = '0'
    this.canvas.style.left = '0'
    this.canvas.style.width = '100%'
    this.canvas.style.height = '100%'
    this.canvas.style.pointerEvents = 'none'
    this.ctx = this.canvas.getContext('2d', { alpha: true })

    const container = this.map.getCanvasContainer()
    container.appendChild(this.canvas)

    this.resizeCanvas()
  }

  // 调整canvas尺寸以匹配地图
  resizeCanvas() {
    if (!this.canvas) return
    const container = this.map.getCanvasContainer()
    const rect = container.getBoundingClientRect()

    this.canvas.width = rect.width
    this.canvas.height = rect.height
    this.canvas.style.width = `${rect.width}px`
    this.canvas.style.height = `${rect.height}px`

    this.redrawAll()
  }

  // 绑定鼠标事件到地图容器
  bindEvents() {
    const container = this.map.getCanvasContainer()

    container.addEventListener('mousedown', this._onMouseDown)
    window.addEventListener('mousemove', this._onMouseMove)
    window.addEventListener('mouseup', this._onMouseUp)

    // 触摸屏支持
    container.addEventListener('touchstart', this._onTouchStart, { passive: false })
    window.addEventListener('touchmove', this._onTouchMove, { passive: false })
    window.addEventListener('touchend', this._onTouchEnd)

    // 监听地图变化更新canvas尺寸
    this.map.on('render', this._onResize)
  }

  onMouseDown(e: MouseEvent) {
    if (!this.isDrawing) return
    if (!this.isDrawMode) return
    e.preventDefault()
    this.startDrawing(e.clientX, e.clientY)
  }

  onTouchStart(e: TouchEvent) {
    if (!this.isDrawing) return
    if (!this.isDrawMode) return
    e.preventDefault()
    const touch = e.touches[0]
    this.startDrawing(touch.clientX, touch.clientY)
  }

  startDrawing(clientX: number, clientY: number) {
    this.points = []
    const mapPoint = this.getMapCoordinates(clientX, clientY)
    this.points.push([mapPoint.lng, mapPoint.lat])
    this.drawCurrentLine()
  }

  onMouseMove(e: MouseEvent) {
    if (!this.isDrawMode || !this.isDrawing) return
    if (!this.isDrawing || this.points.length === 0) return
    e.preventDefault()
    this.addPoint(e.clientX, e.clientY)
  }

  onTouchMove(e: TouchEvent) {
    if (!this.isDrawMode || !this.isDrawing) return
    if (!this.isDrawing || this.points.length === 0) return
    e.preventDefault()
    const touch = e.touches[0]
    this.addPoint(touch.clientX, touch.clientY)
  }

  addPoint(clientX: number, clientY: number) {
    const lastPoint = this.points[this.points.length - 1]
    const mapPoint = this.getMapCoordinates(clientX, clientY)
    const lng = mapPoint.lng
    const lat = mapPoint.lat

    if (lastPoint) {
      const dx = lng - lastPoint[0]
      const dy = lat - lastPoint[1]
      if (dx * dx + dy * dy < 0.000001) return
    }

    this.points.push([lng, lat])
    this.throttledDraw()
  }

  private throttledDraw() {
    const now = performance.now()
    if (now - this._lastDrawTime < this._drawThrottle) return
    this._lastDrawTime = now
    this.drawCurrentLine()
  }

  onMouseUp() {
    if (!this.isDrawMode || !this.isDrawing) return
    if (!this.isDrawing || this.points.length < 2) {
      this.points = []
      this.redrawAll()
      return
    }
    this.finishDrawing()
  }

  onTouchEnd() {
    if (!this.isDrawMode || !this.isDrawing) return
    if (!this.isDrawing || this.points.length < 2) {
      this.points = []
      this.redrawAll()
      return
    }
    this.finishDrawing()
  }

  // 完成当前绘制，保存到地图
  finishDrawing() {
    if (this.points.length >= 2) {
      const smoothedPoints = this.smoothPoints(this.points)

      const geojson: GeoJSONFeature = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: smoothedPoints,
        },
        properties: {
          id: Date.now(),
          timestamp: new Date().toISOString(),
        },
      }

      this.allPaths.push(geojson)
      this.addToMap(geojson)
    }

    this.points = []
    this.redrawAll()
  }

  // 平滑轨迹点（使用Catmull-Rom插值）
  smoothPoints(points: [number, number][], stepSize = 0.2): [number, number][] {
    if (points.length < 3) return points

    const smoothed: [number, number][] = []

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)]
      const p1 = points[i]
      const p2 = points[Math.min(points.length - 1, i + 1)]
      const p3 = points[Math.min(points.length - 1, i + 2)]

      for (let t = 0; t <= 1; t += stepSize) {
        const x = this.catmullRom(p0[0], p1[0], p2[0], p3[0], t)
        const y = this.catmullRom(p0[1], p1[1], p2[1], p3[1], t)
        smoothed.push([x, y])
      }
    }

    smoothed.push(points[points.length - 1])

    return smoothed
  }

  private catmullRom(p0: number, p1: number, p2: number, p3: number, t: number): number {
    const t2 = t * t
    const t3 = t2 * t
    return (
      0.5 *
      (2 * p1 +
        (-p0 + p2) * t +
        (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
        (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
    )
  }

  // 获取屏幕坐标对应的地图经纬度
  private getMapCoordinates(clientX: number, clientY: number) {
    const rect = this.map.getCanvasContainer().getBoundingClientRect()
    const point = new (
      window as unknown as { mapboxgl: typeof import('mapbox-gl').default }
    ).mapboxgl.Point(clientX - rect.left, clientY - rect.top)
    return this.map.unproject(point)
  }

  // 绘制当前正在画的线
  drawCurrentLine() {
    this.redrawAll()

    if (this.points.length < 2 || !this.ctx) return

    const mapPoints = this.points.map((p) => this.map.project(p))

    this.ctx.beginPath()
    this.ctx.strokeStyle = this.lineColor
    this.ctx.lineWidth = this.lineWidth
    this.ctx.lineCap = 'round'
    this.ctx.lineJoin = 'round'

    this.ctx.moveTo(mapPoints[0].x, mapPoints[0].y)
    for (let i = 1; i < mapPoints.length; i++) {
      this.ctx.lineTo(mapPoints[i].x, mapPoints[i].y)
    }
    this.ctx.stroke()

    this.ctx.fillStyle = this.lineColor
    for (const point of mapPoints) {
      this.ctx.beginPath()
      this.ctx.arc(point.x, point.y, this.lineWidth / 2, 0, Math.PI * 2)
      this.ctx.fill()
    }
  }

  // 重新绘制所有已保存的轨迹
  redrawAll() {
    if (!this.ctx || !this.canvas) return

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    if (this.allPaths.length === 0) return

    this.ctx.beginPath()
    this.ctx.strokeStyle = this.lineColor
    this.ctx.lineWidth = this.lineWidth
    this.ctx.lineCap = 'round'
    this.ctx.lineJoin = 'round'

    for (const feature of this.allPaths) {
      const coordinates = feature.geometry.coordinates
      if (coordinates.length < 2) continue

      const screenPoints = coordinates.map((coord) => this.map.project(coord))

      this.ctx.moveTo(screenPoints[0].x, screenPoints[0].y)
      for (let i = 1; i < screenPoints.length; i++) {
        this.ctx.lineTo(screenPoints[i].x, screenPoints[i].y)
      }
    }
    this.ctx.stroke()
  }

  // 将轨迹添加到Mapbox地图源中（可选，用于保存和导出）
  addToMap(geojson: GeoJSONFeature) {
    const sourceId = `line-${geojson.properties.id}`
    const layerId = `line-layer-${geojson.properties.id}`

    this.map.addSource(sourceId, {
      type: 'geojson',
      data: geojson,
    })

    this.map.addLayer({
      id: layerId,
      type: 'line',
      source: sourceId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': this.lineColor,
        'line-width': this.lineWidth,
        'line-opacity': 0.8,
      },
    })
  }

  // 开始绘制模式
  enable() {
    if (this.isDrawMode) return
    this.isDrawMode = true
    this.isDrawing = true
    const container = this.map.getCanvasContainer()
    container.style.cursor = 'crosshair'
    if (this.canvas) this.canvas.style.pointerEvents = 'auto'
  }

  // 结束绘制模式
  disable() {
    if (!this.isDrawMode) return
    this.isDrawing = false
    this.isDrawMode = false
    const container = this.map.getCanvasContainer()
    container.style.cursor = ''
    if (this.canvas) this.canvas.style.pointerEvents = 'none'
  }

  // 清除所有绘制的轨迹
  clear() {
    for (const feature of this.allPaths) {
      const sourceId = `line-${feature.properties.id}`
      const layerId = `line-layer-${feature.properties.id}`
      if (this.map.getLayer(layerId)) this.map.removeLayer(layerId)
      if (this.map.getSource(sourceId)) this.map.removeSource(sourceId)
    }

    this.allPaths = []
    this.points = []
    this.redrawAll()
  }

  // 获取所有轨迹数据（GeoJSON格式）
  getAllData() {
    return {
      type: 'FeatureCollection',
      features: this.allPaths,
    }
  }

  // 销毁实例，清理所有事件监听和DOM元素
  destroy() {
    this.disable()
    this.clear()

    const container = this.map.getCanvasContainer()
    container.removeEventListener('mousedown', this._onMouseDown)
    window.removeEventListener('mousemove', this._onMouseMove)
    window.removeEventListener('mouseup', this._onMouseUp)
    container.removeEventListener('touchstart', this._onTouchStart)
    window.removeEventListener('touchmove', this._onTouchMove)
    window.removeEventListener('touchend', this._onTouchEnd)
    this.map.off('render', this._onResize)

    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas)
    }

    this.canvas = null
    this.ctx = null
  }
}

export default FreehandDraw
