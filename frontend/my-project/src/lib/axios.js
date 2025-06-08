// setting up the axios default url
import axios from 'axios'
export const axiosInstance =axios.create({
    baseURL:"https://chatappbackend-7t5n.onrender.com/api",
    withCredentials:true
})
