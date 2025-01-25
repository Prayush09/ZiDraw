import { useRef, useState, useEffect } from 'react';
import { FreeGame } from '@/app/draw/FreeGame';
import { IconButton } from './IconButton';
import { Circle, Pencil, RectangleHorizontalIcon, Eraser, ZoomIn, ZoomOut, Move, TextSelect} from 'lucide-react';

export type Tool = 'circle' | 'rect' | 'pencil' | 'eraser' | 'pan' | 'zoom-in' | 'zoom-out' | 'select';

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
            <div className="flex gap-2 bg-black/20 backdrop-blur-sm p-2 rounded-lg">
                <IconButton
                    onClick={() => setSelectedTool('pencil')}
                    activated={selectedTool === 'pencil'}
                    icon={<Pencil />}
                />
                <IconButton
                    onClick={() => setSelectedTool('circle')}
                    activated={selectedTool === 'circle'}
                    icon={<Circle />}
                />
                <IconButton
                    onClick={() => setSelectedTool('rect')}
                    activated={selectedTool === 'rect'}
                    icon={<RectangleHorizontalIcon />}
                />
                <IconButton
                    onClick={() => setSelectedTool('eraser')}
                    activated={selectedTool === 'eraser'}
                    icon={<Eraser />}
                />
                <IconButton
                    onClick={() => setSelectedTool('pan')}
                    activated={selectedTool === 'pan'}
                    icon={<Move />}
                />
                <IconButton
                    onClick={() => setSelectedTool('zoom-in')}
                    activated={selectedTool === 'zoom-in'}
                    icon={<ZoomIn />}
                />
                <IconButton
                    onClick={() => setSelectedTool('zoom-out')}
                    activated={selectedTool === 'zoom-out'}
                    icon={<ZoomOut />}
                />
                <IconButton
                    onClick={() => setSelectedTool('select')}
                    activated={selectedTool === 'select'}
                    icon={<TextSelect />}
                />
            </div>
        </div>
    );
}