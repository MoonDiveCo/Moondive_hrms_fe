import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/auth/authSlice'
export const makeStore = () => {
  return configureStore({
    reducer: {
         auth: authReducer
    },
  })
}