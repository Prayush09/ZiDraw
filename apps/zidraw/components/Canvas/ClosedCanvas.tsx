"use client"
import { useRef, useState, useEffect } from "react"
import { Game } from "@/app/draw/Game"
import { IconButton } from "@/components/ui/IconButton"
import {
  Circle,
  Pencil,
  Square,
  Trash2,
  Eraser,
  Menu,
  X,
  Move,
  MousePointer,
  Download,
  Upload,
  Undo,
  Redo,
  Share2,
} from "lucide-react"
import BackButton from "@/components/ui/BackButton"

export type Tool = "circle" | "rect" | "pencil" | "clear canvas" | "eraser" | "pan" | "select"

export function ClosedCanvas({ roomId, socket }: { socket: WebSocket; roomId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [game, setGame] = useState<Game>()
  const [selectedTool, setSelectedTool] = useState<Tool>("rect")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  // Initialize game with selected tool
  useEffect(() => {
    game?.setTool(selectedTool)
  }, [selectedTool, game])

  // Handle window resizing
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        // Update the canvas size
        const newWidth = window.innerWidth
        const newHeight = window.innerHeight

        // Update the dimensions state
        setDimensions({
          width: newWidth,
          height: newHeight,
        })

        // Update canvas size and clear it on resize
        canvasRef.current.width = newWidth
        canvasRef.current.height = newHeight

        // Clear the canvas after resizing
        game?.clearCanvas()
      }
    }

    window.addEventListener("resize", handleResize)

    return () => window.removeEventListener("resize", handleResize)
  }, [game])

  // Initialize game instance when component mounts or when roomId/socket changes
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
    <div className="h-screen w-screen relative bg-black">
      <BackButton className="fixed top-4 right-4 sm:top-8 sm:right-8 z-50" />
      {/* Canvas with dynamically set width and height */}
      <canvas ref={canvasRef} width={dimensions.width} height={dimensions.height} />
      <Toolbar
        setSelectedTool={setSelectedTool}
        selectedTool={selectedTool}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        roomId={roomId}
      />
    </div>
  )
}

function Toolbar({
  selectedTool,
  setSelectedTool,
  sidebarOpen,
  setSidebarOpen,
  roomId,
}: {
  selectedTool: Tool
  setSelectedTool: (currentTool: Tool) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  roomId: string
}) {
  return (
    <>
      {/* Toggle Button */}
      <button
        className="fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        title={sidebarOpen ? "Close Toolbar" : "Open Toolbar"}
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-64 bg-gray-900 shadow-lg p-4 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out z-40`}
      >
        <h2 className="text-xl font-bold mb-6 mt-16 text-white border-b pb-2">Drawing Tools</h2>

        <div className="grid grid-cols-2 gap-3">
          <IconButton
            onClick={() => setSelectedTool("select")}
            activated={selectedTool === "select"}
            icon={<MousePointer className="w-5 h-5" />}
            name="Select"
          />
          <IconButton
            onClick={() => setSelectedTool("pan")}
            activated={selectedTool === "pan"}
            icon={<Move className="w-5 h-5" />}
            name="Pan"
          />
          <IconButton
            onClick={() => setSelectedTool("pencil")}
            activated={selectedTool === "pencil"}
            icon={<Pencil className="w-5 h-5" />}
            name="Pencil"
          />
          <IconButton
            onClick={() => setSelectedTool("eraser")}
            activated={selectedTool === "eraser"}
            icon={<Eraser className="w-5 h-5" />}
            name="Eraser"
          />
          <IconButton
            onClick={() => setSelectedTool("rect")}
            activated={selectedTool === "rect"}
            icon={<Square className="w-5 h-5" />}
            name="Rectangle"
          />
          <IconButton
            onClick={() => setSelectedTool("circle")}
            activated={selectedTool === "circle"}
            icon={<Circle className="w-5 h-5" />}
            name="Circle"
          />
        </div>

        <h2 className="text-xl font-bold mb-4 mt-8 text-white border-b pb-2">Actions</h2>

        <div className="grid grid-cols-2 gap-3">
          <IconButton
            onClick={() => setSelectedTool("clear canvas")}
            activated={selectedTool === "clear canvas"}
            icon={<Trash2 className="w-5 h-5" />}
            name="Clear All"
            className="bg-red-900 hover:bg-red-800"
          />
          <IconButton
            onClick={() => {
              /* Placeholder for undo */
            }}
            icon={<Undo className="w-5 h-5" />}
            name="Undo"
          />
          <IconButton
            onClick={() => {
              /* Placeholder for redo */
            }}
            icon={<Redo className="w-5 h-5" />}
            name="Redo"
          />
          <IconButton
            onClick={() => {
              /* Placeholder for share */
            }}
            icon={<Share2 className="w-5 h-5" />}
            name="Share"
          />
        </div>

        <div className="absolute bottom-8 left-0 right-0 px-4">
          <div className="text-xs text-gray-400 text-center mb-2">Room ID: {roomId}</div>
          <div className="flex justify-center space-x-4">
            <button className="p-2 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors" title="Save Drawing">
              <Download className="w-5 h-5 text-white" />
            </button>
            <button className="p-2 bg-green-600 rounded-full hover:bg-green-700 transition-colors" title="Load Drawing">
              <Upload className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Access Floating Toolbar (visible when sidebar is closed) */}
      {!sidebarOpen && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 rounded-full px-4 py-2 shadow-lg z-40 flex space-x-2">
          <button
            className={`p-2 rounded-full ${selectedTool === "pencil" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
            onClick={() => setSelectedTool("pencil")}
            title="Pencil"
          >
            <Pencil className="w-5 h-5 text-white" />
          </button>
          <button
            className={`p-2 rounded-full ${selectedTool === "eraser" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
            onClick={() => setSelectedTool("eraser")}
            title="Eraser"
          >
            <Eraser className="w-5 h-5 text-white" />
          </button>
          <button
            className={`p-2 rounded-full ${selectedTool === "select" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
            onClick={() => setSelectedTool("select")}
            title="Select"
          >
            <MousePointer className="w-5 h-5 text-white" />
          </button>
          <button
            className={`p-2 rounded-full ${selectedTool === "pan" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
            onClick={() => setSelectedTool("pan")}
            title="Pan"
          >
            <Move className="w-5 h-5 text-white" />
          </button>
          <div className="w-px h-6 bg-gray-600 self-center"></div>
          <button
            className="p-2 rounded-full bg-red-700 hover:bg-red-600"
            onClick={() => setSelectedTool("clear canvas")}
            title="Clear Canvas"
          >
            <Trash2 className="w-5 h-5 text-white" />
          </button>
        </div>
      )}
    </>
  )
}

