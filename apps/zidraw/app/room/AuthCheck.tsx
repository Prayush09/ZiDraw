"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import ParticleBackground from "@/components/ui/ParticleBackground"
import type React from "react"
import Load from "@/components/ui/loading"

export default function AuthCheck({ children }: { children: React.ReactNode }) {
  const [isValidated, setIsValidated] = useState<boolean | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setIsValidated(localStorage.getItem("token") !== null)
    }
    checkAuth()
  }, [])

  if (isValidated === null) {
    return <Load />
  }

  return isValidated ? <>{children}</> : <SignInPrompt />
}

function SignInPrompt() {
  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-black">
      <ParticleBackground />

      {/* Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md p-8 mx-4 text-center bg-white/5 backdrop-blur-lg rounded-2xl shadow-xl border border-white/10"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }}
          className="w-20 h-20 mx-auto mb-6 bg-white rounded-full flex items-center justify-center"
        >
          <svg
            className="w-12 h-12 text-black"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
            />
          </svg>
        </motion.div>

        <h2 className="mb-4 text-3xl font-bold text-white">Welcome!</h2>
        <p className="mb-8 text-lg text-white/80">Please sign in to access this content.</p>

        {/* Sign In Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.location.replace("/Auth/Signin")}
          className="w-full py-3 text-lg font-medium text-black transition-all duration-300 bg-white rounded-lg hover:bg-gray-200"
        >
          Sign in
        </motion.button>
      </motion.div>
    </div>
  )
}

