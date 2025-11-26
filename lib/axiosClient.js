import axios from "axios";
const apiClient = axios.create({
    baseURL:process.env.NEXT_PUBLIC_API_URL ||"http://localhost:2000/api/v1/",
    timeout:15000,
    withCredentials:true,
   headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
})


apiClient.interceptors.request.use(
    (config) =>{
       
        return config;
    },
    (error) => Promise.reject(error)
)

apiClient.interceptors.response.use(
    (response) => response,
    (error) =>{
        const normalized = {
            //    status: error.response?
            // message:
            // data:
        }
        const err = new Error(normalized.message)
         err.status = normalized.status;
    err.data = normalized.data;
    return Promise.reject(err);
    }
)

export default apiClient;