"use client";

import { useState } from "react";
import { Signup } from "@/components/Auth/Auth";

export default function SignupComponent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState(""); // For showing success/error messages

  const handleSignup = async () => {
    try {
      // Call the Signup function and await its result
      const response = await Signup(name, email, password);
      setMessage("Signup successful!"); // Display success message
    } catch (error) {
      setMessage("Signup failed. Please try again."); // Display error message
    }
  };

  return (
    <div>
      <h1>Signup</h1>
      <input
        type="text"
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        value={name}
        className="mb-2 p-2 border rounded"
      />
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
        onClick={handleSignup}
        className="mt-4 p-2 bg-blue-500 text-white rounded"
      >
        Sign Up
      </button>
      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}
