import React, { useContext } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import Loginpage from './pages/Loginpage'
import ProfilePage from './pages/ProfilePage'
import PublicProfilePage from './pages/PublicProfilePage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import { Toaster } from "react-hot-toast"
import { AuthContext } from '../context/AuthContext'
import StoryViewer from './components/stories/StoryViewer'
import StoryCreator from './components/stories/StoryCreator'

/* ─────────────────────────────────────────────────────────
   Route Guards (no loading flash — authUser is sync from cache)
   ───────────────────────────────────────────────────────── */
const ProtectedRoute = ({ children }) => {
  const { authUser } = useContext(AuthContext)
  return authUser ? children : <Navigate to="/login" replace />
}

const GuestRoute = ({ children }) => {
  const { authUser } = useContext(AuthContext)
  return authUser ? <Navigate to="/" replace /> : children
}

/* ─────────────────────────────────────────────────────────
   App
   ───────────────────────────────────────────────────────── */
const App = () => {
  return (
    <div className="wa-app min-h-screen">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#1c1c1e",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px",
            fontSize: "0.9rem",
          },
        }}
      />

      {/* Global story overlays — available on all protected pages */}
      <StoryViewer />
      <StoryCreator />

      <Routes>
        {/* ── Protected: requires login ── */}
        <Route path="/" element={
          <ProtectedRoute><HomePage /></ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute><ProfilePage /></ProtectedRoute>
        } />
        <Route path="/profile/:userId" element={
          <ProtectedRoute><PublicProfilePage /></ProtectedRoute>
        } />

        {/* ── Guest-only: redirect logged-in users away ── */}
        <Route path="/login" element={
          <GuestRoute><Loginpage /></GuestRoute>
        } />
        <Route path="/forgot-password" element={
          <GuestRoute><ForgotPasswordPage /></GuestRoute>
        } />

        {/* ── Works in both auth states ── */}
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* ── 404 fallback ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
