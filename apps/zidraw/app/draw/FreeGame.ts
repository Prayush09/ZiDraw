import { Tool } from '@/components/Canvas/OpenCanvas';
 
type Shape = {
    type: "rect" | "circle" | "pencil" | "eraser";
    uuid: number;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    centerX?: number;
    centerY?: number;
    radius?: number;
    startX?: number;
    startY?: number;
    endX?: number;
    endY?: number;
    path?: {x: number; y: number}[];
    selected?: boolean;
}

type ResizeHandle = "top" | "bottom" | "left" | "right" | "topLeft" | "topRight" | "bottomLeft" | "bottomRight" | null;

export class FreeGame {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private clicked: boolean;
    private startX = 0;
    private startY = 0;
    private selectedTool: Tool = "circle";
    private shapes: Shape[] = [];
    private selectedShape: Shape | null = null;
    private resizeHandle: ResizeHandle = null;
    private isDragging = false;
    private dragOffsetX = 0;
    private dragOffsetY = 0;
    private isResizing = false;

    constructor(canvas: HTMLCanvasElement){
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.clicked = false;
        this.loadShapesFromStorage();
        this.init();
        this.initMouseHandlers();
    }

    private generateUUID(){
        return Math.floor(Math.random() * 1000000000);
    }

    private saveShapesToStorage() {
        localStorage.setItem('canvasShapes', JSON.stringify(this.shapes));
    }

    private loadShapesFromStorage() {
        const storedShapes = localStorage.getItem('canvasShapes');
        if (storedShapes) {
            try {
                const parsedShapes: Shape[] = JSON.parse(storedShapes);
                this.shapes = parsedShapes.filter((shape) => {
                    if (shape.type === "pencil") {
                        return shape.path && Array.isArray(shape.path);
                    }
                    return true; 
                });
                this.redrawShapes();
            } catch (err) {
                console.error("Failed to load shapes from storage:", err);
                this.shapes = [];
            }
        }
    }

    private isPointInShape(x: number, y: number, shape: Shape): boolean {
        switch (shape.type) {
            case "rect":
                // Ensure point is strictly within the rectangle's boundaries
                return x > shape.x! && x < shape.x! + shape.width! &&
                       y > shape.y! && y < shape.y! + shape.height!;
            case "circle":
                // Ensure point is strictly within the circle's radius
                const dx = x - shape.centerX!;
                const dy = y - shape.centerY!;
                const distance = Math.sqrt(dx * dx + dy * dy);
                return distance < shape.radius!;
            case "pencil":
                if (shape.path) {
                    return shape.path.some(point => {
                        const dx = x - point.x;
                        const dy = y - point.y;
                        return Math.sqrt(dx * dx + dy * dy) <= 5;
                    });
                }
                return false;
            default:
                return false;
        }
    }

    private getResizeHandle(x: number, y: number, shape: Shape): ResizeHandle {
        if (shape.type !== "rect") return null;

        const handleSize = 8;
        const handles = [
            { type: "topLeft", x: shape.x!, y: shape.y! },
            { type: "topRight", x: shape.x! + shape.width!, y: shape.y! },
            { type: "bottomLeft", x: shape.x!, y: shape.y! + shape.height! },
            { type: "bottomRight", x: shape.x! + shape.width!, y: shape.y! + shape.height! },
            { type: "top", x: shape.x! + shape.width! / 2, y: shape.y! },
            { type: "bottom", x: shape.x! + shape.width! / 2, y: shape.y! + shape.height! },
            { type: "left", x: shape.x!, y: shape.y! + shape.height! / 2 },
            { type: "right", x: shape.x! + shape.width!, y: shape.y! + shape.height! / 2 }
        ];

        for (const handle of handles) {
            if (Math.abs(x - handle.x) <= handleSize && Math.abs(y - handle.y) <= handleSize) {
                return handle.type as ResizeHandle;
            }
        }

        return null;
    }

