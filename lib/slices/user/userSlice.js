import { createSlice } from '@reduxjs/toolkit'
const initialState = {
    value:{
            isSignedIn:false,
            user:null,
            loading:false
 }
}

export const authSlice = createSlice({
    name:'auth',
    initialState,
    reducers:{
        signup(state,action){
            state.value.isSignedIn = action.payload.isSignedIn
        },
        login(state,action){
            state.value.loading = true
            state.value.user = action.payload
        }
    }
})
export const {singup,login} =authSlice.actions
export default authSlice.reducer