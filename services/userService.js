import apiClient from "../lib/axiosClient";

export const userService ={
    register : async(payload) =>{
        const res = await apiClient.post("user/register",payload)
        return res;
    }
}