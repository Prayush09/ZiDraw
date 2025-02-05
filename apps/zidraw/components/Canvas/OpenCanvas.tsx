import { useRef, useState, useEffect } from 'react';
import { FreeGame } from '@/app/draw/FreeGame';
import { IconButton } from './IconButton';
import { Circle, Pencil, RectangleHorizontalIcon, Eraser, ClipboardX} from 'lucide-react';

export type Tool = "circle" | "rect" | "pencil" | "clear canvas" | "eraser";

export function OpenCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [game, setGame] = useState<FreeGame | null>(null);
    const [selectedTool, setSelectedTool] = useState<Tool>('pencil');

    // Initialize the game when the canvas ref is available
    useEffect(() => {
        if (canvasRef.current) {
            const currentGame = new FreeGame(canvasRef.current);
            setGame(currentGame);
        }
    }, [canvasRef.current]);

    // Update the selected tool in the game instance
    useEffect(() => {
        if (game) {
            game.setTool(selectedTool);
        }
    }, [selectedTool, game]);

    // Cleanup the game instance when the component unmounts
    useEffect(() => {
        return () => {
            if (game) {
                game.destroy();
            }
        };
    }, [game]);

    return (
        <div className="h-[100vh] overflow-hidden">
            <canvas
                ref={canvasRef}
                width={window.innerWidth}
                height={window.innerHeight}
                className="touch-none"
            />
            <Toolbar
                selectedTool={selectedTool}
                setSelectedTool={setSelectedTool}
            />
        </div>
    );
}

function Toolbar({
    selectedTool,
    setSelectedTool,
}: {
    selectedTool: Tool;
    setSelectedTool: (tool: Tool) => void;
}) {
    return (
        <div className="fixed top-10 left-10">
            <div className="flex gap-2">
                
                <IconButton
                    onClick={() => (
                        setSelectedTool("pencil")
                    )}
                    activated={selectedTool==="pencil"}
                    icon={<Pencil />}
                    name="Pencil"
                />

                <IconButton
                    onClick={() => {
                        setSelectedTool("circle")
                    }}
                    activated={selectedTool === 'circle'}
                    icon={<Circle />}
                    name='Circle'
                />


                <IconButton
                    onClick={() => {
                        setSelectedTool('rect');
                    }}
                    activated={selectedTool === 'rect'}
                    icon = {<RectangleHorizontalIcon />}
                    name="Rectangle"
                />
                <IconButton
                    onClick={() => {
                        setSelectedTool('clear canvas');
                    }}
                    activated={selectedTool === 'clear canvas'}
                    icon = {<ClipboardX />}
                    name="Clear Canvas"
                />
                <IconButton
                    onClick={() => {
                        setSelectedTool('eraser');
                    }}
                    activated={selectedTool === 'eraser'}
                    icon = {<Eraser/>}
                    name="Eraser"
                />
            </div>
        </div>
    );
}