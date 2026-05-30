import React, { useState, useEffect, useRef, useContext } from "react";
import assets from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import QRCode from "qrcode";

/* ── Icons ─────────────────────────────────────────────── */
const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const CameraIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);
const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const InfoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const ShareIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);
const LogoutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const SaveIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/>
    <polyline points="7 3 7 8 15 8"/>
  </svg>
);
const ChevronIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
const QrIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/>
    <line x1="14" y1="14" x2="14" y2="14.01"/>
    <line x1="18" y1="14" x2="18" y2="14.01"/>
    <line x1="21" y1="14" x2="21" y2="14.01"/>
    <line x1="14" y1="18" x2="14" y2="18.01"/>
    <line x1="18" y1="18" x2="18" y2="18.01"/>
    <line x1="21" y1="21" x2="21" y2="21.01"/>
  </svg>
);

/* ── Subcomponents ──────────────────────────────────────── */
const Toggle = ({ value, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!value)}
    style={{
      width: "50px", height: "28px", borderRadius: "14px", border: "none", cursor: "pointer",
      background: value ? "#007aff" : "rgba(255,255,255,0.15)",
      position: "relative", transition: "background 0.25s",
    }}
  >
    <span style={{
      position: "absolute", top: "3px",
      left: value ? "25px" : "3px",
      width: "22px", height: "22px", borderRadius: "50%",
      background: "#fff", transition: "left 0.25s",
      boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
    }} />
  </button>
);

const SettingRow = ({ icon, label, value, children, danger }) => (
  <div style={{
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.06)",
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <span style={{ color: danger ? "#ff3b30" : "#8e8e93" }}>{icon}</span>
      <span style={{ fontSize: "0.9375rem", color: danger ? "#ff3b30" : "#fff", fontWeight: 400 }}>{label}</span>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#8e8e93" }}>
      {value && <span style={{ fontSize: "0.875rem" }}>{value}</span>}
      {children}
    </div>
  </div>
);

const Section = ({ title, children }) => (
  <div style={{
    background: "rgba(28,28,30,0.8)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "14px", padding: "0 16px",
    marginBottom: "16px",
  }}>
    {title && (
      <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#8e8e93", letterSpacing: "0.05em",
        textTransform: "uppercase", padding: "12px 0 4px" }}>
        {title}
      </p>
    )}
    {children}
  </div>
);