    private drawResizeHandles(shape: Shape) {
        if (shape.type !== "rect" || !shape.selected) return;

        const handleSize = 8;
        this.ctx.fillStyle = "#ffffff";
        
        // Corner handles
        [
            [shape.x!, shape.y!],
            [shape.x! + shape.width!, shape.y!],
            [shape.x!, shape.y! + shape.height!],
            [shape.x! + shape.width!, shape.y! + shape.height!]
        ].forEach(([x, y]) => {
            this.ctx.fillRect(x - handleSize/2, y - handleSize/2, handleSize, handleSize);
        });

        // Edge handles
        [
            [shape.x! + shape.width!/2, shape.y!],
            [shape.x! + shape.width!/2, shape.y! + shape.height!],
            [shape.x!, shape.y! + shape.height!/2],
            [shape.x! + shape.width!, shape.y! + shape.height!/2]
        ].forEach(([x, y]) => {
            this.ctx.fillRect(x - handleSize/2, y - handleSize/2, handleSize, handleSize);
        });
    }

    private redrawShapes() {
        this.clearCanvas();
        this.ctx.strokeStyle = "rgba(255, 255, 255)";
        this.shapes.forEach((shape) => {
            this.ctx.strokeStyle = shape.selected ? "#00ff00" : "rgba(255, 255, 255)";
            
            switch (shape.type) {
                case "rect":
                    this.ctx.strokeRect(shape.x!, shape.y!, shape.width!, shape.height!);
                    if (shape.selected) {
                        this.drawResizeHandles(shape);
                    }
                    break;
                case "circle":
                    this.ctx.beginPath();
                    this.ctx.arc(shape.centerX!, shape.centerY!, shape.radius!, 0, Math.PI * 2);
                    this.ctx.stroke();
                    this.ctx.closePath();
                    break;
                case "pencil":
                    if (shape.path && shape.path.length > 0) {
                        this.ctx.beginPath();
                        shape.path.forEach((point, index) => {
                            if (index === 0) {
                                this.ctx.moveTo(point.x, point.y);
                            } else {
                                this.ctx.lineTo(point.x, point.y);
                            }
                        });
                        this.ctx.stroke();
                        this.ctx.closePath();
                    }
                    break;        
            }
        });
    }

    initMouseHandlers(){
        this.canvas.addEventListener("mousedown", this.mouseDownHandler);
        this.canvas.addEventListener("mouseup", this.mouseUpHandler);
        this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
    }

    destroy(){
        this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
        this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
    }

    setTool(tool: Tool){
        this.selectedTool = tool;
        if (this.selectedShape) {
            this.selectedShape.selected = false;
            this.selectedShape = null;
            this.redrawShapes();
        }
    }

    clearCanvas(){
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "rgba(0,0,0)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    async init(){
        this.clearCanvas();
    }

