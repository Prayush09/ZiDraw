//add backend calls here
"use server"
import axios from 'axios';

export default async function Signin(email: string, password: string){
    const response = await axios.post(`${BACKEND_URL}/signin`, {email, password});
    //complete the rest of this logic by 21st of the month
}