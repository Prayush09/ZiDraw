"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PenLine, Users, Zap, Share2, ArrowRight, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      icon: <PenLine className="w-6 h-6" />,
      title: "Smart Drawing Tools",
      description: "Intuitive tools that make digital drawing feel natural and responsive, adapting to your unique creative workflow"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Real-time Collaboration",
      description: "Work together seamlessly with multiple team members, sharing ideas and making changes in real-time across different devices"
    },
    {
      icon: <Share2 className="w-6 h-6" />,
      title: "Instant Sharing",
      description: "Share your creations with just one click, generating shareable links and collaborative workspaces instantly"
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Smart Features",
      description: "AI-powered tools to enhance your creativity, offering intelligent suggestions and automated design improvements"
    }
  ];

  return (
    <div className="w-full min-h-screen bg-black text-white relative overflow-hidden">
      <motion.svg 
        className="absolute inset-0 z-0 opacity-20" 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 1440 320"
      >
        <path 
          fill="#ffffff" 
          fillOpacity="0.1" 
          d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,170.7C672,149,768,139,864,154.7C960,171,1056,213,1152,218.7C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320L192,320L96,320L0,320Z"
        ></path>
      </motion.svg>

      {/* Navbar */}
      <motion.nav 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed w-full top-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-black/80 backdrop-blur-lg shadow-sm" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 group">
                <PenLine className="w-6 h-6 text-white transition-transform group-hover:rotate-12" />
                <span className="text-2xl font-bold text-white">
                  Zi-Draw |
                </span> 
              </div>
              <span className="hidden sm:block text-sm text-white/70">
                Draw your own conclusions
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/Auth/Signin">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 text-sm font-medium text-white hover:text-black rounded-lg hover:bg-white transition-colors"
                >
                  Sign in
                </motion.button>
              </Link>
              <Link href="/Auth/Signup">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 text-sm font-medium bg-white text-black hover:text-white rounded-lg hover:bg-black/90 transition-colors"
                >
                  Sign up
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="pt-48 pb-48 sm:pt-64 sm:pb-64 relative z-10"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-5xl sm:text-7xl font-bold tracking-tight mb-8 text-white"
          >
            Collaborative Whiteboarding
            <span className="block mt-4 text-white/80">Made Simple</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mx-auto max-w-3xl text-xl text-white/70 mb-16"
          >
            Create, collaborate, and share beautiful diagrams and sketches with our
            intuitive drawing tool. Experience the future of digital collaboration 
            with seamless, real-time interaction and intelligent design capabilities.
          </motion.p>
          <Link href="/canvas">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group px-8 py-4 text-lg bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-all duration-300"
            >
              Start Drawing
              <ArrowRight className="inline-block ml-3 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </Link>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="py-32 bg-white/5 relative z-10"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-8 text-white">Features</h2>
          <p className="text-center text-white/70 mb-16 max-w-3xl mx-auto text-lg">
            Discover how Zi-Draw transforms your creative process with powerful features
            designed for modern collaboration, enabling seamless and intelligent digital creation.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="group relative p-8 rounded-xl bg-white/10 border border-white/20 hover:border-white/40 transition-all duration-300 cursor-pointer h-full"
                onMouseEnter={() => setActiveFeature(index)}
                onMouseLeave={() => setActiveFeature(null)}
              >
                <div className="relative h-full">
                  <div className={`
                    h-16 w-16 rounded-full bg-white/10 flex items-center justify-center mb-6
                    transform transition-transform duration-300
                    ${activeFeature === index ? "scale-110" : ""}
                  `}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-white">{feature.title}</h3>
                  <p className="text-base text-white/70 flex-grow">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="py-32 relative z-10"
      >
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-6 text-white">Ready to start creating?</h2>
            <p className="text-xl text-white/70 mb-12">
              Join thousands of teams already using Zi-Draw to bring their ideas to life. 
              Transform your creative workflow with our cutting-edge collaborative platform.
            </p>
            <Link href="/Auth/Signup">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-5 text-lg bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-all duration-300"
              >
                Get Started Free
                <Zap className="inline-block ml-3 group-hover:scale-110 transition-transform" />
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
