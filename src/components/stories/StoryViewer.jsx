import React, { useContext, useEffect, useRef, useState, useCallback } from "react";
import { StoryContext } from "../../../context/StoryContext";
import { AuthContext } from "../../../context/AuthContext";

const EMOJIS = ["❤️", "😂", "😮", "😢", "😡", "👏"];
const STORY_DURATION = 5000; // 5s per image story

const StoryViewer = () => {
  const {
    viewerOpen, viewerGroup, viewerIndex, setViewerIndex,
    setViewerOpen, viewStory, reactToStory, commentOnStory, deleteStory, highlightStory,
  } = useContext(StoryContext);
  const { authUser } = useContext(AuthContext);

  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [comment, setComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [showViewers, setShowViewers] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const progressTimer = useRef(null);
  const progressStart = useRef(null);
  const elapsed = useRef(0);

  const story = viewerGroup?.stories?.[viewerIndex];
  const isOwn = story?.authorId?._id === authUser?._id || story?.authorId === authUser?._id;

  const goNext = useCallback(() => {
    if (!viewerGroup) return;
    if (viewerIndex < viewerGroup.stories.length - 1) {
      setViewerIndex(viewerIndex + 1);
    } else {
      setViewerOpen(false);
    }
  }, [viewerGroup, viewerIndex, setViewerIndex, setViewerOpen]);

  const goPrev = () => {
    if (viewerIndex > 0) setViewerIndex(viewerIndex - 1);
  };

  // Progress bar
  useEffect(() => {
    if (!viewerOpen || !story || paused) return;

    const duration = story.type === "video" || story.type === "audio" ? null : STORY_DURATION;
    if (!duration) return; // media controls its own timing

    progressStart.current = Date.now() - elapsed.current;
    setProgress((elapsed.current / duration) * 100);

    progressTimer.current = setInterval(() => {
      const el = Date.now() - progressStart.current;
      const pct = Math.min((el / duration) * 100, 100);
      setProgress(pct);
      if (pct >= 100) { clearInterval(progressTimer.current); elapsed.current = 0; goNext(); }
    }, 50);

    return () => clearInterval(progressTimer.current);
  }, [viewerOpen, story, paused, goNext]);

  // Reset on story change + mark viewed
  useEffect(() => {
    setProgress(0); elapsed.current = 0;
    setShowComments(false); setShowReactions(false);
    if (story?._id) viewStory(story._id);
    // eslint-disable-next-line
  }, [viewerIndex, viewerGroup]);

  if (!viewerOpen || !story || !viewerGroup) return null;

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    await commentOnStory(story._id, comment.trim());
    setComment("");
  };

  const bg = story.bgGradient || "linear-gradient(135deg,#007aff,#5856d6)";

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 300,
        background: "#000",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
      onMouseDown={() => { setPaused(true); elapsed.current = Date.now() - (progressStart.current || Date.now()); }}
      onMouseUp={() => setPaused(false)}
      onTouchStart={() => { setPaused(true); elapsed.current = Date.now() - (progressStart.current || Date.now()); }}
      onTouchEnd={() => setPaused(false)}
    >
      {/* Story card */}
      <div style={{
        position: "relative", width: "100%", maxWidth: "420px", height: "100vh",
        maxHeight: "100vh", overflow: "hidden",
        background: story.type === "text" ? bg : "#111",
        display: "flex", flexDirection: "column",
      }}>

        {/* Progress bars */}
        <div style={{ display: "flex", gap: "3px", padding: "12px 12px 8px", zIndex: 10, position: "relative" }}>
          {viewerGroup.stories.map((s, i) => (
            <div key={s._id} style={{ flex: 1, height: "2px", borderRadius: "2px", background: "rgba(255,255,255,0.3)", overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: "2px", background: "#fff",
                width: i < viewerIndex ? "100%" : i === viewerIndex ? `${progress}%` : "0%",
                transition: "none",
              }} />
            </div>
          ))}
        </div>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", gap: "10px",
          padding: "0 12px 12px", zIndex: 10, position: "relative",
        }}>
          <img
            src={viewerGroup.author.profilePic || ""}
            alt=""
            onError={(e) => { e.target.style.display = "none"; }}
            style={{ width: "38px", height: "38px", borderRadius: "50%", objectFit: "cover", border: "2px solid #fff" }}
          />
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: "0.875rem", color: "#fff" }}>
              {viewerGroup.author.fullName}
            </p>
            <p style={{ margin: 0, fontSize: "0.75rem", color: "rgba(255,255,255,0.6)" }}>
              {new Date(story.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              {" · "}
              {story.privacy === "public" ? "🌐 Public" : "👥 Friends"}
              {story.viewLimit !== "unlimited" && ` · ${story.viewLimit === "once" ? "1x" : "2x"}`}
            </p>
          </div>

          <div style={{ display: "flex", gap: "4px" }}>
            {isOwn && (
              <>
                <button onClick={() => setShowViewers(!showViewers)} style={ghostBtn} title="Viewers">
                  👁️ {story.views?.length || 0}
                </button>
                <button onClick={() => highlightStory(story._id)} style={ghostBtn} title="Highlight">
                  {story.isHighlight ? "⭐" : "☆"}
                </button>
                <button onClick={() => { deleteStory(story._id); setViewerOpen(false); }} style={{ ...ghostBtn, color: "#ff3b30" }}>
                  🗑️
                </button>
              </>
            )}
            <button onClick={() => setViewerOpen(false)} style={ghostBtn}>✕</button>
          </div>
        </div>

        {/* Media */}
        <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>

          {story.type === "image" && story.mediaUrl && (
            <img src={story.mediaUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
          )}

          {story.type === "video" && story.mediaUrl && (
            <video
              src={story.mediaUrl} autoPlay playsInline controls={false}
              style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }}
              onEnded={goNext}
            />
          )}

          {story.type === "audio" && story.mediaUrl && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", padding: "40px" }}>
              <div style={{ width: "120px", height: "120px", borderRadius: "50%", background: "rgba(0,122,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem" }}>
                🎵
              </div>
              <audio src={story.mediaUrl} autoPlay controls style={{ width: "100%" }} onEnded={goNext} />
            </div>
          )}

          {story.type === "text" && (
            <div style={{ padding: "32px", textAlign: "center" }}>
              <p style={{ fontSize: "clamp(1.25rem, 4vw, 2rem)", fontWeight: 700, color: "#fff", lineHeight: 1.4, textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
                {story.textContent}
              </p>
            </div>
          )}

          {/* Caption */}
          {story.caption && (
            <div style={{
              position: "absolute", bottom: "12px", left: 0, right: 0,
              padding: "0 16px", textAlign: "center",
            }}>
              <p style={{ color: "#fff", fontSize: "0.9375rem", background: "rgba(0,0,0,0.4)", borderRadius: "8px", padding: "6px 12px", display: "inline-block" }}>
                {story.caption}
              </p>
            </div>
          )}

          {/* Tap zones */}
          <button onClick={goPrev} style={{ position: "absolute", left: 0, top: 0, width: "35%", height: "100%", background: "none", border: "none", cursor: "pointer" }} />
          <button onClick={goNext} style={{ position: "absolute", right: 0, top: 0, width: "35%", height: "100%", background: "none", border: "none", cursor: "pointer" }} />
        </div>

        {/* Viewers panel (own stories) */}
        {isOwn && showViewers && (
          <div style={{
            position: "absolute", bottom: "80px", left: 0, right: 0,
            background: "rgba(28,28,30,0.95)", borderRadius: "16px 16px 0 0",
            padding: "16px", maxHeight: "40vh", overflowY: "auto", backdropFilter: "blur(10px)",
          }}>
            <p style={{ color: "#8e8e93", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", margin: "0 0 12px" }}>
              👁️ Viewers ({story.views?.length || 0})
            </p>
            {(story.views || []).map((v, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "6px 0" }}>
                <img src={v.userId?.profilePic || ""} alt="" onError={(e) => e.target.style.display = "none"} style={{ width: "32px", height: "32px", borderRadius: "50%" }} />
                <div>
                  <p style={{ margin: 0, fontSize: "0.875rem", color: "#fff" }}>{v.userId?.fullName || "User"}</p>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "#8e8e93" }}>{new Date(v.viewedAt).toLocaleTimeString()}</p>
                </div>
                {v.count > 1 && <span style={{ marginLeft: "auto", color: "#8e8e93", fontSize: "0.75rem" }}>×{v.count}</span>}
              </div>
            ))}
          </div>
        )}

        {/* Bottom bar: reactions + comments */}
        {!isOwn && (
          <div style={{ padding: "12px 12px 20px", background: "linear-gradient(to top,rgba(0,0,0,0.7),transparent)", position: "relative" }}>
            {/* Reaction row */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "10px", justifyContent: "center" }}>
              {EMOJIS.map((em) => {
                const myReaction = story.reactions?.find((r) => r.userId?._id === authUser?._id || r.userId === authUser?._id);
                const isActive = myReaction?.emoji === em;
                return (
                  <button
                    key={em}
                    onClick={() => reactToStory(story._id, em)}
                    style={{
                      fontSize: "1.5rem", background: isActive ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)",
                      border: isActive ? "1px solid rgba(255,255,255,0.4)" : "1px solid transparent",
                      borderRadius: "50%", width: "44px", height: "44px",
                      cursor: "pointer", transition: "all 0.15s",
                      transform: isActive ? "scale(1.2)" : "scale(1)",
                    }}
                  >
                    {em}
                  </button>
                );
              })}
            </div>

            {/* Reaction counts */}
            {story.reactions?.length > 0 && (
              <p style={{ textAlign: "center", color: "rgba(255,255,255,0.6)", fontSize: "0.8rem", marginBottom: "8px" }}>
                {Object.entries(
                  story.reactions.reduce((acc, r) => { acc[r.emoji] = (acc[r.emoji] || 0) + 1; return acc; }, {})
                ).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([em, n]) => `${em} ${n}`).join("  ")}
              </p>
            )}

            {/* Comment input */}
            <form onSubmit={handleComment} style={{ display: "flex", gap: "8px" }}>
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Send a reply…"
                style={{
                  flex: 1, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "24px", color: "#fff", padding: "10px 16px", fontSize: "0.9rem", outline: "none",
                }}
              />
              <button type="submit" disabled={!comment.trim()} style={{
                width: "40px", height: "40px", borderRadius: "50%", background: "#007aff",
                border: "none", cursor: "pointer", color: "#fff", fontSize: "1.1rem",
                opacity: comment.trim() ? 1 : 0.4,
              }}>
                ➤
              </button>
            </form>

            {/* Comments list */}
            {story.comments?.length > 0 && (
              <div style={{ marginTop: "8px", maxHeight: "120px", overflowY: "auto" }}>
                {story.comments.map((c, i) => (
                  <div key={i} style={{ display: "flex", gap: "8px", padding: "4px 0" }}>
                    <img src={c.userId?.profilePic || ""} alt="" onError={(e) => e.target.style.display = "none"} style={{ width: "24px", height: "24px", borderRadius: "50%", flexShrink: 0 }} />
                    <p style={{ margin: 0, fontSize: "0.8125rem", color: "#fff" }}>
                      <strong>{c.userId?.fullName}:</strong> {c.text}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const ghostBtn = {
  background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "8px",
  color: "#fff", padding: "4px 8px", cursor: "pointer", fontSize: "0.8125rem",
};

export default StoryViewer;
