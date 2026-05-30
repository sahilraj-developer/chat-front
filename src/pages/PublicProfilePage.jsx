import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const PublicProfilePage = () => {
  const { userId } = useParams();
  const { axios, authUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [followStatus, setFollowStatus] = useState(null); // null | 'pending' | 'accepted'
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [canSeePosts, setCanSeePosts] = useState(false);
  const [requestId, setRequestId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (userId === authUser?._id) { navigate("/profile"); return; }
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/social/${userId}/profile`);
      if (data.success) {
        setProfile({ ...data.user, isBlocked: data.isBlocked, hasBlockedMe: data.hasBlockedMe });
        setFollowStatus(data.followStatus);
        setFollowersCount(data.followersCount);
        setFollowingCount(data.followingCount);
        setCanSeePosts(data.canSeePosts);
        setRequestId(data.requestId);
      }
    } catch {}
    setLoading(false);
  };

  const handleFollow = async () => {
    setActionLoading(true);
    try {
      if (followStatus === "accepted" || followStatus === "pending") {
        await axios.delete(`/api/social/${userId}/follow`);
        setFollowStatus(null);
        setFollowersCount((n) => n - (followStatus === "accepted" ? 1 : 0));
      } else {
        const { data } = await axios.post(`/api/social/${userId}/follow`);
        if (data.success) {
          setFollowStatus(data.status);
          if (data.status === "accepted") setFollowersCount((n) => n + 1);
        }
      }
    } catch {}
    setActionLoading(false);
  };

  const startChat = () => navigate("/", { state: { openChatWith: profile } });

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#8e8e93" }}>Loading…</div>
    </div>
  );

  if (!profile) return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#8e8e93" }}>User not found</div>
    </div>
  );

  const followBtnLabel = followStatus === "accepted" ? "Following ✓"
    : followStatus === "pending" ? "Requested ·  Cancel"
    : "Follow";

  const followBtnStyle = {
    padding: "10px 28px", borderRadius: "10px", border: "none", cursor: "pointer",
    fontWeight: 700, fontSize: "0.9rem",
    background: followStatus === "accepted" ? "rgba(255,255,255,0.1)"
      : followStatus === "pending" ? "rgba(255,255,255,0.08)"
      : "linear-gradient(135deg,#007aff,#5856d6)",
    color: followStatus ? "#fff" : "#fff",
    opacity: actionLoading ? 0.6 : 1,
    transition: "all 0.2s",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff" }}>

      {/* Header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        background: "rgba(0,0,0,0.85)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        padding: "14px 20px", display: "flex", alignItems: "center", gap: "14px",
      }}>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: "#007aff", fontSize: "1rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
          ‹ Back
        </button>
        <h1 style={{ flex: 1, margin: 0, fontSize: "1rem", fontWeight: 700 }}>
          {profile.fullName}
        </h1>
      </div>

      {/* Profile card */}
      <div style={{ padding: "28px 24px 0", maxWidth: "640px", margin: "0 auto" }}>

        {/* Avatar + stats row */}
        <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "16px" }}>
          {profile.profilePic ? (
            <img
              src={profile.profilePic} alt=""
              style={{ width: "88px", height: "88px", borderRadius: "50%", objectFit: "cover", border: "3px solid rgba(0,122,255,0.4)" }}
            />
          ) : (
            <div style={{
              width: "88px", height: "88px", borderRadius: "50%",
              background: "linear-gradient(135deg,#007aff,#5856d6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "2.25rem", fontWeight: 700,
            }}>
              {profile.fullName?.[0]?.toUpperCase()}
            </div>
          )}

          {/* Stats */}
          <div style={{ display: "flex", gap: "28px", flex: 1, justifyContent: "center" }}>
            <StatCol value={followersCount} label="Followers" />
            <StatCol value={followingCount} label="Following" />
          </div>
        </div>

        {/* Name + bio */}
        <p style={{ fontWeight: 700, fontSize: "1.0625rem", margin: "0 0 4px" }}>{profile.fullName}</p>
        {profile.bio && <p style={{ color: "#8e8e93", fontSize: "0.9rem", margin: "0 0 6px", lineHeight: 1.5 }}>{profile.bio}</p>}
        {profile.website && (
          <a href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
            target="_blank" rel="noreferrer"
            style={{ color: "#007aff", fontSize: "0.875rem" }}>
            {profile.website}
          </a>
        )}
        {profile.isPrivate && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "6px" }}>
            <span style={{ fontSize: "0.8rem", color: "#8e8e93" }}>🔒 Private account</span>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: "flex", gap: "10px", marginTop: "16px", marginBottom: "24px" }}>
          {!profile.hasBlockedMe && (
            <>
              <button onClick={handleFollow} disabled={actionLoading} style={followBtnStyle}>
                {followBtnLabel}
              </button>
              <button
                onClick={startChat}
                style={{
                  padding: "10px 20px", borderRadius: "10px", background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)", color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem",
                }}
              >
                💬 Message
              </button>
            </>
          )}
          <button
            onClick={async () => {
              setActionLoading(true);
              if (profile.isBlocked) {
                await axios.delete(`/api/social/${userId}/block`);
                setProfile({ ...profile, isBlocked: false });
              } else {
                await axios.post(`/api/social/${userId}/block`);
                setProfile({ ...profile, isBlocked: true });
                setFollowStatus(null);
                setFollowersCount(n => Math.max(0, n - 1));
              }
              setActionLoading(false);
            }}
            disabled={actionLoading}
            style={{
              padding: "10px 20px", borderRadius: "10px", background: profile.isBlocked ? "rgba(255,59,48,0.15)" : "transparent",
              border: "1px solid #ff3b30", color: "#ff3b30", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem", marginLeft: "auto"
            }}
          >
            {profile.isBlocked ? "Unblock" : "Block"}
          </button>
        </div>

        {/* Divider */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", marginBottom: "24px" }} />

        {/* Content area */}
        {!canSeePosts && profile.isPrivate && followStatus !== "accepted" ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#8e8e93" }}>
            <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🔒</div>
            <p style={{ fontWeight: 700, fontSize: "1.0625rem", color: "#fff", margin: "0 0 8px" }}>
              This account is private
            </p>
            <p style={{ fontSize: "0.9rem", margin: 0 }}>
              {followStatus === "pending"
                ? "Follow request sent. Once accepted, you'll see their stories and posts."
                : "Follow this account to see their stories and posts."}
            </p>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "32px 0", color: "#8e8e93" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>📸</div>
            <p style={{ fontSize: "0.9rem", margin: 0 }}>No posts yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCol = ({ value, label }) => (
  <div style={{ textAlign: "center" }}>
    <p style={{ margin: 0, fontWeight: 700, fontSize: "1.125rem" }}>{value}</p>
    <p style={{ margin: 0, color: "#8e8e93", fontSize: "0.8125rem" }}>{label}</p>
  </div>
);

export default PublicProfilePage;
