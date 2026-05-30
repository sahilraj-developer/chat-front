import React, { useEffect, useState, useContext } from "react";
import assets from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import { CallContext } from "../../context/CallContext";
import { StoryContext } from "../../context/StoryContext";
import CreateGroupModal from "./CreateGroupModal";
import CreateCommunityModal from "./CreateCommunityModal";
import CallsTab from "./CallsTab";
import StoriesBar from "./stories/StoriesBar";

/* ── Helpers ──────────────────────────────────────────────── */
const getLastMessagePreview = (msg, authUserId) => {
  if (!msg) return null;
  const isMe = String(msg.senderId?._id || msg.senderId) === String(authUserId);
  const prefix = isMe ? "You: " : "";
  if (msg.text) return prefix + msg.text;
  if (msg.image) return prefix + "📷 Photo";
  if (msg.audio) return prefix + "🎤 Voice";
  if (msg.video) return prefix + "🎥 Video";
  return null;
};

const formatTime = (ts) => {
  if (!ts) return "";
  const d = new Date(ts), now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { day: "numeric", month: "short" });
};

/* ── Inline icons ─────────────────────────────────────────── */
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const DotsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
  </svg>
);
const EditIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

/* ── Typing Dots ──────────────────────────────────────────── */
const TypingDots = () => (
  <span className="tg-typing-dots" style={{ display: "inline-flex" }}>
    <span/><span/><span/>
  </span>
);

