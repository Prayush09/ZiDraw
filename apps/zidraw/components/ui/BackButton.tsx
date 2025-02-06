"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  label?: string; // Optional prop for a custom label
  className?: string;
}

export default function BackButton({ label = "Back to Main", className }: BackButtonProps) {
  const router = useRouter();

  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      onClick={() => router.push("/room")} 
      className={`${className ? className : "absolute top-6 left-6 text-white hover:bg-white/10 p-2 rounded-full transition duration-300 flex items-center gap-2"}`}
    >
      <ArrowLeft size={24} />
      <span className="text-sm hidden md:inline">{label}</span>
    </motion.button>
  );
}