    mouseDownHandler = (e: MouseEvent): void => {
        const x = e.clientX;
        const y = e.clientY;
        const rect = this.canvas.getBoundingClientRect();
        const canvasX = x - rect.left;
        const canvasY = y - rect.top;
    
        if (this.selectedTool === "select") {
            let shapeFound = false;
    
            // Check for shape selection with precise boundary checks
            for (let i = this.shapes.length - 1; i >= 0; i--) {
                if (this.isPointInShape(canvasX, canvasY, this.shapes[i])) {
                    shapeFound = true;
                    
                    // Check for resize handles first if there's a previous selected shape
                    if (this.selectedShape) {
                        this.resizeHandle = this.getResizeHandle(canvasX, canvasY, this.selectedShape);
                        if (this.resizeHandle) {
                            this.isResizing = true;
                            this.startX = canvasX;
                            this.startY = canvasY;
                            return;
                        }
                    }
    
                    // Deselect previous shape and select new shape
                    if (this.selectedShape) {
                        this.selectedShape.selected = false;
                    }
                    this.selectedShape = this.shapes[i];
                    this.selectedShape.selected = true;
                    this.isDragging = true;
                    
                    // Calculate drag offset based on shape type
                    this.dragOffsetX = canvasX - (this.selectedShape.type === "rect" ? this.selectedShape.x! : this.selectedShape.centerX!);
                    this.dragOffsetY = canvasY - (this.selectedShape.type === "rect" ? this.selectedShape.y! : this.selectedShape.centerY!);
                    
                    this.redrawShapes();
                    break;
                }
            }
    
            // If no shape is found, deselect any previously selected shape
            if (!shapeFound && this.selectedShape) {
                this.selectedShape.selected = false;
                this.selectedShape = null;
                this.redrawShapes();
            }
        } else {
            // Drawing logic remains the same, but use canvas coordinates
            this.clicked = true;
            this.startX = canvasX;
            this.startY = canvasY;
    
            if(this.selectedTool === "pencil"){
                this.shapes.push({
                    type: "pencil",
                    path: [{x: canvasX, y: canvasY}],
                    uuid: this.generateUUID()
                });
            }
            else if(this.selectedTool === 'circle'){
                this.shapes.push({
                    type: "circle",
                    centerX: canvasX,
                    centerY: canvasY,
                    radius: 0,
                    uuid: this.generateUUID()
                });
            }
            else if(this.selectedTool === 'rect'){
                this.shapes.push({
                    type: "rect",
                    x: canvasX,
                    y: canvasY,
                    width: 0,
                    height: 0,
                    uuid: this.generateUUID()
                });
            }
        }
    }

