"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { OpenCanvas } from "@/components/Canvas/OpenCanvas";

export default function FreeCanvas() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token ) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      router.push("/room");
    }
  }, [isLoggedIn, router]); 

  return (
    <>
      <OpenCanvas />
    </>
  );
}
