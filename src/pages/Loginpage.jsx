import React, { useState, useEffect, useCallback, useContext } from 'react'
import assets from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import axios from 'axios'

/* ── Inline icons ─────────────────────────────────────────── */
const EyeIcon = ({ open }) => open ? (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34c759" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const Loginpage = () => {
  const [currState, setCurrState] = useState("Sign Up")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [bio, setBio] = useState("")
  const [isDataSubmitted, setIsDataSubmitted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [emailAvailable, setEmailAvailable] = useState(null)
  const [emailCheckLoading, setEmailCheckLoading] = useState(false)

  const { login } = useContext(AuthContext)
  const navigate = useNavigate()

  const calculatePasswordStrength = useCallback((pwd) => {
    let s = 0
    if (pwd.length >= 8) s++
    if (pwd.length >= 12) s++
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) s++
    if (/\d/.test(pwd)) s++
    if (/[^a-zA-Z0-9]/.test(pwd)) s++
    setPasswordStrength(s)
  }, [])

  const checkEmailAvailability = useCallback(async (emailToCheck) => {
    if (!emailToCheck || !emailToCheck.includes('@')) { setEmailAvailable(null); return }
    setEmailCheckLoading(true)
    try {
      const res = await axios.get(`/api/auth/check-email?email=${emailToCheck}`)
      setEmailAvailable(!res.data.exists)
    } catch { setEmailAvailable(null) }
    finally { setEmailCheckLoading(false) }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => {
      if (currState === "Sign Up" && !isDataSubmitted) checkEmailAvailability(email)
    }, 500)
    return () => clearTimeout(t)
  }, [email, currState, isDataSubmitted, checkEmailAvailability])

  useEffect(() => { calculatePasswordStrength(password) }, [password, calculatePasswordStrength])

  const strengthColor = () => {
    if (passwordStrength === 0) return "#636366"
    if (passwordStrength <= 2) return "#ff3b30"
    if (passwordStrength <= 3) return "#ff9f0a"
    return "#34c759"
  }

  const strengthLabel = () => {
    if (passwordStrength === 0) return "—"
    if (passwordStrength <= 2) return "Weak"
    if (passwordStrength <= 3) return "Fair"
    return "Strong"
  }

  const onSubmitHandler = (e) => {
    e.preventDefault()
    if (currState === "Sign Up" && !isDataSubmitted) { setIsDataSubmitted(true); return }
    login(currState === "Sign Up" ? "signup" : "login", { fullName, email, password, bio })
  }

  const inputStyle = {
    width: "100%",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    color: "#fff",
    padding: "0.875rem 1rem",
    fontSize: "0.9375rem",
    outline: "none",
    transition: "border-color 0.15s",
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "#000" }}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(0,122,255,0.12) 0%, transparent 70%)",
        }}
      />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-20 h-20 rounded-[22px] flex items-center justify-center mb-4"
            style={{ background: "linear-gradient(145deg, #007aff, #0055cc)", boxShadow: "0 8px 24px rgba(0,122,255,0.4)" }}
          >
            <svg width="42" height="42" viewBox="0 0 24 24" fill="white">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white" style={{ letterSpacing: "-0.03em" }}>WhatsChat</h1>
          <p className="text-sm mt-1" style={{ color: "#8e8e93" }}>
            {currState === "Sign Up" ? "Create your account" : "Sign in to continue"}
          </p>
        </div>

        {/* Card */}
        <form
          onSubmit={onSubmitHandler}
          className="flex flex-col gap-4 p-6 rounded-2xl"
          style={{
            background: "rgba(28,28,30,0.9)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-lg font-semibold text-white" style={{ letterSpacing: "-0.02em" }}>
              {isDataSubmitted ? "Almost done!" : currState === "Sign Up" ? "Sign Up" : "Log In"}
            </span>
            {isDataSubmitted && (
              <button type="button" onClick={() => setIsDataSubmitted(false)} style={{ color: "#007aff", fontSize: "0.875rem", fontWeight: 500, background: "none", border: "none", cursor: "pointer" }}>
                ← Back
              </button>
            )}
          </div>

          {/* Full name */}
          {currState === "Sign Up" && !isDataSubmitted && (
            <div>
              <input
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                type="text"
                placeholder="Full Name"
                required
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = "#007aff"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
              />
            </div>
          )}

          {/* Email */}
          {!isDataSubmitted && (
            <div className="relative">
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                type="email"
                placeholder="Email Address"
                required
                style={{ ...inputStyle, paddingRight: "5rem" }}
                onFocus={e => e.target.style.borderColor = "#007aff"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
              />
              {currState === "Sign Up" && email && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {emailCheckLoading ? (
                    <span style={{ fontSize: "0.75rem", color: "#ff9f0a" }}>…</span>
                  ) : emailAvailable === true ? (
                    <><CheckIcon /><span style={{ fontSize: "0.75rem", color: "#34c759" }}>Free</span></>
                  ) : emailAvailable === false ? (
                    <span style={{ fontSize: "0.75rem", color: "#ff3b30" }}>Taken</span>
                  ) : null}
                </div>
              )}
            </div>
          )}

          {/* Password */}
          {!isDataSubmitted && (
            <div>
              <div className="relative">
                <input
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  required
                  style={{ ...inputStyle, paddingRight: "3rem" }}
                  onFocus={e => e.target.style.borderColor = "#007aff"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#636366", background: "none", border: "none", cursor: "pointer" }}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>

              {/* Strength bar */}
              {password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${(passwordStrength / 5) * 100}%`, background: strengthColor() }}
                    />
                  </div>
                  <span style={{ fontSize: "0.75rem", color: strengthColor(), fontWeight: 500, minWidth: "40px" }}>
                    {strengthLabel()}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Forgot password */}
          {currState === "Login" && !isDataSubmitted && (
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-right text-sm font-medium"
              style={{ color: "#007aff", background: "none", border: "none", cursor: "pointer", textAlign: "right" }}
            >
              Forgot Password?
            </button>
          )}

          {/* Bio */}
          {currState === "Sign Up" && isDataSubmitted && (
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={3}
              placeholder="Short bio (optional)"
              style={{ ...inputStyle, resize: "none", lineHeight: "1.45" }}
              onFocus={e => e.target.style.borderColor = "#007aff"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
            />
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={currState === "Sign Up" && !isDataSubmitted && emailAvailable === false}
            style={{
              width: "100%",
              background: "#007aff",
              color: "#fff",
              fontWeight: 600,
              fontSize: "0.9375rem",
              padding: "0.875rem",
              borderRadius: "12px",
              border: "none",
              cursor: "pointer",
              transition: "opacity 0.15s",
              marginTop: "0.25rem",
              letterSpacing: "-0.01em",
            }}
          >
            {currState === "Sign Up"
              ? isDataSubmitted ? "Create Account" : "Continue"
              : "Log In"
            }
          </button>

          {/* Terms */}
          <div className="flex items-center gap-2" style={{ fontSize: "0.8125rem", color: "#8e8e93" }}>
            <input type="checkbox" className="w-4 h-4" style={{ accentColor: "#007aff" }} />
            <span>I agree to the Terms & Privacy Policy</span>
          </div>

          {/* Switch */}
          <p style={{ fontSize: "0.875rem", color: "#8e8e93", textAlign: "center" }}>
            {currState === "Sign Up" ? (
              <>Already have an account?{" "}
                <span onClick={() => { setCurrState("Login"); setIsDataSubmitted(false) }} style={{ color: "#007aff", fontWeight: 600, cursor: "pointer" }}>
                  Log in
                </span>
              </>
            ) : (
              <>New to WhatsChat?{" "}
                <span onClick={() => setCurrState("Sign Up")} style={{ color: "#007aff", fontWeight: 600, cursor: "pointer" }}>
                  Sign up
                </span>
              </>
            )}
          </p>
        </form>
      </div>
    </div>
  )
}

export default Loginpage
