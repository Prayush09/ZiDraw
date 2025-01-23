//add backend calls here
"use server"
import axios from 'axios';
import { BACKEND_URL } from '@/config';

export async function Signup(name: string, email: string, password: string): Promise<{token: string}> {
    if (!name || !email || !password) {
        throw new Error("Name, email, and password are required");
    }

    try {
        const response = await axios.post(`${BACKEND_URL}/api/signup`, {name, email, password});
        if (!response.data) {
            throw new Error("Invalid signup response");
        }

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response && error.response.status === 409) {
                throw new Error("User already exists");
            }
        }
        throw error;
    }
}

export async function Signin(email: string, password: string): Promise<{token: string}> {
    if (!email || !password) {
        throw new Error("Email and password are required");
    }

    try {
        const response = await axios.post(`${BACKEND_URL}/api/login`, {email, password});
        if (!response.data || !response.data.token) {
            throw new Error("Invalid signin response");
        }
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response && error.response.status === 401) {
                throw new Error("Invalid credentials");
            }
        }

        throw error;
    }
}
