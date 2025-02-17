"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { OpenCanvas } from "@/components/Canvas/OpenCanvas";

export default function FreeCanvas() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Move localStorage access to useEffect to ensure it only runs client-side
    try {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      setIsLoggedIn(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      router.push("/room");
    }
  }, [isLoggedIn, router]); 

  return <OpenCanvas />;
}