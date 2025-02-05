"use client"; // For Next.js Client Component

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createRoom } from "@/app/draw/http"; // Assuming this is your API function
import BackButton from "@/components/ui/BackButton";

export default function CreateRoom() {
  const [name, setName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await createRoom(name);
      console.log("Room created successfully:", response);
      router.push(`/canvas/${response.data.roomId}`); // Redirect to the room's canvas
    } catch (error) {
      console.error("Error creating room:", error);
      setErrorMessage("Failed to create room. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-black text-white relative overflow-hidden">
    <BackButton label="Go back"></BackButton>
      <motion.div className="relative z-10 text-center w-full max-w-md p-8 bg-black/40 rounded-xl shadow-2xl">
        <h1 className="text-4xl font-bold mb-6">Create Room</h1>
        <form onSubmit={handleCreateRoom} className="space-y-4">
          <motion.input
            type="text"
            placeholder="Enter room name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30"
          />
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full p-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
          >
            Create Room
          </motion.button>
        </form>
        {errorMessage && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-red-500 mt-4">
            {errorMessage}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
