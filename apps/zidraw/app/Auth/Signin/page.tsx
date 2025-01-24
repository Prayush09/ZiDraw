"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Signin } from "@/components/Auth/Auth";
import { Lock, Mail, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SigninComponent() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignin = async (e: any) => {
    e.preventDefault();
    
    if (!email || !password) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    try {
      const response = await Signin(email, password);
      localStorage.setItem("token", response.token);
      router.push("/room");
    } catch(error) {
      console.error(error);
      setErrorMessage("Failed to sign in. Please check your credentials.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 relative overflow-hidden">
      <svg 
        className="absolute inset-0 w-full h-full" 
        viewBox="0 0 1440 810" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.2"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#gridPattern)" />
      </svg>

      <motion.button 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        onClick={() => router.push("/")} 
        className="absolute top-6 left-6 text-white hover:bg-white/10 p-2 rounded-full transition duration-300"
      >
        <ArrowLeft size={24} />
      </motion.button>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-black border-2 border-white shadow-2xl rounded-2xl p-8 space-y-6 relative z-10"
      >
        <motion.h1 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-center text-white mb-6"
        >
          Sign In
        </motion.h1>

        <form onSubmit={handleSignin} className="space-y-4">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="relative"
          >
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white" />
            <input
              type="email"
              required
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              value={email}
              className="w-full pl-10 p-3 bg-black border-2 border-white text-white rounded-lg focus:outline-none focus:border-gray-300 transition duration-300"
            />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="relative"
          >
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white" />
            <input
              type="password"
              required
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              value={password}
              className="w-full pl-10 p-3 bg-black border-2 border-white text-white rounded-lg focus:outline-none focus:border-gray-300 transition duration-300"
            />
          </motion.div>

          <motion.button
            type="submit"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full p-3 bg-white text-black rounded-lg hover:bg-gray-200 transition duration-300 ease-in-out"
          >
            Sign In
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
      </motion.div>
    </div>
  );
}