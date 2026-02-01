// client/src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { getCurrentUser } from '../calls/authCalls'
import { setUserData } from '../redux/userSlice'
import { Spin } from 'antd'

function ProtectedRoute({children}) {
     const {userData} = useSelector(state =>state.user)
     
     if(!userData){
        return <Navigate to='/login'/>
     }
     return children
}

export default ProtectedRoute