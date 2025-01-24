"use client";
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createRoom } from '@/app/hooks/createRoom';
import { useRouter } from 'next/navigation';

export default function Room() {
  const [name, setName] = useState("");
  const router = useRouter();
  const [isValidated, setIsValidated] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setIsValidated(localStorage.getItem('token') !== null);
  }, []);

  const joinRoom = useCallback(async (e: any) => {
    e.preventDefault();

    if (!name.trim()) {
      setErrorMessage("Please enter a room name.");
      return;
    }

    try {
      const response = await createRoom(name);
      router.push(`/canvas/${response.roomId}`);
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to create room. Please try again.");
    }
  }, [name, router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-black text-white relative overflow-hidden">
      <svg 
        className="absolute inset-0 z-0 opacity-20" 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 1440 320"
      >
        <path 
          fill="#ffffff" 
          fillOpacity="0.1" 
          d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,170.7C672,149,768,139,864,154.7C960,171,1056,213,1152,218.7C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320L192,320L96,320L0,320Z"
        ></path>
      </svg>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-center w-full max-w-md p-8 bg-black/40 rounded-xl shadow-2xl"
      >
        <motion.h1 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-bold mb-8 text-white"
        >
          Room Manager
        </motion.h1>

        <AnimatePresence mode="wait">
          {isValidated ? (
            <form onSubmit={joinRoom} className="space-y-4">
              <motion.input 
                type="text" 
                placeholder="Enter a room name" 
                value={name} 
                required
                onChange={e => setName(e.target.value)}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <motion.button 
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full p-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
              >
                Join Room
              </motion.button>

              {errorMessage && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-red-500 mt-4"
                >
                  {errorMessage}
                </motion.p>
              )}
            </form>
          ) : (
            <motion.div
              key="signin-prompt"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <p className="mb-4 text-white/80">Please sign in to join a room.</p>
              <motion.button 
                onClick={() => router.push("/signin")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full p-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
              >
                Sign in
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}