/* ── Main Component ───────────────────────────────────────── */
const Sidebar = () => {
  const {
    getUsers, users, groups, communities,
    selectedChat, setSelectedChat,
    activeTab, setActiveTab,
    unseenMessages, unseenGroups, unseenCommunities,
    clearUnseenForChat,
    lastMessages, lastMessageByGroup, lastMessageByCommunity,
    typingUsers, typingKey,
  } = useContext(ChatContext);
  const { logout, onlineUsers, authUser } = useContext(AuthContext);
  const { startCall } = useContext(CallContext);
  const {
    followRequests, acceptFollowRequest, rejectFollowRequest,
    messageRequests, acceptMessageRequest,
  } = useContext(StoryContext);

  const [input, setInput] = useState("");
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showCommunityModal, setShowCommunityModal] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("chats"); // 'chats'|'follow-requests'|'message-requests'
  const navigate = useNavigate();

  useEffect(() => { getUsers(); }, [onlineUsers, getUsers]);

  const filterAndSort = (list, key = "fullName", lastMsgDict) => {
    let filtered = input ? list.filter(i => i[key]?.toLowerCase().includes(input.toLowerCase())) : [...list];
    
    // Sort by latest message
    filtered.sort((a, b) => {
      const timeA = lastMsgDict?.[a._id]?.createdAt ? new Date(lastMsgDict[a._id].createdAt).getTime() : 0;
      const timeB = lastMsgDict?.[b._id]?.createdAt ? new Date(lastMsgDict[b._id].createdAt).getTime() : 0;
      return timeB - timeA;
    });
    return filtered;
  };

  const chats = filterAndSort(users, "fullName", lastMessages);
  const groupList = filterAndSort(groups, "name", lastMessageByGroup);
  const communityList = filterAndSort(communities, "name", lastMessageByCommunity);

  const selectChat = (chat) => { setSelectedChat(chat); clearUnseenForChat(chat); };

  const isSelected = (type, id) => selectedChat?.type === type && selectedChat?.data?._id === id;

  const tabs = [
    { id: "chats", label: "Chats" },
    { id: "groups", label: "Groups" },
    { id: "communities", label: "Communities" },
    { id: "calls", label: "📞 Calls" },
  ];

  const Badge = ({ count }) =>
    count > 0 ? (
      <span className="wa-badge ml-auto flex-shrink-0">{count > 99 ? "99+" : count}</span>
    ) : null;

  // ── Special section renderers ──
  const renderFollowRequests = () => (
    <div style={{ padding: "12px 8px" }}>
      <p style={{ color: "#8e8e93", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", margin: "0 8px 12px" }}>
        Follow Requests ({followRequests.length})
      </p>
      {followRequests.length === 0 && (
        <div style={{ textAlign: "center", padding: "32px 0", color: "#8e8e93" }}>
          <div style={{ fontSize: "2rem", marginBottom: "8px" }}>🤝</div>
          <p style={{ fontSize: "0.875rem" }}>No pending requests</p>
        </div>
      )}
      {followRequests.map((req) => (
        <div key={req._id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 8px", borderRadius: "12px" }}>
          <img
            src={req.followerId?.profilePic || ""} alt=""
            onError={(e) => e.target.style.display = "none"}
            style={{ width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover", background: "#333", flexShrink: 0 }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: "0 0 2px", fontWeight: 600, fontSize: "0.9rem", truncate: true }}>{req.followerId?.fullName}</p>
            <p style={{ margin: 0, fontSize: "0.75rem", color: "#8e8e93" }}>{req.followerId?.bio || "Wants to follow you"}</p>
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            <button 
              onClick={() => acceptFollowRequest(req._id)} 
              style={{ padding: "4px 10px", borderRadius: "12px", border: "none", background: "#34c759", color: "#fff", cursor: "pointer", fontWeight: 600 }}
            >
              ✓
            </button>
            <button 
              onClick={() => rejectFollowRequest(req._id)} 
              style={{ padding: "4px 10px", borderRadius: "12px", border: "none", background: "rgba(255, 255, 255, 0.1)", color: "#fff", cursor: "pointer", fontWeight: 600 }}
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderMessageRequests = () => (
    <div style={{ padding: "12px 8px" }}>
      <p style={{ color: "#8e8e93", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", margin: "0 8px 12px" }}>
        Message Requests ({messageRequests.length})
      </p>
      {messageRequests.length === 0 && (
        <div style={{ textAlign: "center", padding: "32px 0", color: "#8e8e93" }}>
          <div style={{ fontSize: "2rem", marginBottom: "8px" }}>📭</div>
          <p style={{ fontSize: "0.875rem" }}>No message requests</p>
        </div>
      )}
      {messageRequests.map((req) => (
        <div key={req.sender?._id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px", borderRadius: "12px", cursor: "pointer" }}
          onClick={() => {
            acceptMessageRequest(req.sender._id);
            setSelectedChat({ type: "direct", data: req.sender });
            setActiveSection("chats");
          }}
        >
          <img
            src={req.sender?.profilePic || ""} alt=""
            onError={(e) => e.target.style.display = "none"}
            style={{ width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover", background: "#333", flexShrink: 0 }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: "0 0 2px", fontWeight: 600, fontSize: "0.9rem" }}>{req.sender?.fullName}</p>
            <p style={{ margin: 0, fontSize: "0.75rem", color: "#8e8e93", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {req.latestMessage?.text || "📎 Media"}
            </p>
          </div>
          <span style={{ fontSize: "0.7rem", color: "#8e8e93", flexShrink: 0 }}>{req.messageCount} msg{req.messageCount !== 1 ? "s" : ""}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className={`wa-panel h-full flex flex-col min-h-0 ${selectedChat ? "max-md:hidden" : ""}`}>

      {/* ── Top Header ── */}
      <div className="wa-header px-4 py-3 flex items-center justify-between gap-2">
        {/* Profile avatar + brand */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="relative cursor-pointer flex-shrink-0" onClick={() => navigate("/profile")}>
            <img
              src={authUser?.profilePic || assets.avatar_icon}
              alt="Me"
              className="wa-avatar-sm rounded-full object-cover"
            />
          </div>
          <span className="text-[var(--tg-text)] font-semibold text-[0.9375rem] truncate" style={{ letterSpacing: "-0.01em" }}>
            WhatsChat
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Compose / add button */}
          {activeTab === "groups" && (
            <button type="button" onClick={() => setShowGroupModal(true)} className="wa-btn-ghost" title="New group">
              <PlusIcon />
            </button>
          )}
          {activeTab === "communities" && (
            <>
              <button type="button" onClick={() => setShowCommunityModal("create")} className="wa-btn-ghost" title="New community">
                <PlusIcon />
              </button>
              <button
                type="button"
                onClick={() => setShowCommunityModal("join")}
                className="text-xs font-semibold px-3 py-1 rounded-full transition-colors"
                style={{ color: "var(--tg-accent)", background: "var(--tg-accent-dim)" }}
              >
                Join
              </button>
            </>
          )}
          {activeTab === "chats" && (
            <button type="button" onClick={() => navigate("/profile")} className="wa-btn-ghost" title="Edit profile">
              <EditIcon />
            </button>
          )}
          {/* Menu */}
          <div className="relative">
            <button type="button" onClick={() => setMenuOpen(m => !m)} className="wa-btn-ghost" title="Menu">
              <DotsIcon />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="wa-dropdown absolute top-full right-0 z-20 w-44 mt-1">
                  <p className="wa-dropdown__item" onClick={() => { setMenuOpen(false); navigate("/profile"); }}>
                    My Profile
                  </p>
                  <p className="wa-dropdown__item" style={{ color: "var(--tg-danger)" }} onClick={() => { setMenuOpen(false); logout(); }}>
                    Log Out
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Stories Bar ── */}
      {activeTab === "chats" && activeSection === "chats" && <StoriesBar />}

      {/* ── Section switcher row (below stories) ── */}
      {activeTab === "chats" && (
        <div style={{ display: "flex", gap: "6px", padding: "6px 10px 0", flexShrink: 0 }}>
          <button
            onClick={() => setActiveSection("chats")}
            style={{
              flex: 1, padding: "5px 0", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600,
              background: activeSection === "chats" ? "rgba(0,122,255,0.15)" : "transparent",
              color: activeSection === "chats" ? "#007aff" : "#8e8e93",
            }}
          >Chats</button>
          <button
            onClick={() => setActiveSection("follow-requests")}
            style={{
              flex: 1, padding: "5px 0", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600,
              background: activeSection === "follow-requests" ? "rgba(0,122,255,0.15)" : "transparent",
              color: activeSection === "follow-requests" ? "#007aff" : "#8e8e93",
              position: "relative",
            }}
          >
            Requests {followRequests.length > 0 && <span style={{ display: "inline-block", background: "#ff3b30", color: "#fff", borderRadius: "10px", padding: "0 5px", fontSize: "0.65rem", marginLeft: "3px" }}>{followRequests.length}</span>}
          </button>
          <button
            onClick={() => setActiveSection("message-requests")}
            style={{
              flex: 1, padding: "5px 0", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600,
              background: activeSection === "message-requests" ? "rgba(0,122,255,0.15)" : "transparent",
              color: activeSection === "message-requests" ? "#007aff" : "#8e8e93",
            }}
          >
            Messages {messageRequests.length > 0 && <span style={{ display: "inline-block", background: "#ff3b30", color: "#fff", borderRadius: "10px", padding: "0 5px", fontSize: "0.65rem", marginLeft: "3px" }}>{messageRequests.length}</span>}
          </button>
        </div>
      )}

      {/* ── Search ── */}
      <div className="px-3 py-2 flex-shrink-0">
        <div className="wa-search flex items-center gap-2 px-3 py-2">
          <SearchIcon />
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            type="text"
            placeholder="Search"
            className="bg-transparent border-none outline-none text-sm flex-1"
            style={{ color: "var(--tg-text)" }}
          />
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="wa-tabs flex-shrink-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`wa-tab ${activeTab === tab.id ? "wa-tab--active" : ""}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Chat List ── */}
      <div className="flex-1 overflow-y-auto min-h-0">

        {/* Follow Requests Section */}
        {activeTab === "chats" && activeSection === "follow-requests" && renderFollowRequests()}

        {/* Message Requests Section */}
        {activeTab === "chats" && activeSection === "message-requests" && renderMessageRequests()}

        {/* Direct Chats */}
        {(activeTab !== "chats" || activeSection === "chats") && activeTab === "chats" && (
          <>
            {chats.length === 0 && (
              <p className="text-center text-sm py-10 px-4" style={{ color: "var(--tg-text-dim)" }}>
                No contacts found.
              </p>
            )}
            {chats.map(user => {
              const lastMsg = lastMessages?.[user._id];
              const preview = getLastMessagePreview(lastMsg, authUser._id);
              const isTyping = typingUsers?.[typingKey("direct", user._id)]?.length > 0;
              const isOnline = onlineUsers.includes(user._id);
              const selected = isSelected("user", user._id);
              const unread = unseenMessages[user._id] || 0;

              return (
                <div
                  key={user._id}
                  onClick={() => selectChat({ type: "user", data: user })}
                  className={`wa-list-item ${selected ? "wa-list-item--active" : ""}`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <img src={user.profilePic || assets.avatar_icon} alt="" className="wa-avatar object-cover" />
                    {isOnline && (
                      <span
                        className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full"
                        style={{ background: "var(--tg-online)", border: "2px solid var(--tg-panel)" }}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="wa-list-item__title truncate">{user.fullName}</p>
                      {lastMsg && (
                        <span className="text-[11px] flex-shrink-0" style={{ color: unread > 0 ? "var(--tg-accent)" : "var(--tg-text-muted)" }}>
                          {formatTime(lastMsg.createdAt)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      {isTyping ? (
                        <div className="flex items-center gap-1.5">
                          <TypingDots />
                          <span className="text-xs" style={{ color: "var(--tg-accent)" }}>typing</span>
                        </div>
                      ) : (
                        <p className="wa-list-item__subtitle truncate flex-1">
                          {preview ?? (isOnline ? "online" : "tap to chat")}
                        </p>
                      )}
                      <Badge count={unread} />
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* Groups */}
        {activeTab === "groups" && (
          <>
            {groupList.length === 0 && (
              <p className="text-center text-sm py-10 px-4" style={{ color: "var(--tg-text-dim)" }}>
                No groups yet. Tap + to create one.
              </p>
            )}
            {groupList.map(group => {
              const lastMsg = lastMessageByGroup?.[group._id];
              const rawPreview = getLastMessagePreview(lastMsg, authUser._id);
              const preview = lastMsg && rawPreview && !rawPreview.startsWith("You:") && lastMsg.senderId?.fullName
                ? `${lastMsg.senderId.fullName}: ${rawPreview}`
                : rawPreview;
              const unread = unseenGroups[group._id] || 0;
              const selected = isSelected("group", group._id);

              return (
                <div
                  key={group._id}
                  onClick={() => selectChat({ type: "group", data: group })}
                  className={`wa-list-item ${selected ? "wa-list-item--active" : ""}`}
                >
                  <div className="wa-avatar wa-avatar-placeholder wa-avatar-placeholder--group flex-shrink-0">
                    {group.name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="wa-list-item__title truncate">{group.name}</p>
                      {lastMsg && (
                        <span className="text-[11px] flex-shrink-0" style={{ color: unread > 0 ? "var(--tg-accent)" : "var(--tg-text-muted)" }}>
                          {formatTime(lastMsg.createdAt)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className="wa-list-item__subtitle truncate flex-1">
                        {preview ?? `${group.members?.length} members`}
                      </p>
                      <Badge count={unread} />
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* Communities */}
        {activeTab === "communities" && (
          <>
            {communityList.length === 0 && (
              <p className="text-center text-sm py-10 px-4" style={{ color: "var(--tg-text-dim)" }}>
                No communities yet. Create or join with an invite code.
              </p>
            )}
            {communityList.map(community => {
              const lastMsg = lastMessageByCommunity?.[community._id];
              const rawPreview = getLastMessagePreview(lastMsg, authUser._id);
              const preview = lastMsg && rawPreview && !rawPreview.startsWith("You:") && lastMsg.senderId?.fullName
                ? `${lastMsg.senderId.fullName}: ${rawPreview}`
                : rawPreview;
              const unread = unseenCommunities[community._id] || 0;
              const selected = isSelected("community", community._id);

              return (
                <div
                  key={community._id}
                  onClick={() => selectChat({ type: "community", data: community })}
                  className={`wa-list-item ${selected ? "wa-list-item--active" : ""}`}
                >
                  <div className="wa-avatar wa-avatar-placeholder wa-avatar-placeholder--community flex-shrink-0">
                    {community.name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="wa-list-item__title truncate">{community.name}</p>
                      {lastMsg && (
                        <span className="text-[11px] flex-shrink-0" style={{ color: unread > 0 ? "var(--tg-accent)" : "var(--tg-text-muted)" }}>
                          {formatTime(lastMsg.createdAt)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className="wa-list-item__subtitle truncate flex-1">
                        {preview ?? `${community.members?.length} members`}
                      </p>
                      <Badge count={unread} />
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* ── Calls ── */}
        {activeTab === "calls" && (
          <CallsTab onStartCall={(user, callType) => startCall(user, callType)} />
        )}
      </div>

      {/* ── Modals ── */}
      {showGroupModal && <CreateGroupModal onClose={() => setShowGroupModal(false)} />}
      {showCommunityModal && (
        <CreateCommunityModal mode={showCommunityModal} onClose={() => setShowCommunityModal(null)} />
      )}
    </div>
  );
};

export default Sidebar;

const acBtn = {
  width: "32px", height: "32px", borderRadius: "50%", border: "none",
  background: "rgba(52,199,89,0.2)", color: "#34c759", cursor: "pointer", fontSize: "1rem",
  display: "flex", alignItems: "center", justifyContent: "center",
};
const rejBtn = {
  width: "32px", height: "32px", borderRadius: "50%", border: "none",
  background: "rgba(255,59,48,0.15)", color: "#ff3b30", cursor: "pointer", fontSize: "0.9rem",
  display: "flex", alignItems: "center", justifyContent: "center",
};
