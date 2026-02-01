import axios from 'axios'
import { API_BASE_URL } from './config.js'

const api = axios.create({
    baseURL : API_BASE_URL,
    withCredentials : true
})

export const register = async(values)=>{
    try {
       const response = await api.post('/api/auth/register' , values)
       return response.data
    } catch (error) {
        console.log(error)
    }
}

export const login = async(values)=>{
    try {
       const response = await api.post('/api/auth/login' , values)
       return response.data
    } catch (error) {
        console.log(error)
    }
}


export const getCurrentUser = async()=>{
    try {
       const response = await api.get('/api/auth/current-user' ,{withCredentials:true} )
       // Ensure consistent user data structure
       console.log("Booking Status ",response)
       if (response.data && typeof response.data === 'object') {
         return {
           _id: response.data._id,
           name: response.data.name,
           email: response.data.email,
           role: response.data.role,
         };
       }
       return response.data;
    } catch (error) {
        console.log('Error getting current user:', error.response?.data || error.message)
        // Return null instead of undefined when there's an error
        return null
    }
}

export const logout = async()=>{
    try {
       const response = await api.post('/api/auth/logout' ,{withCredentials:true} )
       return response.data
    } catch (error) {
        console.log('Error logging out:', error.response?.data || error.message)
        return { success: false, message: 'Logout failed' }
    }
}

export const forgotPassword = async(email)=>{
    try {
       const response = await api.post('/api/auth/forgot-password' , { email })
       return response.data
    } catch (error) {
        console.log('Error requesting password reset:', error.response?.data || error.message)
        return { success: false, message: error.response?.data?.message || 'Failed to request password reset' }
    }
}

export const resetPassword = async(token, password)=>{
    try {
       const response = await api.post('/api/auth/reset-password' , { token, password })
       return response.data
    } catch (error) {
        console.log('Error resetting password:', error.response?.data || error.message)
        return { success: false, message: error.response?.data?.message || 'Failed to reset password' }
    }
}


