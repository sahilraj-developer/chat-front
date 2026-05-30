import React, { useContext } from "react";
import { StoryContext } from "../../../context/StoryContext";
import { AuthContext } from "../../../context/AuthContext";

const StoryRing = ({ group, onOpen }) => {
  const { authUser } = useContext(AuthContext);
  const isOwn = group.author._id === authUser?._id;
  const unseen = group.hasUnseenStories;

  return (
    <button
      onClick={onOpen}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: "5px",
        background: "none", border: "none", cursor: "pointer", flexShrink: 0,
        padding: "4px",
      }}
    >
      {/* Ring */}
      <div style={{
        width: "58px", height: "58px", borderRadius: "50%", padding: "2.5px",
        background: unseen
          ? "linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)"
          : isOwn
            ? "linear-gradient(135deg,#007aff,#5856d6)"
            : "rgba(255,255,255,0.15)",
      }}>
        <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#1c1c1e", padding: "2px" }}>
          {group.author.profilePic ? (
            <img
              src={group.author.profilePic}
              alt={group.author.fullName}
              style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
            />
          ) : (
            <div style={{
              width: "100%", height: "100%", borderRadius: "50%",
              background: "linear-gradient(135deg,#007aff,#5856d6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.25rem", fontWeight: 700, color: "#fff",
            }}>
              {group.author.fullName?.[0]?.toUpperCase()}
            </div>
          )}
        </div>
      </div>
      <span style={{ fontSize: "0.7rem", color: unseen ? "#fff" : "#8e8e93", maxWidth: "60px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: unseen ? 600 : 400 }}>
        {isOwn ? "Your story" : group.author.fullName?.split(" ")[0]}
      </span>
    </button>
  );
};

const StoriesBar = () => {
  const { feed, openViewer, setCreatorOpen } = useContext(StoryContext);
  const { authUser } = useContext(AuthContext);

  // Check if current user already has a story in feed
  const myGroup = feed.find((g) => g.author._id === authUser?._id);

  return (
    <div style={{
      display: "flex", gap: "4px", padding: "8px 8px 4px",
      overflowX: "auto", borderBottom: "1px solid rgba(255,255,255,0.06)",
      scrollbarWidth: "none",
    }}>
      <style>{`.stories-bar::-webkit-scrollbar{display:none}`}</style>

      {/* Add story button */}
      <button
        onClick={() => setCreatorOpen(true)}
        style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: "5px",
          background: "none", border: "none", cursor: "pointer", flexShrink: 0, padding: "4px",
        }}
      >
        <div style={{
          width: "58px", height: "58px", borderRadius: "50%",
          background: "rgba(255,255,255,0.06)", border: "2px dashed rgba(255,255,255,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative", fontSize: "1.5rem",
        }}>
          {authUser?.profilePic && (
            <img
              src={authUser.profilePic}
              alt=""
              style={{ position: "absolute", inset: 0, borderRadius: "50%", width: "100%", height: "100%", objectFit: "cover", opacity: 0.5 }}
            />
          )}
          <span style={{ position: "relative", zIndex: 1, fontSize: "1.5rem", color: "#007aff", fontWeight: 700 }}>+</span>
        </div>
        <span style={{ fontSize: "0.7rem", color: "#8e8e93", maxWidth: "60px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          Add story
        </span>
      </button>

      {/* Your story (if exists) */}
      {myGroup && (
        <StoryRing key={myGroup.author._id} group={myGroup} onOpen={() => openViewer(myGroup, 0)} />
      )}

      {/* Others */}
      {feed.filter((g) => g.author._id !== authUser?._id).map((group) => (
        <StoryRing key={group.author._id} group={group} onOpen={() => openViewer(group, 0)} />
      ))}
    </div>
  );
};

export default StoriesBar;
