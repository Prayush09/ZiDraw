"use client";

import Link from "next/link";
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
      description: "Intuitive tools that make digital drawing feel natural"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Real-time Collaboration",
      description: "Work together seamlessly with your team members"
    },
    {
      icon: <Share2 className="w-6 h-6" />,
      title: "Instant Sharing",
      description: "Share your creations with just one click"
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Smart Features",
      description: "AI-powered tools to enhance your creativity"
    }
  ];

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-background via-background to-secondary/20">
      {/* Navbar */}
      <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/80 backdrop-blur-lg shadow-sm" : "bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 group">
                <PenLine className="w-6 h-6 text-primary transition-transform group-hover:rotate-12" />
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                  Zi-Draw |
                </span> 
              </div>
              <span className="hidden sm:block text-sm text-muted-foreground">
                Draw your own conclusions
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/Auth/Signin">
                <button className="px-4 py-2 text-sm font-medium text-white hover:text-black rounded-lg hover:bg-white transition-colors">
                  Sign in
                </button>
              </Link>
              <Link href="/Auth/Signup">
                <button className="px-4 py-2 text-sm font-medium bg-white text-black hover:text-white rounded-lg hover:bg-black/90 transition-colors">
                  Sign up
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 sm:pt-40 sm:pb-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-white/90 to-/80">
            Collaborative Whiteboarding
            <span className="block mt-2 text-foreground">Made Simple</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground mb-10">
            Create, collaborate, and share beautiful diagrams and sketches with our
            intuitive drawing tool. Experience the future of digital collaboration.
          </p>
          <Link href="/canvas">
            <button className="group px-6 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg font-medium hover:shadow-lg hover:from-primary/90 hover:to-primary/70 transition-all duration-300">
              Start Drawing
              <ArrowRight className="inline-block ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Features</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Discover how Zi-Draw transforms your creative process with powerful features
            designed for modern collaboration.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative p-6 rounded-xl bg-card border shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setActiveFeature(index)}
                onMouseLeave={() => setActiveFeature(null)}
              >
                <div className={`
                  absolute inset-0 rounded-xl transition-opacity duration-300
                  bg-gradient-to-br from-primary/5 to-primary/10
                  opacity-0 group-hover:opacity-100
                `} />
                <div className="relative">
                  <div className={`
                    h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4
                    transform transition-transform duration-300
                    ${activeFeature === index ? "scale-110" : ""}
                  `}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Ready to start creating?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of teams already using Zi-Draw to bring their ideas to life
            </p>
            <Link href="/Auth/Signup">
              <button className="group px-8 py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all duration-300">
                Get Started Free
                <Zap className="inline-block ml-2 group-hover:scale-110 transition-transform" />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}