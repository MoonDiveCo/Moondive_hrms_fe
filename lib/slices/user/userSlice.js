import { createSlice } from '@reduxjs/toolkit'
const initialState = {
    value:{
            isSignedIn:false
 }
}

export const authSlice = createSlice({
    name:'auth',
    initialState,
    reducers:{
        signup(state,action){
            state.value.isSignedIn = action.payload.isSignedIn
        }
    }
})
export const {singup} =authSlice.actions
export default authSlice.reducer