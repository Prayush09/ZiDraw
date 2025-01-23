"use client";
import { useState } from "react";
import { Signup } from "@/components/Auth/Auth";
import { Lock, Mail, User, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SignupComponent() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const handleSignup = async () => {
    try {
      const response = await Signup(name, email, password);
      setMessage("Signup successful!");
    } catch (error) {
      setMessage("Signup failed. Please try again.");
    }
  };

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
        <path 
          d="M0 311L48 289.3C96 267.7 192 224.3 288 208.8C384 193.3 480 206.7 576 236.2C672 265.7 768 311.3 864 320.3C960 329.3 1056 301.7 1152 274C1248 246.3 1344 218.7 1392 204.8L1440 191V810H1392C1344 810 1248 810 1152 810C1056 810 960 810 864 810C768 810 672 810 576 810C480 810 384 810 288 810C192 810 96 810 48 810H0V311Z" 
          fill="white" 
          fillOpacity="0.05"
        />
        <path 
          d="M0 540L48 526.2C96 512.3 192 484.7 288 465.3C384 446 480 435 576 424.2C672 413.3 768 402.7 864 424.5C960 446.3 1056 500.7 1152 516.3C1248 532 1344 509 1392 497.5L1440 486V810H1392C1344 810 1248 810 1152 810C1056 810 960 810 864 810C768 810 672 810 576 810C480 810 384 810 288 810C192 810 96 810 48 810H0V540Z" 
          fill="white" 
          fillOpacity="0.08"
        />
      </svg>

      <button 
        onClick={() => router.push("/")} 
        className="absolute top-6 left-6 text-white hover:bg-white/10 p-2 rounded-full transition duration-300"
      >
        <ArrowLeft size={24} />
      </button>

      <div className="w-full max-w-md bg-black border-2 border-white shadow-2xl rounded-2xl p-8 space-y-6 relative z-10">
        <h1 className="text-3xl font-bold text-center text-white mb-6">
          Sign Up
        </h1>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white" />
          <input
            type="text"
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            value={name}
            className="w-full pl-10 p-3 bg-black border-2 border-white text-white rounded-lg focus:outline-none focus:border-gray-300 transition duration-300"
          />
        </div>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white" />
          <input
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            value={email}
            className="w-full pl-10 p-3 bg-black border-2 border-white text-white rounded-lg focus:outline-none focus:border-gray-300 transition duration-300"
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white" />
          <input
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            value={password}
            className="w-full pl-10 p-3 bg-black border-2 border-white text-white rounded-lg focus:outline-none focus:border-gray-300 transition duration-300"
          />
        </div>
        <button
          onClick={handleSignup}
          className="w-full p-3 bg-white text-black rounded-lg hover:bg-gray-200 transition duration-300 ease-in-out transform hover:scale-105"
        >
          Sign Up
        </button>
        {message && (
          <p className="text-center text-red-500 mt-4">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}