import React, { useContext, useEffect } from "react";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import assets from "../assets/assets";

/* ── Icons ─────────────────────────────────────────────── */
const PhoneOutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.59a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
    <polyline points="16 2 22 2 22 8"/>
    <line x1="22" y1="2" x2="16" y2="8"/>
  </svg>
);
const PhoneInIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.59a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
    <polyline points="16 8 22 8 22 2"/>
    <line x1="22" y1="8" x2="16" y2="2"/>
  </svg>
);
const VideoCallIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
  </svg>
);
const VideoCallOutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
    <polyline points="12 2 16 2 16 6"/>
  </svg>
);
const CallbackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.59a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

const formatCallTime = (ts) => {
  if (!ts) return "";
  const d = new Date(ts), now = new Date();
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { day: "numeric", month: "short" });
};

const formatDuration = (secs) => {
  if (!secs || secs <= 0) return null;
  const m = Math.floor(secs / 60), s = secs % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};

const CallsTab = ({ onStartCall }) => {
  const { allCalls, getAllCalls } = useContext(ChatContext);
  const { authUser } = useContext(AuthContext);

  useEffect(() => { getAllCalls(); }, [getAllCalls]);

  if (!allCalls || allCalls.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 py-16 px-4 text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
          style={{ background: "rgba(0,122,255,0.1)", border: "1px solid rgba(0,122,255,0.15)" }}
        >
          <CallbackIcon />
        </div>
        <p className="text-sm font-medium" style={{ color: "var(--tg-text-muted)" }}>No calls yet</p>
        <p className="text-xs mt-1" style={{ color: "var(--tg-text-dim)" }}>
          Your call history will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto min-h-0">
      {allCalls.map((call) => {
        const amCaller = String(call.callerId?._id || call.callerId) === String(authUser._id);
        const isMissed = call.status === "missed" && !amCaller;
        const other = amCaller ? call.receiverId : call.callerId;
        const otherName = other?.fullName || "Unknown";
        const otherPic = other?.profilePic || null;
        const isVideo = call.callType === "video";
        const dur = formatDuration(call.duration);

        let directionIcon = isVideo ? <VideoCallIcon /> : (amCaller ? <PhoneOutIcon /> : <PhoneInIcon />);
        let directionLabel = amCaller ? "Outgoing" : isMissed ? "Missed" : "Incoming";

        return (
          <div
            key={call._id}
            className="wa-list-item"
            style={{ minHeight: "72px", borderBottom: "none" }}
          >
            {/* Avatar */}
            <div className="flex-shrink-0">
              {otherPic ? (
                <img src={otherPic} alt="" className="wa-avatar rounded-full object-cover" />
              ) : (
                <div className="wa-avatar wa-avatar-placeholder wa-avatar-placeholder--group">
                  {otherName[0]?.toUpperCase()}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="wa-list-item__title truncate">{otherName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span style={{ color: isMissed ? "var(--tg-danger)" : "var(--tg-text-muted)" }}>
                  {directionIcon}
                </span>
                <span
                  className="text-xs"
                  style={{ color: isMissed ? "var(--tg-danger)" : "var(--tg-text-muted)" }}
                >
                  {directionLabel}{dur ? ` · ${dur}` : ""}
                </span>
              </div>
            </div>

            {/* Time + callback */}
            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
              <span className="text-[11px]" style={{ color: "var(--tg-text-dim)" }}>
                {formatCallTime(call.createdAt)}
              </span>
              <button
                type="button"
                onClick={() => onStartCall && onStartCall(other, call.callType)}
                className="wa-btn-ghost"
                style={{ padding: "4px", color: "var(--tg-accent)" }}
                title={`Call back (${isVideo ? "video" : "audio"})`}
              >
                <CallbackIcon />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CallsTab;
