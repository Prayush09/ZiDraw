"use client"

import type React from "react"

interface IconButtonProps {
  onClick: () => void
  icon: React.ReactNode
  name: string
  activated?: boolean
  className?: string
}

export function IconButton({ onClick, icon, name, activated = false, className = "" }: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-3 rounded-lg transition-colors ${
        activated ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
      } ${className}`}
    >
      {icon}
      <span className="text-xs mt-1">{name}</span>
    </button>
  )
}

