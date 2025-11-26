import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/user/userSlice'
export const makeStore = () => {
  return configureStore({
    reducer: {
         auth: authReducer
    },
  })
}