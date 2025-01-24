import { Tool } from '@/components/Canvas/OpenCanvas'

//TODO: ADD PAN AND ZOOM AND MAKE SURE EVERYTHING ELSE WORKS WITH IT.


type Shape = {
    type: "rect" | "circle" | "pencil" | "eraser";
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
}

export class FreeGame {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private clicked: boolean;
    private startX = 0;
    private startY = 0;
    private selectedTool: Tool = "circle";
    private shapes: Shape[] = [];

    constructor(canvas: HTMLCanvasElement){
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.clicked = false;
        this.loadShapesFromStorage();
        this.init();
        this.initMouseHandlers();
    }

    private saveShapesToStorage() {
        localStorage.setItem('canvasShapes', JSON.stringify(this.shapes));
    }

    private loadShapesFromStorage() {
        const storedShapes = localStorage.getItem('canvasShapes');
        if (storedShapes) {
            try {
                const parsedShapes: Shape[] = JSON.parse(storedShapes);
    
                // Filter out invalid shapes
                this.shapes = parsedShapes.filter((shape) => {
                    if (shape.type === "pencil") {
                        return shape.path && Array.isArray(shape.path);
                    }
                    return true; 
                });
    
                this.redrawShapes();
            } catch (err) {
                console.error("Failed to load shapes from storage:", err);
                this.shapes = []; // Reset shapes if parsing fails
            }
        }
    }
    

    private redrawShapes() {
        this.clearCanvas();
        this.ctx.strokeStyle = "rgba(255, 255, 255)";
        this.shapes.forEach((shape) => {
            switch (shape.type) {
                case "rect":
                    this.ctx.strokeRect(shape.x!, shape.y!, shape.width!, shape.height!);
                    break;
                case "circle":
                    this.ctx.beginPath();
                    this.ctx.arc(shape.centerX!, shape.centerY!, shape.radius!, 0, Math.PI * 2);
                    this.ctx.stroke();
                    this.ctx.closePath();
                    break;
                case "pencil":
                        if (shape.path && shape.path.length > 0) { // Add a null/undefined check
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
        this.clicked = true;
        this.startY = e.clientY;
        this.startX = e.clientX;

        if(this.selectedTool === "pencil"){
            this.shapes.push({
                type: "pencil",
                path: [{x: e.clientX, y: e.clientY}]
            })
        }
    }

    mouseMoveHandler = (e: MouseEvent): void => {
        if (this.clicked) {
            this.clearCanvas();
            this.redrawShapes();
            this.ctx.strokeStyle = "rgba(255, 255, 255)";
    
            switch (this.selectedTool) {
                case "rect":
                    const width = e.clientX - this.startX;
                    const height = e.clientY - this.startY;
                    this.ctx.strokeRect(this.startX, this.startY, width, height);
                    break;
                case "circle":
                    const radius = Math.max(
                        e.clientX - this.startX,
                        e.clientY - this.startY
                    ) / 2;
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
                        currentShape.path!.push({ x: e.clientX, y: e.clientY }); // Append new point
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
                        const eraserRadius = 10; // Radius of the eraser tool
                        const mouseX = e.clientX;
                        const mouseY = e.clientY;
                    
                        // Filter out shapes that intersect with the eraser
                        this.shapes = this.shapes.filter((shape) => {
                            switch (shape.type) {
                                case "rect": {
                                    const rectRight = shape.x! + shape.width!;
                                    const rectBottom = shape.y! + shape.height!;
                                    const intersects =
                                        mouseX + eraserRadius > shape.x! &&
                                        mouseX - eraserRadius < rectRight &&
                                        mouseY + eraserRadius > shape.y! &&
                                        mouseY - eraserRadius < rectBottom;
                                    return !intersects; // Remove the shape if intersected
                                }
                                case "circle": {
                                    const dx = mouseX - shape.centerX!;
                                    const dy = mouseY - shape.centerY!;
                                    const distance = Math.sqrt(dx * dx + dy * dy);
                                    return distance > shape.radius! + eraserRadius; // Remove if intersected
                                }
                                case "pencil": {
                                    if (shape.path) {
                                        // Check if any point in the path is within the eraser radius
                                        return !shape.path.some((point) => {
                                            const dx = mouseX - point.x;
                                            const dy = mouseY - point.y;
                                            return Math.sqrt(dx * dx + dy * dy) <= eraserRadius;
                                        });
                                    }
                                    return true; // Keep the shape if no path exists
                                }
                                default:
                                    return true; // Keep unknown shapes
                            }
                        });
                    
                        // Redraw shapes after removing intersected ones
                        this.clearCanvas();
                        this.redrawShapes();
                        this.saveShapesToStorage();
                    break;
            }
        }
    };
    

    mouseUpHandler = (e: MouseEvent): void => {
        this.clicked = false;
    
        if (this.selectedTool === "pencil") {
            this.saveShapesToStorage();
        } else {
            const width = e.clientX - this.startX;
            const height = e.clientY - this.startY;
    
            let shape: Shape | null = null;
            switch (this.selectedTool) {
                case "rect":
                    shape = {
                        type: "rect",
                        x: this.startX,
                        y: this.startY,
                        width,
                        height
                    };
                    break;
                case "circle":
                    const radius = Math.max(width, height) / 2;
                    shape = {
                        type: "circle",
                        centerX: this.startX + radius,
                        centerY: this.startY + radius,
                        radius
                    };
                    break;
            }
    
            if (shape) {
                this.shapes.push(shape);
                this.saveShapesToStorage();
            }
        }
    };
    
}