import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import Loginpage from './pages/Loginpage'
import ProfilePage from './pages/ProfilePage'
// import assets from './assets/assets'
import {Toaster} from "react-hot-toast"
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'


const App = () => {
  const {authUser} = useContext(AuthContext)
  return (
    <div className="bg-[url('/bgImage.svg')] bg-contain">
      <Toaster/>
      <Routes>
         <Route path="/" element={authUser ? <HomePage/> : <Navigate to="/login"/>}/>
         <Route path="/login" element={ !authUser ? <Loginpage/> : <Navigate to="/"/>}/>
         <Route path="/profile" element={ authUser ? <ProfilePage/> : <Navigate to="/login"/>}/>
      </Routes>
    </div>
  )
  
}

export default App
