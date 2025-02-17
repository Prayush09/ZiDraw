"use client"

import { useRef, useState, useEffect } from "react"
import { FreeGame } from "@/app/draw/FreeGame"
import { IconButton } from "./IconButton"
import { Circle, Pencil, RectangleHorizontalIcon, Eraser, ClipboardX, X, Menu, ChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/app/lib/utils"

export type Tool = "circle" | "rect" | "pencil" | "clear canvas" | "eraser"

export function OpenCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [game, setGame] = useState<FreeGame | null>(null)
  const [selectedTool, setSelectedTool] = useState<Tool>("pencil")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 }) 

  useEffect(() => {
    if (canvasRef.current) {
      const currentGame = new FreeGame(canvasRef.current)
      setGame(currentGame)
    }
  }, [])

  useEffect(() => {
    setDimensions({ width: window.innerWidth, height: window.innerHeight })
  }, [])

  useEffect(() => {
    if (game) {
      game.setTool(selectedTool)
    }
  }, [selectedTool, game])

  useEffect(() => {
    return () => {
      if (game) {
        game.destroy()
      }
    }
  }, [game])

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const sidebar = document.getElementById('sidebar')
      const menuButton = document.getElementById('menu-button')
      if (
        isSidebarOpen &&
        sidebar &&
        !sidebar.contains(event.target as Node) &&
        menuButton &&
        !menuButton.contains(event.target as Node)
      ) {
        setIsSidebarOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isSidebarOpen])

  return (
    <div className="h-screen overflow-hidden relative bg-black">
      <canvas 
        ref={canvasRef} 
        width={window.innerWidth} 
        height={window.innerHeight} 
        className="touch-none bg-black" 
      />
      <Toolbar
        selectedTool={selectedTool}
        setSelectedTool={setSelectedTool}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      
      
      <div 
        className={cn(
          "fixed inset-0 bg-white/10 backdrop-blur-sm transition-opacity md:hidden",
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        aria-hidden="true"
      />
    </div>
  )
}

function Toolbar({
  selectedTool,
  setSelectedTool,
  isSidebarOpen,
  setIsSidebarOpen,
}: {
  selectedTool: Tool
  setSelectedTool: (tool: Tool) => void
  isSidebarOpen: boolean
  setIsSidebarOpen: (isOpen: boolean) => void
}) {
  const router = useRouter()

  function closeCanvas() {
    router.push("/")
  }

  const tools = [
    { id: "pencil", icon: <Pencil className="w-5 h-5" />, name: "Pencil" },
    { id: "circle", icon: <Circle className="w-5 h-5" />, name: "Circle" },
    { id: "rect", icon: <RectangleHorizontalIcon className="w-5 h-5" />, name: "Rectangle" },
    { id: "eraser", icon: <Eraser className="w-5 h-5" />, name: "Eraser" },
    { id: "clear canvas", icon: <ClipboardX className="w-5 h-5" />, name: "Clear Canvas" },
  ] as const

  return (
    <>
      {/* Mobile menu button */}
      <button
        id="menu-button"
        className={cn(
          "fixed top-4 left-4 z-50 md:hidden",
          "rounded-full p-2 bg-zinc-900 text-white shadow-lg",
          "hover:bg-zinc-800 transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        )}
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? (
          <ChevronLeft className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Sidebar */}
      <div
        id="sidebar"
        className={cn(
          "fixed top-0 left-0 h-full bg-zinc-900/95 backdrop-blur-md shadow-lg",
          "transition-all duration-300 ease-in-out transform",
          "flex flex-col items-center",
          "border-r border-zinc-800",
          "md:translate-x-0 md:w-20",
          isSidebarOpen ? "translate-x-0 w-20" : "-translate-x-full w-20",
          "z-40"
        )}
      >
        <div className="flex flex-col items-center pt-16 md:pt-4 h-full w-full">
          <div className="space-y-2">
            {tools.map((tool) => (
              <IconButton
                key={tool.id}
                onClick={() => {
                  setSelectedTool(tool.id)
                  if (window.innerWidth < 768) {
                    setIsSidebarOpen(false)
                  }
                }}
                activated={selectedTool === tool.id}
                icon={tool.icon}
                name={tool.name}
              />
            ))}
          </div>
          
          <div className="flex-grow" />
          
          <div className="pb-4">
            <IconButton
              onClick={closeCanvas}
              icon={<X className="w-5 h-5" />}
              name="Close"
              className="hover:bg-red-900/50 hover:text-red-400"
            />
          </div>
        </div>
      </div>
    </>
  )
}