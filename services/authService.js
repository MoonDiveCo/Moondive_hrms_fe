import apiClient from "../lib/axiosClient";

export const authService ={
    login: async(payload) =>{
        const res = await apiClient.post("/",payload)
        return res.data
    }
}