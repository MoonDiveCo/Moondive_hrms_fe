import apiClient from "../lib/axiosClient";

export const userService ={
    register : async(payload) =>{
        const res = await apiClient.post("user/register",payload)
        return res;
    },
    login: async (payload) => {
        const res = await apiClient.post("user/login",payload)
        return res;
    },
     sendForgotOtp: async (email) => {
    return await apiClient.put("user/sendForgot-PasswordOtp", { email });
  },

  verifyOtp: async (email, otp) => {
    return await apiClient.post("user/verifyotp", { email, otp });
  },

  resendOtp: async (email) => {
    return await apiClient.post("user/resendotp", { email });
  },
  resetPassword: async (email, confirm, password) => {
    return await apiClient.put("user/forgot-password", {
      email,
       confirmNewPassword:confirm,
      newPassword:password
    });
}
}