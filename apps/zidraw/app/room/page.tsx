// RoomForm.tsx
"use client"; // For Next.js Client Component

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import AuthCheck from "./AuthCheck";


export default function RoomForm() {
  const router = useRouter();

  const handleRoomAction = (action: "create" | "join") => {
      if (action === "create") {
        router.push("/room/create"); 
      } else if (action === "join") {
        router.push("/room/join"); 
    };
  }

  return (
    <AuthCheck>
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-black text-white relative overflow-hidden">
      <motion.div className="relative z-10 text-center w-full max-w-md p-8 bg-black/40 rounded-xl shadow-2xl">
        <h1 className="text-4xl font-bold mb-6">Welcome to Room Manager</h1>
        <div className="space-y-4">
          <motion.button
            onClick={() => handleRoomAction("create")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full p-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
          >
            Create Room
          </motion.button>
          <motion.button
            onClick={() => handleRoomAction("join")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full p-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
          >
            Join Room
          </motion.button>
        </div>
      </motion.div>
    </div>
    </AuthCheck>
  );
  
}
