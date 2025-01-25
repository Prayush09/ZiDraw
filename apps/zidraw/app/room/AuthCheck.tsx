"use client";

import { useEffect, useState } from "react";

export default function AuthCheck({ children }: { children: React.ReactNode }) {
  const [isValidated, setIsValidated] = useState(false);

  useEffect(() => {
    setIsValidated(localStorage.getItem("token") !== null);
  }, []);

  return isValidated ? <>{children}</> : <SignInPrompt />;
}

function SignInPrompt() {
  return (
    <div className="space-y-4">
      <p className="mb-4 text-white/80">Please sign in to join a room.</p>
      <button
        onClick={() => window.location.replace("/signin")}
        className="w-full p-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
      >
        Sign in
      </button>
    </div>
  );
}
