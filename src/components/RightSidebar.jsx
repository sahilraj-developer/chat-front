import React, { useContext, useEffect, useState } from "react";
import assets from "../assets/assets";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import { CallContext } from "../../context/CallContext";
import { formatCallDate, getCallLabel } from "../lib/utils";

/* ── Icons ───────────────────────────────────────────────── */
const PhoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.59a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);
const VideoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
  </svg>
);
const PhoneOutIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
const PhoneInIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

const RightSidebar = () => {
  const { selectedChat, messages } = useContext(ChatContext);
  const { onlineUsers, authUser, axios } = useContext(AuthContext);
  const { startCall, callHistoryVersion } = useContext(CallContext);
  const [msgImages, setMsgImages] = useState([]);
  const [callHistory, setCallHistory] = useState([]);
  const [loadingCalls, setLoadingCalls] = useState(false);

  useEffect(() => {
    setMsgImages(messages.filter(m => m.image).map(m => m.image));
  }, [messages]);

  useEffect(() => {
    const fetchCalls = async () => {
      if (!selectedChat || selectedChat.type !== "user" || !axios) { setCallHistory([]); return; }
      setLoadingCalls(true);
      try {
        const { data } = await axios.get(`/api/calls/history/${selectedChat.data._id}`);
        if (data.success) setCallHistory(data.calls);
      } catch { setCallHistory([]); }
      finally { setLoadingCalls(false); }
    };
    fetchCalls();
  }, [selectedChat, axios, callHistoryVersion]);

  if (!selectedChat) return null;

  const isUser = selectedChat.type === "user";
  const data = selectedChat.data;
  const isOnline = isUser && onlineUsers.includes(data._id);

  const SectionLabel = ({ children }) => (
    <p
      className="px-4 pt-4 pb-1 text-xs font-semibold uppercase tracking-wider"
      style={{ color: "#8e8e93" }}
    >
      {children}
    </p>
  );

  const ActionButton = ({ icon, label, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1.5"
      style={{ cursor: "pointer", background: "none", border: "none" }}
    >
      <span
        className="flex items-center justify-center w-11 h-11 rounded-full transition-colors"
        style={{ background: "rgba(0,122,255,0.12)", color: "#007aff" }}
      >
        {icon}
      </span>
      <span style={{ fontSize: "0.75rem", color: "#007aff", fontWeight: 500 }}>{label}</span>
    </button>
  );

  return (
    <div
      className="wa-details-panel hidden lg:flex flex-col min-h-0 overflow-y-auto"
      style={{ background: "#0a0a0a" }}
    >
      {/* ── Profile header ── */}
      <div
        className="flex flex-col items-center text-center px-6 pt-8 pb-6"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        {/* Avatar */}
        {isUser ? (
          <div className="relative">
            <img
              src={data.profilePic || assets.avatar_icon}
              alt=""
              className="rounded-full object-cover"
              style={{ width: "96px", height: "96px" }}
            />
            {isOnline && (
              <span
                className="absolute bottom-1 right-1 w-4 h-4 rounded-full"
                style={{ background: "#34c759", border: "2.5px solid #0a0a0a" }}
              />
            )}
          </div>
        ) : (
          <div
            className="rounded-full flex items-center justify-center text-3xl font-bold text-white wa-avatar-placeholder"
            style={{
              width: "96px", height: "96px", fontSize: "2rem",
              background: selectedChat.type === "community" ? "#1a3a5c" : "#48484a",
            }}
          >
            {data.name[0]?.toUpperCase()}
          </div>
        )}

        {/* Name */}
        <h1
          className="mt-4 text-xl font-semibold text-white"
          style={{ letterSpacing: "-0.02em" }}
        >
          {isUser ? data.fullName : data.name}
        </h1>

        {/* Status / member count */}
        <p
          className="mt-1 text-sm"
          style={{ color: isOnline ? "#34c759" : "#8e8e93" }}
        >
          {isUser
            ? isOnline ? "online" : "offline"
            : data.description || `${data.members?.length} members`}
        </p>

        {/* Bio */}
        {isUser && data.bio && (
          <p className="mt-2 text-sm max-w-xs" style={{ color: "rgba(255,255,255,0.55)", lineHeight: "1.5" }}>
            {data.bio}
          </p>
        )}

        {/* Action buttons */}
        {isUser && (
          <div className="flex gap-8 mt-5">
            <ActionButton icon={<PhoneIcon />} label="Audio" onClick={() => startCall(data, "audio")} />
            <ActionButton icon={<VideoIcon />} label="Video" onClick={() => startCall(data, "video")} />
          </div>
        )}

        {/* Invite code */}
        {!isUser && selectedChat.type === "community" && data.inviteCode && (
          <div
            className="mt-4 w-full max-w-[200px] p-3 rounded-xl"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <p className="text-xs mb-1" style={{ color: "#8e8e93" }}>Invite code</p>
            <p className="font-mono text-lg text-white tracking-widest">{data.inviteCode}</p>
          </div>
        )}
      </div>

      {/* ── Call history ── */}
      {isUser && (
        <div>
          <SectionLabel>Call History</SectionLabel>
          <div className="px-4 pb-2">
            {loadingCalls ? (
              <p className="text-xs py-2" style={{ color: "#636366" }}>Loading…</p>
            ) : callHistory.length === 0 ? (
              <p className="text-xs py-2" style={{ color: "#636366" }}>No calls yet.</p>
            ) : (
              <ul className="space-y-1">
                {callHistory.map(call => {
                  const amCaller = String(call.callerId?._id || call.callerId) === String(authUser._id);
                  const isMissed = call.status === "missed" && !amCaller;
                  return (
                    <li
                      key={call._id}
                      className="flex items-center gap-3 py-2.5 rounded-lg"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0.625rem 0" }}
                    >
                      <span style={{ color: isMissed ? "#ff3b30" : "#8e8e93" }}>
                        {call.callType === "video" ? <VideoIcon /> : <PhoneIcon />}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm truncate"
                          style={{ color: isMissed ? "#ff3b30" : "#fff", fontWeight: 500 }}
                        >
                          {getCallLabel(call, authUser._id)}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span style={{ color: "#8e8e93" }}>
                            {amCaller ? <PhoneOutIcon /> : <PhoneInIcon />}
                          </span>
                          <p className="text-xs" style={{ color: "#636366" }}>
                            {amCaller ? "Outgoing" : "Incoming"} · {formatCallDate(call.createdAt)}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* ── Media ── */}
      {msgImages.length > 0 && (
        <div>
          <SectionLabel>Media ({msgImages.length})</SectionLabel>
          <div className="px-4 pb-6 grid grid-cols-3 gap-1">
            {msgImages.map((url, i) => (
              <img
                key={i}
                src={url}
                alt=""
                className="cursor-pointer"
                style={{ aspectRatio: "1", width: "100%", objectFit: "cover", borderRadius: "8px" }}
                onClick={() => window.open(url)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RightSidebar;
