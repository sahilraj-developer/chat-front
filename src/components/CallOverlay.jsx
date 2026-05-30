import React, { useContext, useEffect, useRef, useState } from "react";
import { CallContext } from "../../context/CallContext";
import { AuthContext } from "../../context/AuthContext";
import assets from "../assets/assets";

/* ── Icons ───────────────────────────────────────────────── */
const PhoneAcceptIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/>
  </svg>
);
const PhoneRejectIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ transform: "rotate(135deg)" }}>
    <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/>
  </svg>
);
const MicOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="1" y1="1" x2="23" y2="23"/>
    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/>
    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);
const MicOnIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);
const VideoOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const VideoOnIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7"/>
    <rect x="1" y="5" width="15" height="14" rx="2"/>
  </svg>
);
const SpeakerIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
  </svg>
);

/* ── Call duration timer ─────────────────────────────────── */
const useCallTimer = (active) => {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!active) { setSeconds(0); return; }
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [active]);
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
};

/* ── Control Button ──────────────────────────────────────── */
const CtrlBtn = ({ icon, label, onClick, active, danger }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
      background: "none", border: "none", cursor: "pointer",
    }}
  >
    <span style={{
      width: "54px", height: "54px", borderRadius: "50%",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: danger
        ? "#ff3b30"
        : active
          ? "rgba(255,255,255,0.22)"
          : "rgba(255,255,255,0.1)",
      color: "#fff",
      transition: "background 0.15s",
    }}>
      {icon}
    </span>
    <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>
      {label}
    </span>
  </button>
);

