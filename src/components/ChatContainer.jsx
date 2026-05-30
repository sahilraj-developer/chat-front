import React, { useContext, useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import { formatMessageTime } from "../lib/utils";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import { CallContext } from "../../context/CallContext";
import toast from "react-hot-toast";
import MessageContent from "./MessageContent";
import MediaRecorderBar from "./MediaRecorderBar";
import EmojiPicker from "./EmojiPicker";

const TYPING_THROTTLE = 1000;

/* ── Icons ───────────────────────────────────────────────── */
const BackIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const VideoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
  </svg>
);
const PhoneIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.59a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);
const AttachIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
  </svg>
);
const MicIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);
const VideoNoteIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>
  </svg>
);
const SendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
  </svg>
);
const DotsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
  </svg>
);
const EmojiIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M8 13s1.5 2 4 2 4-2 4-2"/>
    <line x1="9" y1="9" x2="9.01" y2="9"/>
    <line x1="15" y1="9" x2="15.01" y2="9"/>
  </svg>
);
const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14H6L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4h6v2"/>
  </svg>
);

/* ── Typing Dots ─────────────────────────────────────────── */
const TypingDots = () => (
  <span className="tg-typing-dots">
    <span/><span/><span/>
  </span>
);

/* ── Context Menu ────────────────────────────────────────── */
const ContextMenu = ({ x, y, onDelete, onClose }) => {
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        top: y,
        left: x,
        zIndex: 1000,
        background: "#2c2c2e",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: "12px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
        minWidth: "140px",
        overflow: "hidden",
      }}
    >
      <button
        onClick={() => { onDelete(); onClose(); }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          width: "100%",
          padding: "12px 16px",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#ff3b30",
          fontSize: "0.9rem",
          fontWeight: 500,
          transition: "background 0.1s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,59,48,0.12)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
      >
        <TrashIcon /> Delete message
      </button>
    </div>
  );
};

