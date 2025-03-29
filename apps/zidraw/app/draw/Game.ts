import type { Tool } from "@/components/Canvas/ClosedCanvas"
import { getExistingShapes, canvasCleared } from "./http"

type Shape =
  | {
      type: "rect"
      x: number
      y: number
      width: number
      height: number
      id?: string
      selected?: boolean
    }
  | {
      type: "circle"
      centerX: number
      centerY: number
      radius: number
      id?: string
      selected?: boolean
    }
  | {
      type: "pencil"
      startX: number
      startY: number
      previousX: number
      previousY: number
      endX: number
      endY: number
      points?: { x: number; y: number }[]
      id?: string
      selected?: boolean
    }
  | {
      type: "clear Canvas"
      startX: 0
      startY: 0
      endX: number
      endY: number
      id?: string
    }
  | {
      type: "eraser"
      startX: number
      startY: number
      points?: { x: number; y: number }[]
      id?: string
    }

// Define resize handle positions
type ResizeHandle = "top-left" | "top-right" | "bottom-left" | "bottom-right" | "none"

export class Game {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private existingShapes: Shape[]
  private roomId: string
  private clicked: boolean
  private startX = 0
  private startY = 0
  private previousX = 0
  private previousY = 0
  private selectedTool: Tool = "circle"
  private canvasCleared = false
  private pencilPoints: { x: number; y: number }[] = []
  private eraserPoints: { x: number; y: number }[] = []
  private animationFrameId: number | null = null
  private isDrawing = false
  private currentShape: Shape | null = null
  socket: WebSocket

  // New properties for panning
  private isPanning = false
  private panOffsetX = 0
  private panOffsetY = 0
  private lastPanX = 0
  private lastPanY = 0

  // New properties for selection
  private selectedShape: Shape | null = null
  private originalShape: Shape | null = null // Store original shape for undo
  private isMoving = false
  private isResizing = false
  private currentResizeHandle: ResizeHandle = "none"
  private selectionStartX = 0
  private selectionStartY = 0
  private resizeHandleSize = 8

  constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    this.canvas = canvas
    this.ctx = canvas.getContext("2d")!
    this.ctx.fillStyle = "black"
    // Enable image smoothing
    this.ctx.imageSmoothingEnabled = true
    this.existingShapes = []
    this.roomId = roomId
    this.socket = socket
    this.clicked = false