/* ── Main Component ──────────────────────────────────────── */
const CallOverlay = () => {
  const {
    callStatus, callType, remoteUser, incomingCall,
    localStream, remoteStream,
    acceptCall, rejectCall, endCall,
  } = useContext(CallContext);
  const { authUser } = useContext(AuthContext);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [speakerOn, setSpeakerOn] = useState(true);

  const isConnected = callStatus === "connected";
  const timer = useCallTimer(isConnected);

  useEffect(() => {
    if (localVideoRef.current && localStream) localVideoRef.current.srcObject = localStream;
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) remoteVideoRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  // toggle mic tracks
  const toggleMic = () => {
    if (localStream) localStream.getAudioTracks().forEach((t) => (t.enabled = !micOn));
    setMicOn((p) => !p);
  };
  // toggle cam tracks
  const toggleCam = () => {
    if (localStream) localStream.getVideoTracks().forEach((t) => (t.enabled = !camOn));
    setCamOn((p) => !p);
  };

  if (callStatus === "idle") return null;

  const displayName = remoteUser?.fullName || incomingCall?.callerName || "Contact";
  const displayPic = remoteUser?.profilePic || null;
  const targetId = remoteUser?._id || incomingCall?.from;
  const isVideo = (incomingCall?.callType || callType) === "video";

  /* ── Incoming ringing notification ─────────────────────── */
  if (callStatus === "ringing") {
    return (
      /* Backdrop */
      <div style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
      }}>
        {/* Notification card */}
        <div style={{
          width: "100%", maxWidth: "340px",
          background: "linear-gradient(160deg, #1c2a3a 0%, #0a0a0a 100%)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "24px",
          padding: "32px 24px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: "20px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.7)",
          animation: "tg-fade-in 0.25s ease-out",
        }}>
          {/* Incoming label */}
          <p style={{ fontSize: "0.8125rem", color: "#8e8e93", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            Incoming {isVideo ? "Video" : "Voice"} Call
          </p>

          {/* Avatar with pulse */}
          <div style={{ position: "relative" }}>
            <div style={{
              position: "absolute", inset: "-10px", borderRadius: "50%",
              background: "rgba(0,122,255,0.15)",
              animation: "callPulse 1.6s ease-out infinite",
            }} />
            {displayPic ? (
              <img src={displayPic} alt="" style={{ width: "90px", height: "90px", borderRadius: "50%", objectFit: "cover", position: "relative", border: "3px solid rgba(0,122,255,0.5)" }} />
            ) : (
              <div style={{
                width: "90px", height: "90px", borderRadius: "50%",
                background: "linear-gradient(135deg, #007aff, #0040aa)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "2rem", fontWeight: 700, color: "#fff", position: "relative",
              }}>
                {displayName[0]?.toUpperCase()}
              </div>
            )}
          </div>

          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "1.25rem", fontWeight: 700, margin: "0 0 4px", letterSpacing: "-0.02em" }}>{displayName}</p>
            <p style={{ fontSize: "0.875rem", color: "#8e8e93", margin: 0 }}>
              {isVideo ? "📹 Video call" : "📞 Voice call"}
            </p>
          </div>

          {/* Accept / Reject */}
          <div style={{ display: "flex", gap: "40px", alignItems: "center" }}>
            <button
              type="button"
              onClick={rejectCall}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
                background: "none", border: "none", cursor: "pointer",
              }}
            >
              <span style={{
                width: "62px", height: "62px", borderRadius: "50%",
                background: "#ff3b30",
                display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
                boxShadow: "0 4px 16px rgba(255,59,48,0.4)",
              }}>
                <PhoneRejectIcon />
              </span>
              <span style={{ fontSize: "0.8rem", color: "#8e8e93" }}>Decline</span>
            </button>

            <button
              type="button"
              onClick={acceptCall}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
                background: "none", border: "none", cursor: "pointer",
              }}
            >
              <span style={{
                width: "62px", height: "62px", borderRadius: "50%",
                background: "#34c759",
                display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
                boxShadow: "0 4px 16px rgba(52,199,89,0.4)",
              }}>
                <PhoneAcceptIcon />
              </span>
              <span style={{ fontSize: "0.8rem", color: "#8e8e93" }}>Accept</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Active / Calling / Connected ───────────────────────── */
  return (
    /* Full-screen backdrop — click-through blocked */
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "#000",
      display: "flex", flexDirection: "column",
    }}>

      {/* ── Video bg (if video call + connected) ── */}
      {isVideo && remoteStream && (
        <video
          ref={remoteVideoRef}
          autoPlay playsInline
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}

      {/* ── Dark overlay for non-video or during calling ── */}
      {(!isVideo || !remoteStream) && (
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(160deg, #1a2740 0%, #000 60%)",
        }} />
      )}

      {/* ── Content layer ── */}
      <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column" }}>

        {/* Top info bar */}
        <div style={{
          padding: "clamp(40px,8vw,64px) 24px 16px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: "12px",
        }}>
          {displayPic ? (
            <img src={displayPic} alt="" style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,255,255,0.25)" }} />
          ) : (
            <div style={{
              width: "80px", height: "80px", borderRadius: "50%",
              background: "linear-gradient(135deg, #007aff, #0040aa)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.75rem", fontWeight: 700, color: "#fff",
            }}>
              {displayName[0]?.toUpperCase()}
            </div>
          )}

          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "1.375rem", fontWeight: 700, margin: "0 0 4px", letterSpacing: "-0.025em" }}>
              {displayName}
            </p>
            <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.55)", margin: 0 }}>
              {callStatus === "calling" && (isVideo ? "📹 Video calling…" : "📞 Calling…")}
              {isConnected && (isVideo ? "📹 " + timer : "📞 " + timer)}
            </p>
          </div>
        </div>

        {/* Local video PiP (video call only) */}
        {isVideo && localStream && (
          <video
            ref={localVideoRef}
            autoPlay playsInline muted
            style={{
              position: "absolute",
              top: "clamp(60px,12vw,100px)",
              right: "16px",
              width: "clamp(80px,22vw,130px)",
              aspectRatio: "9/16",
              borderRadius: "14px",
              objectFit: "cover",
              border: "2px solid rgba(255,255,255,0.2)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
              background: "#111",
            }}
          />
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* ── Controls ── */}
        <div style={{
          padding: "24px 24px clamp(32px,8vh,56px)",
          background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)",
        }}>
          {/* Row 1: Mic / Speaker / Cam */}
          <div style={{ display: "flex", justifyContent: "center", gap: "clamp(20px,5vw,40px)", marginBottom: "24px" }}>
            <CtrlBtn
              icon={micOn ? <MicOnIcon /> : <MicOffIcon />}
              label={micOn ? "Mute" : "Unmute"}
              onClick={toggleMic}
              active={!micOn}
            />
            <CtrlBtn
              icon={<SpeakerIcon />}
              label={speakerOn ? "Speaker" : "Earpiece"}
              onClick={() => setSpeakerOn((p) => !p)}
              active={!speakerOn}
            />
            {isVideo && (
              <CtrlBtn
                icon={camOn ? <VideoOnIcon /> : <VideoOffIcon />}
                label={camOn ? "Hide cam" : "Show cam"}
                onClick={toggleCam}
                active={!camOn}
              />
            )}
          </div>

          {/* Row 2: End call */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button
              type="button"
              onClick={() => endCall(targetId)}
              style={{
                width: "68px", height: "68px", borderRadius: "50%",
                background: "#ff3b30",
                border: "none", cursor: "pointer", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 20px rgba(255,59,48,0.5)",
                transition: "transform 0.1s",
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.93)")}
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <PhoneRejectIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallOverlay;