/* ── Main Page ──────────────────────────────────────────── */
const ProfilePage = () => {
  const { authUser, updateProfile, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const qrCanvasRef = useRef();

  const [selectedImg, setSelectedImg] = useState(null);
  const [name, setName] = useState(authUser?.fullName || "");
  const [bio, setBio] = useState(authUser?.bio || "");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showQR, setShowQR] = useState(false);
  
  const [showBlocked, setShowBlocked] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const { axios } = useContext(AuthContext);

  const fetchBlockedUsers = async () => {
    try {
      const { data } = await axios.get("/api/social/blocked/users");
      if (data.success) setBlockedUsers(data.blockedUsers);
    } catch (e) {}
  };

  // Settings (localStorage)
  const [notifs, setNotifs] = useState(() => JSON.parse(localStorage.getItem("wc_notifs") ?? "true"));
  const [sounds, setSounds] = useState(() => JSON.parse(localStorage.getItem("wc_sounds") ?? "true"));
  const [enterSend, setEnterSend] = useState(() => JSON.parse(localStorage.getItem("wc_enter_send") ?? "true"));

  const profilePic = selectedImg
    ? URL.createObjectURL(selectedImg)
    : authUser?.profilePic || assets.avatar_icon;

  // Generate QR code whenever modal opens
  useEffect(() => {
    if (!showQR || !qrCanvasRef.current) return;
    const url = `${window.location.origin}/profile/${authUser?._id}`;
    QRCode.toCanvas(qrCanvasRef.current, url, {
      width: 220,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    });
  }, [showQR, authUser]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (!selectedImg) {
      await updateProfile({ fullName: name, bio });
    } else {
      const reader = new FileReader();
      reader.readAsDataURL(selectedImg);
      reader.onload = async () => {
        await updateProfile({ profilePic: reader.result, fullName: name, bio });
      };
    }
    setSaving(false);
    setEditing(false);
    setSelectedImg(null);
  };

  const saveToggle = (key, setter) => (val) => {
    setter(val);
    localStorage.setItem(key, JSON.stringify(val));
  };

  const inputStyle = {
    width: "100%",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px",
    color: "#fff",
    padding: "12px 14px",
    fontSize: "0.9375rem",
    outline: "none",
    transition: "border-color 0.15s",
    marginTop: "6px",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "Inter, -apple-system, sans-serif" }}>
      {/* Background glow */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(0,122,255,0.08) 0%, transparent 70%)",
      }} />

      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "0 0 40px" }}>

        {/* ── Top Nav ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px", position: "sticky", top: 0, zIndex: 10,
          background: "rgba(0,0,0,0.85)", backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}>
          <button
            type="button"
            onClick={() => navigate("/")}
            style={{ display: "flex", alignItems: "center", gap: "6px", color: "#007aff", background: "none", border: "none", cursor: "pointer", fontWeight: 500, fontSize: "0.9375rem" }}
          >
            <BackIcon /> Back
          </button>
          <span style={{ fontWeight: 700, fontSize: "1rem", letterSpacing: "-0.02em" }}>Profile</span>
          {editing ? (
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              style={{ color: "#007aff", background: "none", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.9375rem", opacity: saving ? 0.5 : 1 }}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              style={{ color: "#007aff", background: "none", border: "none", cursor: "pointer", fontWeight: 500, fontSize: "0.9375rem" }}
            >
              Edit
            </button>
          )}
        </div>

        <div style={{ padding: "24px 20px 0" }}>

          {/* ── Avatar Card ── */}
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            paddingBottom: "28px", marginBottom: "24px",
          }}>
            <div style={{ position: "relative", marginBottom: "16px" }}>
              <img
                src={profilePic}
                alt="Avatar"
                style={{ width: "110px", height: "110px", borderRadius: "50%", objectFit: "cover",
                  border: "3px solid rgba(0,122,255,0.4)", boxShadow: "0 0 0 2px rgba(0,122,255,0.15)" }}
              />
              {editing && (
                <label
                  htmlFor="avatar-upload"
                  style={{
                    position: "absolute", bottom: 0, right: 0,
                    width: "34px", height: "34px", borderRadius: "50%",
                    background: "#007aff", display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", border: "2px solid #000",
                  }}
                >
                  <CameraIcon />
                </label>
              )}
              <input
                id="avatar-upload"
                type="file"
                accept=".png,.jpg,.jpeg,.webp"
                hidden
                onChange={(e) => setSelectedImg(e.target.files[0])}
              />
            </div>

            {editing ? (
              <div style={{ width: "100%", maxWidth: "340px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#007aff")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                />
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Bio (optional)"
                  rows={3}
                  style={{ ...inputStyle, resize: "none", lineHeight: "1.45" }}
                  onFocus={(e) => (e.target.style.borderColor = "#007aff")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                />
              </div>
            ) : (
              <>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 6px", letterSpacing: "-0.03em" }}>
                  {authUser?.fullName}
                </h1>
                {authUser?.bio && (
                  <p style={{ fontSize: "0.9rem", color: "#8e8e93", textAlign: "center", maxWidth: "280px", lineHeight: "1.5", margin: "0 0 12px" }}>
                    {authUser.bio}
                  </p>
                )}
                <p style={{ fontSize: "0.8rem", color: "#636366" }}>{authUser?.email}</p>

                {/* Share QR button */}
                <button
                  type="button"
                  onClick={() => setShowQR(true)}
                  style={{
                    marginTop: "14px", display: "flex", alignItems: "center", gap: "8px",
                    background: "rgba(0,122,255,0.12)", border: "1px solid rgba(0,122,255,0.25)",
                    borderRadius: "20px", color: "#007aff", padding: "8px 18px",
                    fontSize: "0.875rem", fontWeight: 600, cursor: "pointer",
                  }}
                >
                  <QrIcon /> Share via QR Code
                </button>
              </>
            )}
          </div>

          {/* ── Account Info ── */}
          <Section title="Account">
            <SettingRow icon={<UserIcon />} label="Full Name" value={authUser?.fullName}>
              <ChevronIcon />
            </SettingRow>
            <SettingRow icon={<InfoIcon />} label="Bio" value={authUser?.bio ? authUser.bio.substring(0, 20) + "…" : "Add bio"}>
              <ChevronIcon />
            </SettingRow>
            <SettingRow icon={<LockIcon />} label="Account ID" value={authUser?._id?.slice(-8).toUpperCase()} />
          </Section>

          {/* ── Preferences ── */}
          <Section title="Preferences">
            <SettingRow icon={<BellIcon />} label="Notifications">
              <Toggle value={notifs} onChange={saveToggle("wc_notifs", setNotifs)} />
            </SettingRow>
            <SettingRow icon={<span style={{ fontSize: "1.1rem" }}>🔊</span>} label="Message Sounds">
              <Toggle value={sounds} onChange={saveToggle("wc_sounds", setSounds)} />
            </SettingRow>
            <SettingRow icon={<span style={{ fontSize: "1.1rem" }}>⌨️</span>} label="Enter to Send">
              <Toggle value={enterSend} onChange={saveToggle("wc_enter_send", setEnterSend)} />
            </SettingRow>
          </Section>

          {/* ── Privacy ── */}
          <Section title="Privacy & Security">
            <SettingRow icon={<LockIcon />} label="Private Account" value={authUser?.isPrivate ? "On" : "Off"}>
              <Toggle 
                value={authUser?.isPrivate || false} 
                onChange={(val) => updateProfile({ isPrivate: val })} 
              />
            </SettingRow>
            <div onClick={() => {
              if (!showBlocked) fetchBlockedUsers();
              setShowBlocked(!showBlocked);
            }} style={{ cursor: "pointer" }}>
              <SettingRow icon={<ShareIcon />} label="Blocked Contacts">
                <div style={{ transform: showBlocked ? "rotate(90deg)" : "rotate(0deg)", transition: "0.2s" }}>
                  <ChevronIcon />
                </div>
              </SettingRow>
            </div>
            {showBlocked && (
              <div style={{ padding: "0 16px 16px" }}>
                {blockedUsers.length === 0 ? (
                  <p style={{ fontSize: "0.85rem", color: "#8e8e93", textAlign: "center", margin: 0 }}>No blocked contacts</p>
                ) : (
                  blockedUsers.map(u => (
                    <div key={u._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <img src={u.profilePic || assets.avatar_icon} style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }} alt="" />
                        <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>{u.fullName}</span>
                      </div>
                      <button 
                        onClick={async () => {
                          await axios.delete(`/api/social/${u._id}/block`);
                          setBlockedUsers(prev => prev.filter(x => x._id !== u._id));
                        }}
                        style={{ padding: "4px 12px", background: "rgba(255,59,48,0.15)", color: "#ff3b30", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}
                      >
                        Unblock
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </Section>

          {/* ── About ── */}
          <Section title="About">
            <SettingRow icon={<InfoIcon />} label="App Version" value="v1.0.0" />
            <SettingRow icon={<span style={{ fontSize: "1.1rem" }}>⭐</span>} label="Rate WhatsChat">
              <ChevronIcon />
            </SettingRow>
          </Section>

          {/* ── Danger Zone ── */}
          <Section>
            <SettingRow
              icon={<LogoutIcon />}
              label="Log Out"
              danger
            >
              <button
                type="button"
                onClick={logout}
                style={{
                  background: "#ff3b30", color: "#fff", border: "none", borderRadius: "8px",
                  padding: "6px 14px", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer",
                }}
              >
                Log Out
              </button>
            </SettingRow>
          </Section>

        </div>
      </div>

      {/* ── QR Code Modal ── */}
      {showQR && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
          onClick={() => setShowQR(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#1c1c1e", border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "20px", padding: "32px 24px",
              display: "flex", flexDirection: "column", alignItems: "center", gap: "16px",
              boxShadow: "0 24px 60px rgba(0,0,0,0.7)",
            }}
          >
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>
              Scan to Connect
            </h2>
            <div style={{
              padding: "16px", background: "#fff", borderRadius: "16px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
            }}>
              <canvas ref={qrCanvasRef} />
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "1rem", fontWeight: 600, margin: "0 0 4px" }}>{authUser?.fullName}</p>
              <p style={{ fontSize: "0.8125rem", color: "#8e8e93", margin: 0 }}>
                Scan with WhatsChat to start chatting
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowQR(false)}
              style={{
                background: "rgba(255,255,255,0.08)", color: "#fff",
                border: "none", borderRadius: "12px", padding: "10px 32px",
                fontSize: "0.9375rem", fontWeight: 500, cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