    this.init()
    this.initHandlers()
    this.initMouseHandlers()
  }

  private throttle = (fn: Function, delay: number) => {
    let lastCall = 0
    return (...args: any[]) => {
      const now = Date.now()
      if (now - lastCall >= delay) {
        fn.apply(this, args)
        lastCall = now
      }
    }
  }

  initMouseHandlers() {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler)
    this.canvas.addEventListener("mouseup", this.mouseUpHandler)
    this.canvas.addEventListener("mousemove", this.throttle(this.mouseMoveHandler.bind(this), 16))
    this.canvas.addEventListener("mouseleave", this.mouseUpHandler)
    // Add wheel event for zooming (future enhancement)
    this.canvas.addEventListener("wheel", this.wheelHandler)
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
    }
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler)
    this.canvas.removeEventListener("mouseup", this.mouseUpHandler)
    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler)
    this.canvas.removeEventListener("mouseleave", this.mouseUpHandler)
    this.canvas.removeEventListener("wheel", this.wheelHandler)
  }

  setTool(tool: Tool) {
    this.selectedTool = tool
    // Deselect any selected shape when changing tools
    if (tool !== "select") {
      this.selectedShape = null
      this.renderShapes()
    }

    // Set appropriate cursor
    if (tool === "pan") {
      this.canvas.style.cursor = "grab"
    } else if (tool === "select") {
      this.canvas.style.cursor = "default"
    } else {
      this.canvas.style.cursor = "crosshair"
    }
  }

  // Generate a unique ID for shapes
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15)
  }

  // Helper to check if a point is inside a shape
  private isPointInShape(x: number, y: number, shape: Shape): boolean {
    // Adjust coordinates for panning
    const adjustedX = x - this.panOffsetX
    const adjustedY = y - this.panOffsetY

    if (shape.type === "rect") {
      return (
        adjustedX >= shape.x &&
        adjustedX <= shape.x + shape.width &&
        adjustedY >= shape.y &&
        adjustedY <= shape.y + shape.height
      )
    } else if (shape.type === "circle") {
      const distance = Math.sqrt(Math.pow(adjustedX - shape.centerX, 2) + Math.pow(adjustedY - shape.centerY, 2))
      return distance <= shape.radius
    } else if (shape.type === "pencil" && shape.points && shape.points.length > 0) {
      // For pencil, check if point is near any segment of the path
      // This is a simplified approach - more sophisticated hit testing could be implemented
      for (let i = 0; i < shape.points.length - 1; i++) {
        const p1 = shape.points[i]
        const p2 = shape.points[i + 1]

        // Calculate distance from point to line segment
        const lineLength = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
        if (lineLength === 0) continue

        const t = ((adjustedX - p1.x) * (p2.x - p1.x) + (adjustedY - p1.y) * (p2.y - p1.y)) / (lineLength * lineLength)

        if (t < 0) {
          // Point is closest to p1
          const distance = Math.sqrt(Math.pow(adjustedX - p1.x, 2) + Math.pow(adjustedY - p1.y, 2))
          if (distance <= 10) return true // 10px tolerance
        } else if (t > 1) {
          // Point is closest to p2
          const distance = Math.sqrt(Math.pow(adjustedX - p2.x, 2) + Math.pow(adjustedY - p2.y, 2))
          if (distance <= 10) return true // 10px tolerance
        } else {
          // Point is closest to a point on the line segment
          const closestX = p1.x + t * (p2.x - p1.x)
          const closestY = p1.y + t * (p2.y - p1.y)
          const distance = Math.sqrt(Math.pow(adjustedX - closestX, 2) + Math.pow(adjustedY - closestY, 2))
          if (distance <= 10) return true // 10px tolerance
        }
      }
      return false
    }
    return false
  }

  // Helper to get the resize handle at a point
  private getResizeHandleAtPoint(x: number, y: number): ResizeHandle {
    if (!this.selectedShape) return "none"

    // Only rectangles and circles can be resized
    if (this.selectedShape.type !== "rect" && this.selectedShape.type !== "circle") {
      return "none"
    }

    const adjustedX = x - this.panOffsetX
    const adjustedY = y - this.panOffsetY

    if (this.selectedShape.type === "rect") {
      const { x: shapeX, y: shapeY, width, height } = this.selectedShape

      // Check each corner
      if (
        Math.abs(adjustedX - shapeX) <= this.resizeHandleSize &&
        Math.abs(adjustedY - shapeY) <= this.resizeHandleSize
      ) {
        return "top-left"
      }

      if (
        Math.abs(adjustedX - (shapeX + width)) <= this.resizeHandleSize &&
        Math.abs(adjustedY - shapeY) <= this.resizeHandleSize
      ) {
        return "top-right"
      }

      if (
        Math.abs(adjustedX - shapeX) <= this.resizeHandleSize &&
        Math.abs(adjustedY - (shapeY + height)) <= this.resizeHandleSize
      ) {
        return "bottom-left"
      }

      if (
        Math.abs(adjustedX - (shapeX + width)) <= this.resizeHandleSize &&
        Math.abs(adjustedY - (shapeY + height)) <= this.resizeHandleSize
      ) {
        return "bottom-right"
      }
    } else if (this.selectedShape.type === "circle") {
      const { centerX, centerY, radius } = this.selectedShape

      // For circles, we'll use the cardinal points as resize handles
      // Top-right
      if (
        Math.abs(adjustedX - (centerX + radius / Math.sqrt(2))) <= this.resizeHandleSize &&
        Math.abs(adjustedY - (centerY - radius / Math.sqrt(2))) <= this.resizeHandleSize
      ) {
        return "top-right"
      }

      // Bottom-right
      if (
        Math.abs(adjustedX - (centerX + radius / Math.sqrt(2))) <= this.resizeHandleSize &&
        Math.abs(adjustedY - (centerY + radius / Math.sqrt(2))) <= this.resizeHandleSize
      ) {
        return "bottom-right"
      }

      // Bottom-left
      if (
        Math.abs(adjustedX - (centerX - radius / Math.sqrt(2))) <= this.resizeHandleSize &&
        Math.abs(adjustedY - (centerY + radius / Math.sqrt(2))) <= this.resizeHandleSize
      ) {
        return "bottom-left"
      }

      // Top-left
      if (
        Math.abs(adjustedX - (centerX - radius / Math.sqrt(2))) <= this.resizeHandleSize &&
        Math.abs(adjustedY - (centerY - radius / Math.sqrt(2))) <= this.resizeHandleSize
      ) {
        return "top-left"
      }
    }

    return "none"
  }

  private renderShapes() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.ctx.fillStyle = "black"
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    if (!this.canvasCleared) {
      this.ctx.save()
      // Apply panning transformation
      this.ctx.translate(this.panOffsetX, this.panOffsetY)

      this.ctx.strokeStyle = "rgba(255, 255, 255)"
      this.ctx.lineWidth = 3

      // Render all existing shapes
      this.existingShapes.forEach((shape) => {
        const isSelected = shape === this.selectedShape

        if (shape.type === "rect") {
          this.ctx.strokeStyle = isSelected ? "rgba(0, 255, 255)" : "rgba(255, 255, 255)"
          this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height)

          // Draw resize handles if selected
          if (isSelected) {
            this.drawResizeHandles(shape)
          }
        } else if (shape.type === "circle") {
          this.ctx.strokeStyle = isSelected ? "rgba(0, 255, 255)" : "rgba(255, 255, 255)"
          this.ctx.beginPath()
          this.ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2)
          this.ctx.stroke()

          // Draw resize handles if selected
          if (isSelected) {
            this.drawResizeHandles(shape)
          }
        } else if (shape.type === "pencil") {
          this.ctx.strokeStyle = isSelected ? "rgba(0, 255, 255)" : "rgba(255, 255, 255)"
          this.renderPencilPath(shape)
        } else if (shape.type === "eraser") {
          this.renderErasePath(shape)
        }
      })

      // Render the current shape being drawn
      if (this.currentShape) {
        this.ctx.strokeStyle = "rgba(255, 255, 255)"
        this.ctx.lineWidth = 3

        if (this.currentShape.type === "eraser") {
          this.renderErasePath(this.currentShape)
        } else if (this.currentShape.type === "rect") {
          this.ctx.strokeRect(
            this.currentShape.x,
            this.currentShape.y,
            this.currentShape.width,
            this.currentShape.height,
          )
        } else if (this.currentShape.type === "circle") {
          this.ctx.beginPath()
          this.ctx.arc(this.currentShape.centerX, this.currentShape.centerY, this.currentShape.radius, 0, Math.PI * 2)
          this.ctx.stroke()
        } else if (this.currentShape.type === "pencil") {
          this.renderPencilPath(this.currentShape)
        }
      }

      this.ctx.restore()
    }
  }

  // Draw resize handles for selected shapes
  private drawResizeHandles(shape: Shape) {
    this.ctx.fillStyle = "rgba(0, 255, 255)"

    if (shape.type === "rect") {
      // Draw handles at corners
      const { x, y, width, height } = shape

      // Top-left
      this.ctx.fillRect(
        x - this.resizeHandleSize / 2,
        y - this.resizeHandleSize / 2,
        this.resizeHandleSize,
        this.resizeHandleSize,
      )

      // Top-right
      this.ctx.fillRect(
        x + width - this.resizeHandleSize / 2,
        y - this.resizeHandleSize / 2,
        this.resizeHandleSize,
        this.resizeHandleSize,
      )

      // Bottom-left
      this.ctx.fillRect(
        x - this.resizeHandleSize / 2,
        y + height - this.resizeHandleSize / 2,
        this.resizeHandleSize,
        this.resizeHandleSize,
      )

      // Bottom-right
      this.ctx.fillRect(
        x + width - this.resizeHandleSize / 2,
        y + height - this.resizeHandleSize / 2,
        this.resizeHandleSize,
        this.resizeHandleSize,
      )
    } else if (shape.type === "circle") {
      const { centerX, centerY, radius } = shape

      // Draw handles at 45-degree angles
      const handleOffset = radius / Math.sqrt(2)

      // Top-right
      this.ctx.fillRect(
        centerX + handleOffset - this.resizeHandleSize / 2,
        centerY - handleOffset - this.resizeHandleSize / 2,
        this.resizeHandleSize,
        this.resizeHandleSize,
      )

      // Bottom-right
      this.ctx.fillRect(
        centerX + handleOffset - this.resizeHandleSize / 2,
        centerY + handleOffset - this.resizeHandleSize / 2,
        this.resizeHandleSize,
        this.resizeHandleSize,
      )

      // Bottom-left
      this.ctx.fillRect(
        centerX - handleOffset - this.resizeHandleSize / 2,
        centerY + handleOffset - this.resizeHandleSize / 2,
        this.resizeHandleSize,
        this.resizeHandleSize,
      )

      // Top-left
      this.ctx.fillRect(
        centerX - handleOffset - this.resizeHandleSize / 2,
        centerY - handleOffset - this.resizeHandleSize / 2,
        this.resizeHandleSize,
        this.resizeHandleSize,
      )
    }
  }

  private render = () => {
    this.renderShapes()
    this.animationFrameId = requestAnimationFrame(this.render)
  }

  clearCanvas() {
    if (this.canvasCleared) {
      this.existingShapes = []
      this.canvasCleared = false
    }
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    this.renderShapes()
  }

  renderPencilPath(shape: Shape) {
    if (shape.type !== "pencil") return

    this.ctx.beginPath()
    this.ctx.strokeStyle = shape === this.selectedShape ? "rgba(0, 255, 255)" : "rgba(255, 255, 255)"
    this.ctx.lineWidth = 3
    this.ctx.lineCap = "round"
    this.ctx.lineJoin = "round"

    if (shape.points && shape.points.length > 1) {
      const points = shape.points
      this.ctx.moveTo(points[0].x, points[0].y)

      for (let i = 1; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2
        const yc = (points[i].y + points[i + 1].y) / 2
        this.ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc)
      }

      // If there are at least 2 points, draw the last segment
      if (points.length >= 2) {
        const lastIndex = points.length - 1
        this.ctx.lineTo(points[lastIndex].x, points[lastIndex].y)
      }
    } else {
      this.ctx.moveTo(shape.startX, shape.startY)
      this.ctx.lineTo(shape.endX, shape.endY)
    }

    this.ctx.stroke()
  }

  async init() {
    this.existingShapes = await getExistingShapes(this.roomId)
    // Assign IDs to existing shapes if they don't have them
    this.existingShapes = this.existingShapes.map((shape) => {
      if ("id" in shape && !shape.id) {
        return { ...shape, id: this.generateId() }
      }
      return shape
    })
    this.canvasCleared = this.existingShapes.length === 0
    this.clearCanvas()

    // Start the render loop
    this.render()
  }

  initHandlers() {
    this.socket.onmessage = (event) => {
      const msg = JSON.parse(event.data)

      if (msg.type === "clearCanvas") {
        this.canvasCleared = true
        this.clearCanvas()
      } else if (msg.type === "chat") {
        const parsedShape = JSON.parse(msg.message)

        // Check if this is an update to an existing shape
        if (parsedShape.shape.id) {
          const existingIndex = this.existingShapes.findIndex(
            (s) => "id" in s && s.id === parsedShape.shape.id
          )
          if (existingIndex !== -1) {
            // Update existing shape
            this.existingShapes[existingIndex] = parsedShape.shape
          } else {
            // Add new shape
            this.existingShapes.push(parsedShape.shape)
          }
        } else {
          // Ensure the shape has an ID
          parsedShape.shape.id = this.generateId()
          this.existingShapes.push(parsedShape.shape)
        }

        this.clearCanvas()
      }
    }
  }

  private startDrawing() {
    this.isDrawing = true
  }

  private stopDrawing() {
    this.isDrawing = false
    this.currentShape = null
  }

  // Handler for mouse wheel events (for future zoom functionality)
  wheelHandler = (e: WheelEvent) => {
    // Prevent default scrolling behavior
    e.preventDefault()

    // Future zoom implementation could go here
  }

  mouseDownHandler = (e: MouseEvent): void => {
    this.clicked = true
    const mouseX = e.clientX - this.canvas.offsetLeft
    const mouseY = e.clientY - this.canvas.offsetTop

    // Store the starting position
    this.startX = mouseX
    this.startY = mouseY
    this.previousX = mouseX
    this.previousY = mouseY

    // Handle different tools
    if (this.selectedTool === "select") {
      // Check if clicking on a resize handle of the selected shape
      if (this.selectedShape) {
        const handle = this.getResizeHandleAtPoint(mouseX, mouseY)
        if (handle !== "none") {
          this.isResizing = true
          this.currentResizeHandle = handle
          this.selectionStartX = mouseX
          this.selectionStartY = mouseY

          // Store original shape for reference
          this.originalShape = JSON.parse(JSON.stringify(this.selectedShape))
          return
        }
      }

      // Check if clicking on an existing shape
      for (let i = this.existingShapes.length - 1; i >= 0; i--) {
        const shape = this.existingShapes[i]
        if (this.isPointInShape(mouseX, mouseY, shape)) {
          this.selectedShape = shape
          this.isMoving = true
          this.selectionStartX = mouseX
          this.selectionStartY = mouseY

          // Store original shape for reference
          this.originalShape = JSON.parse(JSON.stringify(shape))
          this.renderShapes()
          return
        }
      }

      // If clicked on empty space, deselect current shape
      this.selectedShape = null
      this.originalShape = null

      // Check if we should start panning (middle mouse button or space+click)
      if (e.button === 1 || (e.button === 0 && e.getModifierState("Space"))) {
        this.isPanning = true
        this.lastPanX = mouseX
        this.lastPanY = mouseY
        this.canvas.style.cursor = "grabbing"
      }
    } else if (this.selectedTool === "pan") {
      // Start panning
      this.isPanning = true
      this.lastPanX = mouseX
      this.lastPanY = mouseY
      this.canvas.style.cursor = "grabbing"
    } else if (this.selectedTool === "pencil") {
      this.pencilPoints = [{ x: mouseX - this.panOffsetX, y: mouseY - this.panOffsetY }]
      this.startDrawing()
    } else if (this.selectedTool === "eraser") {
      this.eraserPoints = [{ x: mouseX - this.panOffsetX, y: mouseY - this.panOffsetY }]
      this.startDrawing()
    } else {
      // For other drawing tools
      this.startDrawing()
    }
  }

  mouseMoveHandler = (e: MouseEvent): void => {
    const mouseX = e.clientX - this.canvas.offsetLeft
    const mouseY = e.clientY - this.canvas.offsetTop

    // Update cursor based on what's under it
    this.updateCursor(mouseX, mouseY)

    if (!this.clicked) return

    // Handle panning
    if (this.isPanning) {
      const dx = mouseX - this.lastPanX
      const dy = mouseY - this.lastPanY

      this.panOffsetX += dx
      this.panOffsetY += dy

      this.lastPanX = mouseX
      this.lastPanY = mouseY

      this.renderShapes()
      return
    }

    // Handle moving selected shape
    if (this.isMoving && this.selectedShape) {
      const dx = mouseX - this.selectionStartX
      const dy = mouseY - this.selectionStartY

      if (this.selectedShape.type === "rect") {
        this.selectedShape.x += dx
        this.selectedShape.y += dy
      } else if (this.selectedShape.type === "circle") {
        this.selectedShape.centerX += dx
        this.selectedShape.centerY += dy
      } else if (this.selectedShape.type === "pencil" && this.selectedShape.points) {
        // Move all points in the pencil path
        this.selectedShape.points = this.selectedShape.points.map((point) => ({
          x: point.x + dx,
          y: point.y + dy,
        }))
        this.selectedShape.startX += dx
        this.selectedShape.startY += dy
        this.selectedShape.endX += dx
        this.selectedShape.endY += dy
      }

      this.selectionStartX = mouseX
      this.selectionStartY = mouseY
      this.renderShapes()
      return
    }

    // Handle resizing selected shape
    if (this.isResizing && this.selectedShape) {
      const dx = mouseX - this.selectionStartX
      const dy = mouseY - this.selectionStartY

      if (this.selectedShape.type === "rect") {
        const { x, y, width, height } = this.selectedShape

        switch (this.currentResizeHandle) {
          case "top-left":
            this.selectedShape.x = x + dx
            this.selectedShape.y = y + dy
            this.selectedShape.width = width - dx
            this.selectedShape.height = height - dy
            break
          case "top-right":
            this.selectedShape.y = y + dy
            this.selectedShape.width = width + dx
            this.selectedShape.height = height - dy
            break
          case "bottom-left":
            this.selectedShape.x = x + dx
            this.selectedShape.width = width - dx
            this.selectedShape.height = height + dy
            break
          case "bottom-right":
            this.selectedShape.width = width + dx
            this.selectedShape.height = height + dy
            break
        }

        // Ensure width and height are positive
        if (this.selectedShape.width < 0) {
          this.selectedShape.x += this.selectedShape.width
          this.selectedShape.width = Math.abs(this.selectedShape.width)
        }

        if (this.selectedShape.height < 0) {
          this.selectedShape.y += this.selectedShape.height
          this.selectedShape.height = Math.abs(this.selectedShape.height)
        }
      } else if (this.selectedShape.type === "circle") {
        // For circles, we'll adjust the radius based on the distance from center
        const { centerX, centerY } = this.selectedShape
        const newX = this.selectionStartX + dx - this.panOffsetX
        const newY = this.selectionStartY + dy - this.panOffsetY

        // Calculate new radius based on distance from center to mouse
        const newRadius = Math.sqrt(Math.pow(newX - centerX, 2) + Math.pow(newY - centerY, 2))

        this.selectedShape.radius = newRadius
      }

      this.selectionStartX = mouseX
      this.selectionStartY = mouseY
      this.renderShapes()
      return
    }

    // Handle drawing tools
    if (this.isDrawing) {
      const adjustedX = mouseX - this.panOffsetX
      const adjustedY = mouseY - this.panOffsetY
      const width = adjustedX - this.startX
      const height = adjustedY - this.startY

      if (this.selectedTool === "pencil") {
        this.pencilPoints.push({ x: adjustedX, y: adjustedY })
        this.currentShape = {
          type: "pencil",
          startX: this.startX,
          startY: this.startY,
          previousX: this.previousX,
          previousY: this.previousY,
          endX: adjustedX,
          endY: adjustedY,
          points: this.pencilPoints,
        }
      } else if (this.selectedTool === "rect") {
        this.currentShape = {
          type: "rect",
          x: this.startX,
          y: this.startY,
          width,
          height,
        }
      } else if (this.selectedTool === "circle") {
        const radius = Math.abs(Math.max(width, height) / 2)
        this.currentShape = {
          type: "circle",
          radius,
          centerX: this.startX + width / 2,
          centerY: this.startY + height / 2,
        }
      } else if (this.selectedTool === "eraser") {
        this.eraserPoints.push({ x: adjustedX, y: adjustedY })
        this.currentShape = {
          type: "eraser",
          startX: this.startX,
          startY: this.startY,
          points: this.eraserPoints,
        }
      }

      this.previousX = adjustedX
      this.previousY = adjustedY
    }
  }

  // Update cursor based on what's under it
  private updateCursor(x: number, y: number) {
    if (this.selectedTool === "pan" || (this.selectedTool === "select" && this.isPanning)) {
      this.canvas.style.cursor = this.isPanning ? "grabbing" : "grab"
      return
    }

    if (this.selectedTool === "select") {
      // Check if over a resize handle
      if (this.selectedShape) {
        const handle = this.getResizeHandleAtPoint(x, y)

        if (handle === "top-left" || handle === "bottom-right") {
          this.canvas.style.cursor = "nwse-resize"
          return
        } else if (handle === "top-right" || handle === "bottom-left") {
          this.canvas.style.cursor = "nesw-resize"
          return
        }
      }

      // Check if over a shape
      for (let i = this.existingShapes.length - 1; i >= 0; i--) {
        if (this.isPointInShape(x, y, this.existingShapes[i])) {
          this.canvas.style.cursor = "move"
          return
        }
      }

      // Default cursor
      this.canvas.style.cursor = "default"
    } else if (this.selectedTool === "pencil" || this.selectedTool === "eraser") {
      this.canvas.style.cursor = "crosshair"
    } else {
      this.canvas.style.cursor = "crosshair"
    }
  }

  mouseUpHandler = (e: MouseEvent): void => {
    if (!this.clicked) return

    this.clicked = false
    const mouseX = e.clientX - this.canvas.offsetLeft
    const mouseY = e.clientY - this.canvas.offsetTop
    const adjustedX = mouseX - this.panOffsetX
    const adjustedY = mouseY - this.panOffsetY
    const width = adjustedX - this.startX
    const height = adjustedY - this.startY

    // Reset cursor
    this.updateCursor(mouseX, mouseY)

    // Handle panning end
    if (this.isPanning) {
      this.isPanning = false
      return
    }

    // Handle moving end
    if (this.isMoving) {
      this.isMoving = false

      // Broadcast the updated shape to other users
      if (this.selectedShape && this.originalShape) {
        // Find and update the shape in the existingShapes array
        const index = this.existingShapes.findIndex(
          (s) => "id" in s && s.id === this.selectedShape?.id
        )
        if (index !== -1) {
          this.existingShapes[index] = this.selectedShape

          // Send update to server
          this.socket.send(
            JSON.stringify({
              type: "chat",
              message: JSON.stringify({ shape: this.selectedShape }),
              roomId: this.roomId,
            }),
          )
        }
      }

      this.originalShape = null
      return
    }

    // Handle resizing end
    if (this.isResizing) {
      this.isResizing = false
      this.currentResizeHandle = "none"

      // Broadcast the updated shape to other users
      if (this.selectedShape && this.originalShape) {
        // Find and update the shape in the existingShapes array
        const index = this.existingShapes.findIndex(
          (s) => "id" in s && s.id === this.selectedShape?.id
        )
        if (index !== -1) {
          this.existingShapes[index] = this.selectedShape

          // Send update to server
          this.socket.send(
            JSON.stringify({
              type: "chat",
              message: JSON.stringify({ shape: this.selectedShape }),
              roomId: this.roomId,
            }),
          )
        }
      }

      this.originalShape = null
      return
    }

    if (this.selectedTool === "clear canvas") {
      this.canvasCleared = true
      this.existingShapes = []

      canvasCleared(this.roomId)

      this.socket.send(
        JSON.stringify({
          type: "clearCanvas",
          roomId: this.roomId,
        }),
      )
      this.clearCanvas()
      this.stopDrawing()
      return
    }

    // Handle drawing tools
    if (this.isDrawing) {
      let shape: Shape | null = null

      if (this.selectedTool === "rect") {
        // Only create a shape if it has some size
        if (Math.abs(width) > 2 && Math.abs(height) > 2) {
          shape = {
            type: "rect",
            x: this.startX,
            y: this.startY,
            width,
            height,
            id: this.generateId(),
          }
        }
      } else if (this.selectedTool === "circle") {
        const radius = Math.abs(Math.max(width, height) / 2)
        // Only create a shape if it has some size
        if (radius > 2) {
          shape = {
            type: "circle",
            radius,
            centerX: this.startX + width / 2,
            centerY: this.startY + height / 2,
            id: this.generateId(),
          }
        }
      } else if (this.selectedTool === "eraser") {
        if (this.eraserPoints.length > 1) {
          shape = {
            type: "eraser",
            startX: this.startX,
            startY: this.startY,
            points: this.eraserPoints,
          }
        }
      } else if (this.selectedTool === "pencil") {
        if (this.pencilPoints.length > 1) {
          shape = {
            type: "pencil",
            startX: this.startX,
            startY: this.startY,
            previousX: this.previousX,
            previousY: this.previousY,
            endX: adjustedX,
            endY: adjustedY,
            points: this.pencilPoints,
            id: this.generateId(),
          }
        }
      }

      this.canvasCleared = false
      if (!shape) {
        this.stopDrawing()
        return
      }

      this.existingShapes.push(shape)
      this.socket.send(
        JSON.stringify({
          type: "chat",
          message: JSON.stringify({ shape }),
          roomId: this.roomId,
        }),
      )

      this.pencilPoints = []
      this.eraserPoints = []
      this.stopDrawing()
    }
  }

  private renderErasePath(shape: Shape) {
    if (shape.type !== "eraser" || !shape.points) return

    const eraserSize = 20 // Adjust the eraser size as needed

    // Use black fill for eraser to match background
    this.ctx.fillStyle = "black"

    // Draw black squares at each point to "erase" by covering with black
    shape.points.forEach((point) => {
      this.ctx.fillRect(point.x - eraserSize / 2, point.y - eraserSize / 2, eraserSize, eraserSize)
    })
  }
}

