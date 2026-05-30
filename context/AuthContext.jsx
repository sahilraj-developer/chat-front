import { createContext, useCallback, useEffect, useRef, useState } from "react";
import axios from 'axios'
import toast from "react-hot-toast"
import { io } from "socket.io-client"

const backendUrl = import.meta.env.VITE_BACKEND_URL
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

/* ── helpers ──────────────────────────────────────────────── */
const STORAGE_USER = "wc_user";
const STORAGE_TOKEN = "token";

const readStoredUser = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_USER)) || null; }
  catch { return null; }
};

const saveStoredUser = (user) =>
  localStorage.setItem(STORAGE_USER, JSON.stringify(user));

const clearStorage = () => {
  localStorage.removeItem(STORAGE_TOKEN);
  localStorage.removeItem(STORAGE_USER);
};

/* ── Provider ─────────────────────────────────────────────── */
export const AuthProvider = ({ children }) => {

  // ✅ Initialise synchronously from cache → zero flash on refresh
  const [authUser, setAuthUser]       = useState(readStoredUser);
  const [token, setToken]             = useState(localStorage.getItem(STORAGE_TOKEN));
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket]           = useState(null);
  const socketRef = useRef(null);

  /* ── Socket ────────────────────────────────────────────── */
  const connectSocket = useCallback((userData) => {
    const authToken = localStorage.getItem(STORAGE_TOKEN);
    if (!userData || socketRef.current?.connected || !authToken) return;

    const newSocket = io(backendUrl, {
      auth: { token: authToken },
      reconnectionAttempts: 5,
    });

    newSocket.connect();
    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on("getOnlineUsers", (userIds) => setOnlineUsers(userIds));
  }, []);

  /* ── Background auth verification ─────────────────────── */
  const checkAuth = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/auth/check");
      if (data.success) {
        // Update cache with fresh server data
        setAuthUser(data.user);
        saveStoredUser(data.user);
        connectSocket(data.user);
      } else {
        // Token rejected by server — clear silently
        clearStorage();
        setToken(null);
        setAuthUser(null);
      }
    } catch {
      // Network error or 401 — only log out if we get explicit 401
      // Leave user logged-in optimistically on network failures
      const storedUser = readStoredUser();
      if (!storedUser) {
        clearStorage();
        setToken(null);
        setAuthUser(null);
      }
      // else: keep cached session, user can still use the UI
    }
  }, [connectSocket]);

  /* ── Login ─────────────────────────────────────────────── */
  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, credentials);
      if (data.success) {
        axios.defaults.headers.common["token"] = data.token;
        localStorage.setItem(STORAGE_TOKEN, data.token);
        saveStoredUser(data.userData);
        setToken(data.token);
        setAuthUser(data.userData);
        connectSocket(data.userData);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  /* ── Logout ────────────────────────────────────────────── */
  const logout = async () => {
    clearStorage();
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);
    delete axios.defaults.headers.common["token"];
    socketRef.current?.disconnect();
    socketRef.current = null;
    setSocket(null);
    toast.success("Logged out successfully");
  };

  /* ── Update Profile ────────────────────────────────────── */
  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", body);
      if (data.success) {
        setAuthUser(data.user);
        saveStoredUser(data.user);
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  /* ── Init ──────────────────────────────────────────────── */
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["token"] = token;
      // Re-connect socket for cached session
      const cached = readStoredUser();
      if (cached) connectSocket(cached);
      // Verify silently in background — no loading, no flash
      checkAuth();
    }
  }, []); // run once on mount

  const value = {
    axios, authUser, onlineUsers, socket,
    login, logout, updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};