//add backend calls here
"use server"
import axios from 'axios';
import { BACKEND_URL } from '@/config';

export async function Signup(name: string, email: string, password: string) {
    const response = await axios.post(`${BACKEND_URL}/api/signup`, {name, email, password});    
    console.log(response.data);
    return response.data;
}

