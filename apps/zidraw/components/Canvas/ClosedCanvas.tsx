import {useRef, useState, useEffect} from 'react';
import { Game } from '@/app/draw/Game';
import {IconButton} from './IconButton'
import { Circle, Pencil, RectangleHorizontalIcon } from "lucide-react";


export type Tool = "circle" | "rect" | "pencil";

export function ClosedCanvas({
    roomId,
    socket
}: {
    socket: WebSocket,
    roomId: string
}){
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [game, setGame] = useState<Game>();
    const [selectedTool, setSelectedTool] = useState<Tool>("rect");

    useEffect(() => {
        game?.setTool(selectedTool);
    }, [selectedTool, game]);


    useEffect(() => {
        if(canvasRef.current){
            const currentGame = new Game(canvasRef.current, roomId, socket);
            setGame(currentGame);

            return () => {
                currentGame.destroy();
            }
        }
    }, [canvasRef]);

    return (    
        <div className="h-[100vh] overflow-hidden">
            <canvas ref={canvasRef} width={window.innerWidth} height={innerHeight} />
            <Toolbar setSelectedTool={setSelectedTool} selectedTool={selectedTool} />
        </div>
    )
}


function Toolbar({selectedTool, setSelectedTool}: {
    selectedTool: Tool,
    setSelectedTool: (currentTool: Tool) => void
}){
    return (
        <div className="fixed top-10 left-10">
            <div className="flex gap-2">
                
                <IconButton
                    onClick={() => (
                        setSelectedTool("pencil")
                    )}
                    activated={selectedTool==="pencil"}
                    icon={<Pencil />}
                />

                <IconButton
                    onClick={() => {
                        setSelectedTool("circle")
                    }}
                    activated={selectedTool === 'circle'}
                    icon={<Circle />}
                />


                <IconButton
                    onClick={() => {
                        setSelectedTool('rect');
                    }}
                    activated={selectedTool === 'rect'}
                    icon = {<RectangleHorizontalIcon />}
                />
            </div>
        </div>
    )
}