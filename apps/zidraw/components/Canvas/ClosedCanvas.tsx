"use client"
//TODO: ADD MOBILE COMPATIBILITY
import { useRef, useState, useEffect } from "react"
import { Game } from "@/app/draw/Game"
import { IconButton } from "./IconButton"
import { Circle, Pencil, RectangleHorizontalIcon, ClipboardX, Eraser, Menu, X } from "lucide-react"
import BackButton from "@/components/ui/BackButton"

export type Tool = "circle" | "rect" | "pencil" | "clear canvas" | "eraser"

export function ClosedCanvas({ roomId, socket }: { socket: WebSocket; roomId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [game, setGame] = useState<Game>()
  const [selectedTool, setSelectedTool] = useState<Tool>("rect")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  useEffect(() => {
    game?.setTool(selectedTool)
  }, [selectedTool, game])

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth
        canvasRef.current.height = window.innerHeight
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        })
        game?.clearCanvas()
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [game])

  useEffect(() => {
    if (canvasRef.current) {
      const currentGame = new Game(canvasRef.current, roomId, socket)
      setGame(currentGame)

      return () => {
        currentGame.destroy()
      }
    }
  }, [roomId, socket])

  return (
    <div className="h-screen w-screen relative">
      <BackButton className="fixed top-4 right-4 sm:top-8 sm:right-8 z-50" />
      <canvas ref={canvasRef} width={dimensions.width} height={dimensions.height}  />
      <Toolbar
        setSelectedTool={setSelectedTool}
        selectedTool={selectedTool}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
    </div>
  )
}

function Toolbar({
  selectedTool,
  setSelectedTool,
  sidebarOpen,
  setSidebarOpen,
}: {
  selectedTool: Tool
  setSelectedTool: (currentTool: Tool) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}) {
  return (
    <div>
      {/* Toggle Button */}
      <button
        className="fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-lg"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-48 bg-black shadow-lg p-2 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out z-40`}
      >
        <h2 className="text-lg font-bold mb-4 mt-16">Tools</h2>
        <div className="flex flex-col gap-2">
          <IconButton
            onClick={() => setSelectedTool("pencil")}
            activated={selectedTool === "pencil"}
            icon={<Pencil className="w-5 h-5" />}
            name="Pencil"
          />
          <IconButton
            onClick={() => setSelectedTool("circle")}
            activated={selectedTool === "circle"}
            icon={<Circle className="w-5 h-5" />}
            name="Circle"
          />
          <IconButton
            onClick={() => setSelectedTool("rect")}
            activated={selectedTool === "rect"}
            icon={<RectangleHorizontalIcon className="w-5 h-5" />}
            name="Rectangle"
          />
          <IconButton
            onClick={() => setSelectedTool("clear canvas")}
            activated={selectedTool === "clear canvas"}
            icon={<ClipboardX className="w-5 h-5" />}
            name="Clear Canvas"
          />
          <IconButton
            onClick={() => setSelectedTool("eraser")}
            activated={selectedTool === "eraser"}
            icon={<Eraser className="w-5 h-5" />}
            name="Eraser"
          />
        </div>
      </div>
    </div>
  )
}