    mouseMoveHandler = (e: MouseEvent): void => {
        const rect = this.canvas.getBoundingClientRect
        const x = e.clientX;
        const y = e.clientY;

        if (this.selectedTool === "select" && this.selectedShape) {
            if (this.isResizing && this.resizeHandle) {
                const deltaX = x - this.startX;
                const deltaY = y - this.startY;

                switch (this.resizeHandle) {
                    case "topLeft":
                        this.selectedShape.x! += deltaX;
                        this.selectedShape.y! += deltaY;
                        this.selectedShape.width! -= deltaX;
                        this.selectedShape.height! -= deltaY;
                        break;
                    case "topRight":
                        this.selectedShape.y! += deltaY;
                        this.selectedShape.width! = x - this.selectedShape.x!;
                        this.selectedShape.height! -= deltaY;
                        break;
                    case "bottomLeft":
                        this.selectedShape.x! += deltaX;
                        this.selectedShape.width! -= deltaX;
                        this.selectedShape.height! = y - this.selectedShape.y!;
                        break;
                    case "bottomRight":
                        this.selectedShape.width! = x - this.selectedShape.x!;
                        this.selectedShape.height! = y - this.selectedShape.y!;
                        break;
                    case "top":
                        this.selectedShape.y! += deltaY;
                        this.selectedShape.height! -= deltaY;
                        break;
                    case "bottom":
                        this.selectedShape.height! = y - this.selectedShape.y!;
                        break;
                    case "left":
                        this.selectedShape.x! += deltaX;
                        this.selectedShape.width! -= deltaX;
                        break;
                    case "right":
                        this.selectedShape.width! = x - this.selectedShape.x!;
                        break;
                }

                this.startX = x;
                this.startY = y;
                this.redrawShapes();
            } else if (this.isDragging) {
                if (this.selectedShape.type === "rect") {
                    this.selectedShape.x = x - this.dragOffsetX;
                    this.selectedShape.y = y - this.dragOffsetY;
                } else if (this.selectedShape.type === "circle") {
                    this.selectedShape.centerX = x - this.dragOffsetX;
                    this.selectedShape.centerY = y - this.dragOffsetY;
                }
                this.redrawShapes();
            }
        } else if (this.clicked && !this.isResizing && this.selectedTool !== "select") {
            // Only draw new shapes if we're not resizing
            this.clearCanvas();
            this.redrawShapes();
            this.ctx.strokeStyle = "rgba(255, 255, 255)";
    
            switch (this.selectedTool) {
                case "rect":
                    const width = x - this.startX;
                    const height = y - this.startY;
                    this.ctx.strokeRect(this.startX, this.startY, width, height);
                    break;
                case "circle":
                    const radius = Math.abs(Math.max(
                        x - this.startX,
                        y - this.startY
                    ) / 2);
                    const centerX = this.startX + radius;
                    const centerY = this.startY + radius;
                    this.ctx.beginPath();
                    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                    this.ctx.stroke();
                    this.ctx.closePath();
                    break;
                case "pencil":
                    const currentShape = this.shapes[this.shapes.length - 1];
                    if (currentShape && currentShape.type === "pencil") {
                        currentShape.path!.push({ x, y }); 
                        this.ctx.beginPath();
                        currentShape.path!.forEach((point, index) => {
                            if (index === 0) {
                                this.ctx.moveTo(point.x, point.y);
                            } else {
                                this.ctx.lineTo(point.x, point.y);
                            }
                        });
                        this.ctx.stroke();
                    }
                    break;
                case "eraser":
                    const eraserRadius = 10; 
                    this.shapes = this.shapes.filter((shape) => {
                        switch (shape.type) {
                            case "rect": {
                                const rectRight = shape.x! + shape.width!;
                                const rectBottom = shape.y! + shape.height!;
                                const intersects =
                                    x + eraserRadius > shape.x! &&
                                    x - eraserRadius < rectRight &&
                                    y + eraserRadius > shape.y! &&
                                    y - eraserRadius < rectBottom;
                                localStorage.removeItem(shape.type)
                                return !intersects; 
                            }
                            case "circle": {
                                const dx = x - shape.centerX!;
                                const dy = y - shape.centerY!;
                                const distance = Math.sqrt(dx * dx + dy * dy);
                                return distance > shape.radius! + eraserRadius;
                            }
                            case "pencil": {
                                if (shape.path) {
                                    return !shape.path.some((point) => {
                                        const dx = x - point.x;
                                        const dy = y - point.y;
                                        return Math.sqrt(dx * dx + dy * dy) <= eraserRadius;
                                    });
                                }
                                return true;
                            }
                            default:
                                return true;
                        }
                    });
                    this.clearCanvas();
                    this.redrawShapes();
                    this.saveShapesToStorage();
                    break;
                default:
                    break;
            }
        }
    };

    mouseUpHandler = (e: MouseEvent): void => {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
    
        if (this.isResizing || this.isDragging) {
            // If we were resizing or dragging, just save the current state
            this.saveShapesToStorage();
        } else if (this.clicked && 
                   this.selectedTool !== "select" && 
                   this.selectedTool !== "eraser") {
            // Only create new shapes for drawing tools (rect, circle, pencil)
            const width = x - this.startX;
            const height = y - this.startY;
    
            let shape: Shape | null = null;
            switch (this.selectedTool) {
                case "rect":
                    shape = {
                        type: "rect",
                        x: this.startX,
                        y: this.startY,
                        width,
                        height,
                        uuid: this.generateUUID()
                    };
                    break;
                case "circle":
                    const radius = Math.abs(Math.max(width, height) / 2);
                    shape = {
                        type: "circle",
                        centerX: this.startX + radius,
                        centerY: this.startY + radius,
                        radius,
                        uuid: this.generateUUID()
                    };
                    break;
                case "pencil":
                    // Pencil shapes are already added during mouse move
                    break;
            }
    
            if (shape) {
                this.shapes.push(shape);
                this.saveShapesToStorage();
            }
        }
    
        // Reset all state flags
        this.clicked = false;
        this.isDragging = false;
        this.isResizing = false;
        this.resizeHandle = null;
    };
}