/* ── Main Component ──────────────────────────────────────── */
const ChatContainer = () => {
  const {
    messages, hasMoreMessages, selectedChat, setSelectedChat,
    sendMessage, getMessages, loadEarlierMessages, deleteMessage,
    typingUsers, typingKey, chatSettings, updateChatSettings,
  } = useContext(ChatContext);
  const { authUser, onlineUsers, socket } = useContext(AuthContext);
  const { startCall } = useContext(CallContext);
  const navigate = useNavigate();

  const scrollEnd = useRef();
  const [input, setInput] = useState("");
  const [recorderMode, setRecorderMode] = useState(null);
  const [loadingEarlier, setLoadingEarlier] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [contextMenu, setContextMenu] = useState(null); // { x, y, messageId }
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsForm, setSettingsForm] = useState({ theme: "default", bgPreview: "" });
  const isTypingRef = useRef(false);
  const typingTimerRef = useRef(null);
  const lastTypingEmitRef = useRef(0);

  /* ── Helpers ─────────────────────────────────────────── */
  const chatTitle = () => {
    if (!selectedChat) return "";
    return selectedChat.type === "user" ? selectedChat.data.fullName : selectedChat.data.name;
  };

  const chatSubtitle = () => {
    if (!selectedChat) return "";
    if (selectedChat.type === "user")
      return onlineUsers.includes(selectedChat.data._id) ? "online" : "last seen recently";
    const count = selectedChat.data.members?.length || 0;
    return `${count} member${count !== 1 ? "s" : ""}`;
  };

  const avatar = () =>
    !selectedChat || selectedChat.type !== "user"
      ? assets.avatar_icon
      : selectedChat.data.profilePic || assets.avatar_icon;

  const isUserOnline = selectedChat?.type === "user" && onlineUsers.includes(selectedChat.data._id);
  const canCall = selectedChat?.type === "user";

  const currentTypingUsers = (() => {
    if (!selectedChat || !typingUsers) return [];
    const key =
      selectedChat.type === "user"
        ? typingKey("direct", selectedChat.data._id)
        : typingKey(selectedChat.type, selectedChat.data._id);
    return typingUsers[key] || [];
  })();

  /* ── Typing ──────────────────────────────────────────── */
  const emitTyping = () => {
    if (!socket || !selectedChat) return;
    const now = Date.now();
    if (now - lastTypingEmitRef.current < TYPING_THROTTLE) return;
    lastTypingEmitRef.current = now;
    if (selectedChat.type === "user") socket.emit("typing", { to: selectedChat.data._id, chatType: "direct" });
    else socket.emit("typing", { chatType: selectedChat.type, chatId: selectedChat.data._id });
    isTypingRef.current = true;
  };

  const emitStopTyping = useCallback(() => {
    if (!socket || !selectedChat || !isTypingRef.current) return;
    if (selectedChat.type === "user") socket.emit("stopTyping", { to: selectedChat.data._id, chatType: "direct" });
    else socket.emit("stopTyping", { chatType: selectedChat.type, chatId: selectedChat.data._id });
    isTypingRef.current = false;
  }, [socket, selectedChat]);

  /* ── Handlers ─────────────────────────────────────────── */
  const handleInputChange = (e) => {
    setInput(e.target.value);
    emitTyping();
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(emitStopTyping, 2000);
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;
    emitStopTyping();
    clearTimeout(typingTimerRef.current);
    await sendMessage({ text: input.trim() });
    setInput("");
    setShowEmoji(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); }
  };

  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) { toast.error("Select an image file"); return; }
    const reader = new FileReader();
    reader.onloadend = async () => { await sendMessage({ image: reader.result }); e.target.value = ""; };
    reader.readAsDataURL(file);
  };

  const handleMediaSend = async (payload) => { setRecorderMode(null); await sendMessage(payload); };

  const handleLoadEarlier = async () => {
    setLoadingEarlier(true);
    await loadEarlierMessages(selectedChat);
    setLoadingEarlier(false);
  };

  const handleEmojiSelect = (emoji) => {
    setInput((prev) => prev + emoji);
  };

  const handleRightClick = (e, msg, isMine) => {
    if (!isMine) return; // only own messages
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, messageId: msg._id });
  };

  useEffect(() => {
    if (chatSettings) {
      setSettingsForm({ theme: chatSettings.theme || "default", bgPreview: chatSettings.backgroundImage || "" });
    } else {
      setSettingsForm({ theme: "default", bgPreview: "" });
    }
  }, [chatSettings]);

  const handleBgImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setSettingsForm(prev => ({ ...prev, bgPreview: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSettings = async () => {
    // If the preview is a base64 string, it's a new upload. Otherwise it's an existing URL or empty.
    const isNewImage = settingsForm.bgPreview.startsWith("data:");
    const base64Data = isNewImage ? settingsForm.bgPreview : (settingsForm.bgPreview === "" ? "" : undefined);
    await updateChatSettings(settingsForm.theme, base64Data);
    setShowSettingsModal(false);
  };

  /* ── Effects ─────────────────────────────────────────── */
  useEffect(() => {
    if (selectedChat) {
      setRecorderMode(null); setInput(""); setShowEmoji(false);
      emitStopTyping();
      getMessages(selectedChat);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChat]);

  useEffect(() => { scrollEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => () => {
    clearTimeout(typingTimerRef.current);
    emitStopTyping();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Msg helpers ─────────────────────────────────────── */
  const getSenderId = (msg) => String(typeof msg.senderId === "object" ? msg.senderId._id : msg.senderId);
  const getSenderName = (msg) => typeof msg.senderId === "object" ? msg.senderId.fullName : "User";
  const isMine = (msg) => getSenderId(msg) === String(authUser._id);

  /* ── Empty state ─────────────────────────────────────── */
  if (!selectedChat) {
    return (
      <div className="wa-empty-chat min-h-0 tg-fade-in">
        <div className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: "rgba(0,122,255,0.12)", border: "1px solid rgba(0,122,255,0.2)" }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#007aff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <h2 className="wa-empty-chat__title">WhatsChat</h2>
        <p className="wa-empty-chat__desc">Select a chat to start messaging. Messages are end-to-end encrypted.</p>
      </div>
    );
  }

  /* ── Main render ─────────────────────────────────────── */
  const customThemeClass = chatSettings?.theme && chatSettings.theme !== "default" ? `theme-${chatSettings.theme}` : "";
  const customBgStyle = chatSettings?.backgroundImage ? {
    backgroundImage: `url(${chatSettings.backgroundImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  } : {};

  return (
    <div 
      className={`wa-chat-area flex flex-col h-full min-h-0 tg-fade-in ${customThemeClass}`}
      style={customBgStyle}
    >
      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#1c1c1e] rounded-2xl w-full max-w-sm p-5 border border-white/10 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Chat Settings</h3>
              <button onClick={() => setShowSettingsModal(false)} className="text-white/60 hover:text-white">&times;</button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/50 mb-1 block">Theme Color</label>
                <div className="flex gap-2">
                  {["default", "ocean", "sunset", "forest"].map(t => (
                    <button
                      key={t}
                      onClick={() => setSettingsForm(prev => ({...prev, theme: t}))}
                      className={`px-3 py-1.5 rounded-lg text-sm capitalize border ${settingsForm.theme === t ? "border-[#007aff] bg-[#007aff]/10 text-[#007aff]" : "border-white/10 text-white/70 hover:bg-white/5"}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-white/50 mb-1 block">Background Image</label>
                {settingsForm.bgPreview ? (
                  <div className="relative w-full h-32 rounded-lg overflow-hidden border border-white/10">
                    <img src={settingsForm.bgPreview} alt="bg" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => setSettingsForm(prev => ({...prev, bgPreview: ""}))}
                      className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full text-white hover:bg-red-500/80"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 rounded-lg border-2 border-dashed border-white/20 hover:border-[#007aff] hover:bg-[#007aff]/5 cursor-pointer transition-colors">
                    <span className="text-sm text-white/60">Upload Image</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleBgImageChange} />
                  </label>
                )}
              </div>

              <button 
                onClick={handleSaveSettings}
                className="w-full py-2.5 rounded-xl bg-[#007aff] text-white font-medium hover:bg-[#006ee6] transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Context menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onDelete={() => deleteMessage(contextMenu.messageId)}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* ── Header ── */}
      <div className="wa-header flex items-center gap-3 px-3 py-2.5" style={{ background: customBgStyle.backgroundImage ? "rgba(28, 28, 30, 0.85)" : undefined, backdropFilter: customBgStyle.backgroundImage ? "blur(10px)" : undefined }}>
        <button type="button" onClick={() => setSelectedChat(null)} className="md:hidden wa-btn-ghost" aria-label="Back">
          <BackIcon />
        </button>

        {selectedChat.type === "user" ? (
          <div className="relative flex-shrink-0">
            <img src={avatar()} alt="" className="wa-avatar-sm rounded-full object-cover" />
            {isUserOnline && (
              <span className="tg-online-dot" style={{ borderColor: "var(--tg-panel)" }} />
            )}
          </div>
        ) : (
          <div className={`wa-avatar-sm wa-avatar-placeholder flex-shrink-0
            ${selectedChat.type === "community" ? "wa-avatar-placeholder--community" : "wa-avatar-placeholder--group"}`}>
            {chatTitle()[0]?.toUpperCase()}
          </div>
        )}

        <div 
          className="flex-1 min-w-0 cursor-pointer" 
          onClick={() => {
            if (selectedChat.type === "user") {
              navigate(`/profile/${selectedChat.data._id}`);
            }
          }}
        >
          <p className="text-[var(--tg-text)] text-[0.9375rem] font-semibold truncate leading-tight hover:underline" style={{ letterSpacing: "-0.01em" }}>
            {chatTitle()}
          </p>
          {currentTypingUsers.length > 0 ? (
            <div className="flex items-center gap-1.5 mt-0.5">
              <TypingDots />
              <span className="text-xs" style={{ color: "var(--tg-accent)" }}>typing</span>
            </div>
          ) : (
            <p className={`text-xs truncate mt-0.5 ${isUserOnline ? "text-[var(--tg-online)]" : "text-[var(--tg-text-muted)]"}`}>
              {chatSubtitle()}
            </p>
          )}
        </div>

        <div className="flex items-center gap-0.5 flex-shrink-0">
          {canCall && (
            <>
              <button type="button" onClick={() => startCall(selectedChat.data, "audio")} className="wa-btn-ghost" title="Voice call">
                <PhoneIcon />
              </button>
              <button type="button" onClick={() => startCall(selectedChat.data, "video")} className="wa-btn-ghost" title="Video call">
                <VideoIcon />
              </button>
              <button type="button" onClick={() => setShowSettingsModal(true)} className="wa-btn-ghost" title="Chat Settings">
                <SettingsIcon />
              </button>
            </>
          )}
          <button type="button" className="wa-btn-ghost" title="More">
            <DotsIcon />
          </button>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto min-h-0 wa-messages">
        {hasMoreMessages && (
          <div className="tg-load-more">
            <button type="button" onClick={handleLoadEarlier} disabled={loadingEarlier} className="tg-load-more__btn">
              {loadingEarlier ? "Loading…" : "↑ Load earlier messages"}
            </button>
          </div>
        )}

        {messages.length === 0 && (
          <p className="text-center text-sm py-8" style={{ color: "var(--tg-text-dim)" }}>
            No messages yet — say hello! 👋
          </p>
        )}

        {messages.map((msg, index) => {
          const mine = isMine(msg);
          const showSender =
            selectedChat.type !== "user" && !mine &&
            (index === 0 || getSenderId(messages[index - 1]) !== getSenderId(msg));

          return (
            <div
              key={msg._id || index}
              className={`wa-bubble-row ${mine ? "wa-bubble-row--mine" : "wa-bubble-row--theirs"}`}
              onContextMenu={(e) => handleRightClick(e, msg, mine)}
            >
              {showSender && <span className="wa-bubble-sender">{getSenderName(msg)}</span>}
              <div className={`wa-bubble ${mine ? "wa-bubble-sent" : "wa-bubble-received"}`}
                style={msg.isDeleted ? { opacity: 0.5, fontStyle: "italic" } : {}}>
                {msg.isDeleted ? (
                  <span style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.45)" }}>
                    🚫 This message was deleted
                  </span>
                ) : (
                  <MessageContent msg={msg} />
                )}
                <span className="wa-bubble__time">{formatMessageTime(msg.createdAt)}</span>
              </div>
            </div>
          );
        })}
        <div ref={scrollEnd} />
      </div>

      {/* ── Composer ── */}
      {recorderMode ? (
        <MediaRecorderBar mode={recorderMode} onSend={handleMediaSend} onCancel={() => setRecorderMode(null)} />
      ) : (
        <div className="tg-composer" style={{ position: "relative" }}>
          {/* Emoji Picker */}
          {showEmoji && (
            <EmojiPicker onSelect={handleEmojiSelect} onClose={() => setShowEmoji(false)} />
          )}

          {/* Attach */}
          <label className="tg-composer__btn tg-composer__btn--icon cursor-pointer" title="Attach file">
            <AttachIcon />
            <input onChange={handleSendImage} type="file" accept="image/png,image/jpeg,image/webp" hidden />
          </label>

          {/* Input wrap */}
          <div className="tg-composer__input-wrap">
            {/* Emoji toggle */}
            <button
              type="button"
              onClick={() => setShowEmoji((s) => !s)}
              className="wa-btn-ghost"
              style={{ padding: "0.2rem", color: showEmoji ? "#007aff" : undefined }}
              title="Emoji"
            >
              <EmojiIcon />
            </button>

            <input
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              type="text"
              placeholder="Message"
              className="tg-composer__input"
            />

            {/* Voice */}
            <button type="button" onClick={() => setRecorderMode("audio")} className="wa-btn-ghost" style={{ padding: "0.2rem" }} title="Voice message">
              <MicIcon />
            </button>
            {/* Video note */}
            <button type="button" onClick={() => setRecorderMode("video")} className="wa-btn-ghost" style={{ padding: "0.2rem" }} title="Video message">
              <VideoNoteIcon />
            </button>
          </div>

          {/* Send */}
          <button
            type="button"
            onClick={handleSendMessage}
            disabled={!input.trim()}
            className="tg-composer__btn tg-composer__btn--send"
            title="Send"
          >
            <SendIcon />
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatContainer;
