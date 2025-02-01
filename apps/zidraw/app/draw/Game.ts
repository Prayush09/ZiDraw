import { Tool } from '@/components/Canvas/ClosedCanvas'
import { getExistingShapes, canvasCleared } from './http';

type Shape = {
    type: "rect";
    x: number;
    y: number;
    width: number;
    height: number;
} | {
    type: "circle";
    centerX: number;
    centerY: number;
    radius: number;
} | {
    type: "pencil";
    startX: number;
    startY: number;
    previousX: number;
    previousY: number;
    endX: number;
    endY: number;
    points?: { x: number, y: number }[];
} | {
    type: "clear Canvas";
    startX: 0;
    startY: 0;
    endX: number;
    endY: number;
}

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private bufferCanvas: HTMLCanvasElement;
    private bufferCtx: CanvasRenderingContext2D;
    private existingShapes: Shape[];
    private roomId: string;
    private clicked: boolean;
    private startX = 0;
    private startY = 0;
    private previousX = 0;
    private previousY = 0;
    private selectedTool: Tool = "circle";
    private canvasCleared = false;
    private pencilPoints: { x: number, y: number }[] = [];
    private animationFrameId: number | null = null;
    private isDrawing = false;
    private currentShape: Shape | null = null;
    socket: WebSocket;

    constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { alpha: false })!;
        
        // Create buffer canvas
        this.bufferCanvas = document.createElement('canvas');
        this.bufferCanvas.width = canvas.width;
        this.bufferCanvas.height = canvas.height;
        this.bufferCtx = this.bufferCanvas.getContext('2d', { alpha: false })!;
        
        // Enable image smoothing for both contexts
        this.ctx.imageSmoothingEnabled = true;
        this.bufferCtx.imageSmoothingEnabled = true;
        
        this.existingShapes = [];
        this.roomId = roomId;
        this.socket = socket;
        this.clicked = false;
        
        this.init();
        this.initHandlers();
        this.initMouseHandlers();
    }

    private throttle = (fn: Function, delay: number) => {
        let lastCall = 0;
        return (...args: any[]) => {
            const now = Date.now();
            if (now - lastCall >= delay) {
                fn.apply(this, args);
                lastCall = now;
            }
        };
    };

    initMouseHandlers() {
        this.canvas.addEventListener("mousedown", this.mouseDownHandler);
        this.canvas.addEventListener("mouseup", this.mouseUpHandler);
        this.canvas.addEventListener("mousemove", 
            this.throttle(this.mouseMoveHandler.bind(this), 16)
        );
        this.canvas.addEventListener("mouseleave", this.mouseUpHandler);
    }

    destroy() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
        this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
        this.canvas.removeEventListener("mouseleave", this.mouseUpHandler);
    }

    setTool(tool: Tool) {
        this.selectedTool = tool;
    }

    private renderToBuffer() {
        // Clear buffer
        this.bufferCtx.fillStyle = "rgba(0,0,0)";
        this.bufferCtx.fillRect(0, 0, this.bufferCanvas.width, this.bufferCanvas.height);
    
        if (!this.canvasCleared) {
            this.bufferCtx.strokeStyle = "rgba(255, 255, 255)";
            this.bufferCtx.lineWidth = 3;
    
            // Batch similar shapes together to reduce context switches
            const rects: Shape[] = [];
            const circles: Shape[] = [];
            const pencils: Shape[] = [];
    
            this.existingShapes.forEach(shape => {
                if (shape.type === 'rect') rects.push(shape);
                else if (shape.type === 'circle') circles.push(shape);
                else if (shape.type === 'pencil') pencils.push(shape);
            });
    
            // Draw all rectangles in one path
            if (rects.length > 0) {
                rects.forEach(shape => {
                    if (shape.type === 'rect') {
                        this.bufferCtx.beginPath();
                        this.bufferCtx.rect(shape.x, shape.y, shape.width, shape.height);
                        this.bufferCtx.stroke();
                    }
                });
                
            }
    
            // Draw all circles in one path
            if (circles.length > 0) {
                circles.forEach(shape => {
                    if (shape.type === 'circle') {
                        this.bufferCtx.beginPath();
                        this.bufferCtx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2);
                        this.bufferCtx.stroke();
                    }
                });
            }
    
            // Draw pencil paths from existing shapes
            pencils.forEach(shape => {
                if (shape.type === 'pencil') {
                    this.renderPencilPath(shape);
                }
            });
        }
    
        // Draw the current shape if it exists.
        // Add handling for the pencil tool here.
        if (this.currentShape) {
            this.bufferCtx.strokeStyle = "rgba(255, 255, 255)";
            this.bufferCtx.lineWidth = 3;
    
            if (this.currentShape.type === 'rect') {
                this.bufferCtx.strokeRect(
                    this.currentShape.x,
                    this.currentShape.y,
                    this.currentShape.width,
                    this.currentShape.height
                );
            } else if (this.currentShape.type === 'circle') {
                this.bufferCtx.beginPath();
                this.bufferCtx.arc(
                    this.currentShape.centerX,
                    this.currentShape.centerY,
                    this.currentShape.radius,
                    0,
                    Math.PI * 2
                );
                this.bufferCtx.stroke();
            } else if (this.currentShape.type === 'pencil') {
                // Render the pencil stroke as it's being drawn.
                this.renderPencilPath(this.currentShape);
            }
        }
    }
    

    private render = () => {
        if (this.isDrawing) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(this.bufferCanvas, 0, 0);
            this.animationFrameId = requestAnimationFrame(this.render);
        }
    };

    clearCanvas() {
        this.renderToBuffer();
        if (!this.isDrawing) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(this.bufferCanvas, 0, 0);
        }
    }

    renderPencilPath(shape: Shape) {
        if (shape.type !== 'pencil') return;

        this.bufferCtx.beginPath();
        this.bufferCtx.strokeStyle = "rgba(255, 255, 255)";
        this.bufferCtx.lineWidth = 3;
        this.bufferCtx.lineCap = 'round';
        this.bufferCtx.lineJoin = 'round';

        if (shape.points && shape.points.length > 1) {
            const points = shape.points;
            this.bufferCtx.moveTo(points[0].x, points[0].y);
            
            // Use quadratic curves for smoother lines
            for (let i = 1; i < points.length - 1; i++) {
                const xc = (points[i].x + points[i + 1].x) / 2;
                const yc = (points[i].y + points[i + 1].y) / 2;
                this.bufferCtx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
            }
        } else {
            this.bufferCtx.moveTo(shape.startX, shape.startY);
            this.bufferCtx.lineTo(shape.endX, shape.endY);
        }
        
        this.bufferCtx.stroke();
    }

    async init() {
        this.existingShapes = await getExistingShapes(this.roomId);
        this.canvasCleared = this.existingShapes.length === 0;
        this.clearCanvas();
    }

    initHandlers() {
        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'chat') {
                const parsedShape = JSON.parse(message.message);
                this.existingShapes.push(parsedShape.shape);
                this.clearCanvas();
            }
        }
    }

    private startDrawing() {
        this.isDrawing = true;
        this.render();
    }

    private stopDrawing() {
        this.isDrawing = false;
        this.currentShape = null;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    mouseDownHandler = (e: MouseEvent): void => {
        this.clicked = true;
        this.startY = e.clientY - this.canvas.offsetTop;
        this.startX = e.clientX - this.canvas.offsetLeft;
        this.previousX = this.startX;
        this.previousY = this.startY;
        this.pencilPoints = [{ x: this.startX, y: this.startY }];
        this.startDrawing();
    }

    mouseMoveHandler = (e: MouseEvent): void => {
        if (!this.clicked) return;

        const currentX = e.clientX - this.canvas.offsetLeft;
        const currentY = e.clientY - this.canvas.offsetTop;
        const width = currentX - this.startX;
        const height = currentY - this.startY;

        if (this.selectedTool === 'pencil') {
            this.pencilPoints.push({ x: currentX, y: currentY });
            this.currentShape = {
                type: 'pencil',
                startX: this.startX,
                startY: this.startY,
                previousX: this.previousX,
                previousY: this.previousY,
                endX: currentX,
                endY: currentY,
                points: this.pencilPoints
            };
        } else if (this.selectedTool === 'rect') {
            this.currentShape = {
                type: 'rect',
                x: this.startX,
                y: this.startY,
                width,
                height
            };
        } else if (this.selectedTool === 'circle') {
            const radius = Math.abs(Math.max(width, height) / 2);
            this.currentShape = {
                type: 'circle',
                radius,
                centerX: this.startX + radius,
                centerY: this.startY + radius,
            };
        }

        this.renderToBuffer();
        this.previousX = currentX;
        this.previousY = currentY;
    }

    mouseUpHandler = (e: MouseEvent): void => {
        if (!this.clicked) return;
        
        this.clicked = false;
        const currentX = e.clientX - this.canvas.offsetLeft;
        const currentY = e.clientY - this.canvas.offsetTop;
        const width = currentX - this.startX;
        const height = currentY - this.startY;

        if (this.selectedTool === 'clear canvas') {
            this.canvasCleared = true;
            this.existingShapes = [];
            canvasCleared(this.roomId);
            this.clearCanvas();
            this.stopDrawing();
            return;
        }

        let shape: Shape | null = null;

        if (this.selectedTool === 'rect') {
            shape = {
                type: 'rect',
                x: this.startX,
                y: this.startY,
                height,
                width
            };
        } else if (this.selectedTool === 'circle') {
            const radius = Math.abs(Math.max(width, height) / 2);
            shape = {
                type: 'circle',
                radius,
                centerX: this.startX + radius,
                centerY: this.startY + radius,
            };
        } else if (this.selectedTool === 'pencil') {
            shape = {
                type: 'pencil',
                startX: this.startX,
                startY: this.startY,
                previousX: this.previousX,
                previousY: this.previousY,
                endX: currentX,
                endY: currentY,
                points: this.pencilPoints
            };
        }

        this.canvasCleared = false;
        if (!shape) return;

        this.existingShapes.push(shape);
        this.socket.send(JSON.stringify({
            type: 'chat',
            message: JSON.stringify({ shape }),
            roomId: this.roomId
        }));

        this.pencilPoints = [];
        this.stopDrawing();
        this.clearCanvas();
    }
}
//TODO: MAKE PENCIL WORK
//TODO: MAKE ERASER WORK

//TODO: MAKE PAN WORK
//TODO: MAKE ZOOM IN AND OUT WORK.. AND MAKE A DIFFERENT DIV FOR THAT IN THE LOWER RIGHT CORNER
