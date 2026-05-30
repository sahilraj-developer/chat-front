import React, { useContext, useRef, useState } from "react";
import { StoryContext } from "../../../context/StoryContext";
import { AuthContext } from "../../../context/AuthContext";

const GRADIENTS = [
  "linear-gradient(135deg,#007aff,#5856d6)",
  "linear-gradient(135deg,#ff375f,#ff6b00)",
  "linear-gradient(135deg,#30d158,#007aff)",
  "linear-gradient(135deg,#ffd60a,#ff9f0a)",
  "linear-gradient(135deg,#bf5af2,#ff375f)",
  "linear-gradient(135deg,#0a84ff,#30d158)",
  "linear-gradient(135deg,#636366,#1c1c1e)",
];

const TabBtn = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    style={{
      flex: 1, padding: "8px", background: active ? "#007aff" : "rgba(255,255,255,0.05)",
      border: "none", borderRadius: "10px", color: active ? "#fff" : "#8e8e93",
      fontWeight: 600, fontSize: "0.8125rem", cursor: "pointer", transition: "all 0.15s",
    }}
  >
    {children}
  </button>
);

const StoryCreator = () => {
  const { creatorOpen, setCreatorOpen, createStory } = useContext(StoryContext);
  const { authUser } = useContext(AuthContext);

  const [tab, setTab] = useState("text");
  const [privacy, setPrivacy] = useState("friends");
  const [viewLimit, setViewLimit] = useState("unlimited");
  const [caption, setCaption] = useState("");
  const [textContent, setTextContent] = useState("");
  const [bgGradient, setBgGradient] = useState(GRADIENTS[0]);
  const [mediaBase64, setMediaBase64] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaMime, setMediaMime] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const reset = () => {
    setTab("text"); setCaption(""); setTextContent(""); setMediaBase64(null);
    setMediaPreview(null); setMediaMime(null); setError(""); setLoading(false);
    setBgGradient(GRADIENTS[0]);
  };

  const close = () => { reset(); setCreatorOpen(false); };

  const onFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError("");

    // Validate duration for video and audio
    if (tab === "video" || tab === "audio") {
      const url = URL.createObjectURL(file);
      const el = tab === "video" ? document.createElement("video") : document.createElement("audio");
      el.src = url;
      await new Promise((res) => { el.onloadedmetadata = res; el.onerror = res; });
      const dur = el.duration;
      URL.revokeObjectURL(url);
      if (tab === "video" && dur > 30) { setError("Video must be 30 seconds or less"); return; }
      if (tab === "audio" && dur > 300) { setError("Audio must be 5 minutes or less"); return; }
    }

    // Convert to base64
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setMediaBase64(reader.result);
      setMediaPreview(URL.createObjectURL(file));
      setMediaMime(file.type);
    };
  };

  const submit = async () => {
    if (tab !== "text" && !mediaBase64) { setError("Please select a file"); return; }
    if (tab === "text" && !textContent.trim()) { setError("Please enter some text"); return; }
    setLoading(true);
    const result = await createStory({
      type: tab,
      caption,
      textContent,
      bgGradient,
      privacy,
      viewLimit,
      mediaBase64,
      mediaMime,
    });
    setLoading(false);
    if (result) close();
  };

  if (!creatorOpen) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 250,
      background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "16px",
    }}>
      <div style={{
        width: "100%", maxWidth: "440px", maxHeight: "90vh", overflowY: "auto",
        background: "#1c1c1e", borderRadius: "20px",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 24px 60px rgba(0,0,0,0.7)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", padding: "16px 16px 0" }}>
          <h2 style={{ flex: 1, margin: 0, fontSize: "1.0625rem", fontWeight: 700 }}>New Story</h2>
          <button onClick={close} style={{ background: "none", border: "none", color: "#8e8e93", fontSize: "1.25rem", cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ padding: "16px" }}>
          {/* Tab row */}
          <div style={{ display: "flex", gap: "6px", marginBottom: "16px", background: "rgba(255,255,255,0.05)", borderRadius: "12px", padding: "4px" }}>
            {["text", "image", "video", "audio"].map((t) => (
              <TabBtn key={t} active={tab === t} onClick={() => { setTab(t); setMediaBase64(null); setMediaPreview(null); setError(""); }}>
                {t === "text" && "🎨"} {t === "image" && "📷"} {t === "video" && "🎥"} {t === "audio" && "🎤"}
                {" "}{t.charAt(0).toUpperCase() + t.slice(1)}
              </TabBtn>
            ))}
          </div>

          {/* Preview area */}
          <div style={{
            minHeight: "220px", borderRadius: "16px", overflow: "hidden", marginBottom: "16px",
            background: tab === "text" ? bgGradient : "#111",
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative",
          }}>
            {tab === "text" && (
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Type something…"
                maxLength={500}
                style={{
                  background: "none", border: "none", outline: "none", resize: "none",
                  color: "#fff", fontSize: "clamp(1.1rem,3vw,1.5rem)", fontWeight: 700,
                  textAlign: "center", width: "90%", textShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  height: "160px",
                }}
              />
            )}

            {tab === "image" && (
              mediaPreview
                ? <img src={mediaPreview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
                : <button onClick={() => fileRef.current.click()} style={uploadBtn}>📷 Choose Image</button>
            )}
            {tab === "video" && (
              mediaPreview
                ? <video src={mediaPreview} controls style={{ width: "100%", maxHeight: "220px" }} />
                : <button onClick={() => fileRef.current.click()} style={uploadBtn}>🎥 Choose Video (max 30s)</button>
            )}
            {tab === "audio" && (
              mediaPreview
                ? <audio src={mediaPreview} controls style={{ width: "90%" }} />
                : <button onClick={() => fileRef.current.click()} style={uploadBtn}>🎤 Choose Audio (max 5min)</button>
            )}

            {/* Re-pick button */}
            {mediaPreview && tab !== "text" && (
              <button
                onClick={() => { setMediaBase64(null); setMediaPreview(null); fileRef.current.click(); }}
                style={{ position: "absolute", top: "8px", right: "8px", ...ghostBtn }}
              >
                Change
              </button>
            )}
          </div>

          {/* Gradient picker for text */}
          {tab === "text" && (
            <div style={{ display: "flex", gap: "6px", marginBottom: "14px", flexWrap: "wrap" }}>
              {GRADIENTS.map((g) => (
                <button
                  key={g} onClick={() => setBgGradient(g)}
                  style={{
                    width: "32px", height: "32px", borderRadius: "50%", background: g, border: "none", cursor: "pointer",
                    outline: bgGradient === g ? "3px solid #fff" : "3px solid transparent",
                    outlineOffset: "2px",
                  }}
                />
              ))}
            </div>
          )}

          {/* Caption */}
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption… (optional)"
            maxLength={200}
            style={{ ...inputStyle, marginBottom: "12px" }}
          />

          {/* Privacy */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
            <label style={labelStyle}>Privacy</label>
            <div style={{ display: "flex", gap: "6px", flex: 1 }}>
              {[["public", "🌐 Public"], ["friends", "👥 Friends"]].map(([val, label]) => (
                <button
                  key={val} onClick={() => setPrivacy(val)}
                  style={{
                    flex: 1, padding: "8px", borderRadius: "10px", border: "none", cursor: "pointer",
                    background: privacy === val ? "rgba(0,122,255,0.25)" : "rgba(255,255,255,0.05)",
                    color: privacy === val ? "#007aff" : "#8e8e93", fontWeight: 600, fontSize: "0.8rem",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* View limit */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
            <label style={labelStyle}>Views</label>
            <div style={{ display: "flex", gap: "6px", flex: 1 }}>
              {[["unlimited", "∞ Unlimited"], ["once", "1× Once"], ["twice", "2× Twice"]].map(([val, label]) => (
                <button
                  key={val} onClick={() => setViewLimit(val)}
                  style={{
                    flex: 1, padding: "8px", borderRadius: "10px", border: "none", cursor: "pointer",
                    background: viewLimit === val ? "rgba(0,122,255,0.25)" : "rgba(255,255,255,0.05)",
                    color: viewLimit === val ? "#007aff" : "#8e8e93", fontWeight: 600, fontSize: "0.75rem",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && <p style={{ color: "#ff3b30", fontSize: "0.8125rem", marginBottom: "12px", textAlign: "center" }}>{error}</p>}

          {/* Submit */}
          <button
            onClick={submit}
            disabled={loading}
            style={{
              width: "100%", padding: "14px", borderRadius: "14px",
              background: "linear-gradient(135deg,#007aff,#5856d6)",
              border: "none", color: "#fff", fontWeight: 700, fontSize: "1rem", cursor: "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Posting…" : "Post Story 🚀"}
          </button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        style={{ display: "none" }}
        accept={tab === "image" ? "image/*" : tab === "video" ? "video/*" : "audio/*"}
        onChange={onFileChange}
      />
    </div>
  );
};

const uploadBtn = {
  background: "rgba(255,255,255,0.1)", border: "2px dashed rgba(255,255,255,0.2)",
  borderRadius: "12px", color: "#fff", padding: "16px 24px", cursor: "pointer",
  fontSize: "0.9rem", fontWeight: 600,
};
const ghostBtn = {
  background: "rgba(0,0,0,0.5)", border: "none", borderRadius: "8px",
  color: "#fff", padding: "4px 10px", cursor: "pointer", fontSize: "0.75rem",
};
const inputStyle = {
  width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "12px", color: "#fff", padding: "10px 14px", fontSize: "0.9rem", outline: "none",
  boxSizing: "border-box",
};
const labelStyle = { color: "#8e8e93", fontSize: "0.8125rem", fontWeight: 600, display: "flex", alignItems: "center", minWidth: "55px" };

export default StoryCreator;
