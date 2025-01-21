"use client";

import { useState, useCallback } from "react";
import { BACKEND_URL } from "@/config";
import axios from "axios";

export default function SigninComponent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // To display error messages

  const handleSignin = useCallback(async () => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/login`, {email, password});
      localStorage.setItem("token", response.data.token);
    }catch(error) {
      console.error(error);
      setErrorMessage("Failed to sign in. Please check your credentials."); // Update error message
    }
  }, [email, password]);

  return (
    <div>
      <h1>Signin</h1>
      <input
        type="email"
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        value={email}
        className="mb-2 p-2 border rounded"
      />
      <input
        type="password"
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        value={password}
        className="mb-2 p-2 border rounded"
      />
      <button
        onClick={handleSignin}
        className="mt-4 p-2 bg-blue-500 text-white rounded"
      >
        Sign In
      </button>
      {errorMessage && <p className="mt-4 text-red-500">{errorMessage}</p>}
    </div>
  );
}
