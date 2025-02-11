import type { Tool } from "@/components/Canvas/OpenCanvas"

type Shape =
  | {
      type: "rect"
      x: number
      y: number
      width: number
      height: number
    }
  | {
      type: "circle"
      centerX: number
      centerY: number
      radius: number
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
    }
  | {
      type: "clear canvas"
      startX: 0
      startY: 0
      endX: number
      endY: number
    }
  | {
      type: "eraser"
      startX: number
      startY: number
      points?: { x: number; y: number }[]
    }

export class FreeGame {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
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
  private isErasing = false
  private currentShape: Shape | null = null
  private shapes: Shape[] = []

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext("2d")!
    this.ctx.fillStyle = "black"
    this.ctx.imageSmoothingEnabled = true
    this.clicked = false

    // Load shapes from localStorage
    this.loadShapes()
    this.init()
    this.initMouseHandlers()
  }

  private loadShapes() {
    const savedShapes = localStorage.getItem('canvasShapes')
    if (savedShapes) {
      this.shapes = JSON.parse(savedShapes)
    }
  }

  private saveShapes() {
    localStorage.setItem('canvasShapes', JSON.stringify(this.shapes))
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
    this.canvas.addEventListener(
      "mousemove",
      this.throttle(this.mouseMoveHandler.bind(this), 16)
    )
    this.canvas.addEventListener("mouseleave", this.mouseUpHandler)
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
    }
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler)
    this.canvas.removeEventListener("mouseup", this.mouseUpHandler)
    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler)
    this.canvas.removeEventListener("mouseleave", this.mouseUpHandler)
  }

  setTool(tool: Tool) {
    this.selectedTool = tool
    if (tool === "clear canvas") {
      this.clearCanvas()
    }
  }

  private renderShapes() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    // Fill the canvas background
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    if (!this.canvasCleared) {
      // First render all saved shapes
      this.shapes.forEach(shape => {
        if (shape.type === "eraser") {
          this.renderErasePath(shape)
        } else if (shape.type === "rect") {
          this.ctx.strokeStyle = "rgba(255, 255, 255)"
          this.ctx.lineWidth = 3
          this.ctx.strokeRect(
            shape.x,
            shape.y,
            shape.width,
            shape.height
          )
        } else if (shape.type === "circle") {
          this.ctx.strokeStyle = "rgba(255, 255, 255)"
          this.ctx.lineWidth = 3
          this.ctx.beginPath()
          this.ctx.arc(
            shape.centerX,
            shape.centerY,
            shape.radius,
            0,
            Math.PI * 2
          )
          this.ctx.stroke()
        } else if (shape.type === "pencil") {
          this.renderPencilPath(shape)
        }
      })

      // Then render the current shape being drawn
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
            this.currentShape.height
          )
        } else if (this.currentShape.type === "circle") {
          this.ctx.beginPath()
          this.ctx.arc(
            this.currentShape.centerX,
            this.currentShape.centerY,
            this.currentShape.radius,
            0,
            Math.PI * 2
          )
          this.ctx.stroke()
        } else if (this.currentShape.type === "pencil") {
          this.renderPencilPath(this.currentShape)
        }
      }
    }
  }

  private render = () => {
    if (this.isDrawing) {
      this.renderShapes()
      this.animationFrameId = requestAnimationFrame(this.render)
    }
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    // Clear shapes from localStorage
    this.shapes = []
    localStorage.removeItem('canvasShapes')
    this.renderShapes()
  }

  renderPencilPath(shape: Shape) {
    if (shape.type !== "pencil") return

    this.ctx.beginPath()
    this.ctx.strokeStyle = "rgba(255, 255, 255)"
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
    } else {
      this.ctx.moveTo(shape.startX, shape.startY)
      this.ctx.lineTo(shape.endX, shape.endY)
    }

    this.ctx.stroke()
  }

  private renderErasePath(shape: Shape) {
    if (shape.type !== "eraser" || !shape.points) return
  
    const eraserSize = 20
  
    this.ctx.save()
    this.ctx.globalCompositeOperation = "destination-out"
    shape.points.forEach((point) => {
      this.ctx.fillRect(
        point.x - eraserSize / 2,
        point.y - eraserSize / 2,
        eraserSize,
        eraserSize
      )
    })
    this.ctx.restore()
  }

  async init() {
    this.clearCanvas()
  }

  private startDrawing() {
    this.isDrawing = true
    this.render()
  }

  private stopDrawing() {
    this.isDrawing = false
    this.currentShape = null
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
  }

  mouseDownHandler = (e: MouseEvent): void => {
    this.clicked = true
    this.startY = e.clientY - this.canvas.offsetTop
    this.startX = e.clientX - this.canvas.offsetLeft
    this.previousX = this.startX
    this.previousY = this.startY

    if (this.selectedTool === "pencil") {
      this.pencilPoints = [{ x: this.startX, y: this.startY }]
    }

    if (this.selectedTool === "eraser") {
      this.eraserPoints = [{ x: this.startX, y: this.startY }]
    }

    this.startDrawing()
  }

  mouseMoveHandler = (e: MouseEvent): void => {
    if (!this.clicked) return

    const currentX = e.clientX - this.canvas.offsetLeft
    const currentY = e.clientY - this.canvas.offsetTop
    const width = currentX - this.startX
    const height = currentY - this.startY

    if (this.selectedTool === "pencil") {
      this.pencilPoints.push({ x: currentX, y: currentY })
      this.currentShape = {
        type: "pencil",
        startX: this.startX,
        startY: this.startY,
        previousX: this.previousX,
        previousY: this.previousY,
        endX: currentX,
        endY: currentY,
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
        centerX: this.startX + radius,
        centerY: this.startY + radius,
      }
    } else if (this.selectedTool === "eraser") {
      this.isErasing = true
      this.eraserPoints.push({ x: currentX, y: currentY })
      this.currentShape = {
        type: "eraser",
        startX: this.startX,
        startY: this.startY,
        points: this.eraserPoints,
      }
    }

    this.previousX = currentX
    this.previousY = currentY
  }

  mouseUpHandler = (e: MouseEvent): void => {
    if (!this.clicked) return

    this.clicked = false
    const currentX = e.clientX - this.canvas.offsetLeft
    const currentY = e.clientY - this.canvas.offsetTop
    const width = currentX - this.startX
    const height = currentY - this.startY

    if (this.selectedTool === "clear canvas") {
      this.canvasCleared = true
      this.clearCanvas()
      this.stopDrawing()
      return
    }

    let shape: Shape | null = null

    if (this.selectedTool === "rect") {
      shape = {
        type: "rect",
        x: this.startX,
        y: this.startY,
        width,
        height,
      }
    } else if (this.selectedTool === "circle") {
      const radius = Math.abs(Math.max(width, height) / 2)
      shape = {
        type: "circle",
        radius,
        centerX: this.startX + radius,
        centerY: this.startY + radius,
      }
    } else if (this.selectedTool === "eraser") {
      shape = {
        type: "eraser",
        startX: this.startX,
        startY: this.startY,
        points: this.eraserPoints,
      }
    } else if (this.selectedTool === "pencil") {
      shape = {
        type: "pencil",
        startX: this.startX,
        startY: this.startY,
        previousX: this.previousX,
        previousY: this.previousY,
        endX: currentX,
        endY: currentY,
        points: this.pencilPoints,
      }
    }

    this.canvasCleared = false
    if (!shape) return

    // Add the shape to the shapes array and save to localStorage
    this.shapes.push(shape)
    this.saveShapes()

    // Clear temporary points
    this.pencilPoints = []
    this.eraserPoints = []
    this.stopDrawing()
    this.renderShapes()
  }
}