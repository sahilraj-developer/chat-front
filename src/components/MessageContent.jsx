import React from "react";

const MessageContent = ({ msg }) => {
  if (msg.video) {
    return (
      <video
        src={msg.video}
        controls
        playsInline
        className="block mb-0.5"
        style={{ maxWidth: "260px", maxHeight: "220px", borderRadius: "12px" }}
      />
    );
  }

  if (msg.audio) {
    return (
      <div className="flex items-center gap-2 py-0.5" style={{ minWidth: "200px" }}>
        <span style={{ fontSize: "1.25rem" }}>🎤</span>
        <audio src={msg.audio} controls style={{ height: "32px", flex: 1, maxWidth: "190px" }} />
      </div>
    );
  }

  if (msg.image) {
    return (
      <img
        src={msg.image}
        alt=""
        className="block mb-0.5 cursor-pointer"
        style={{ maxWidth: "100%", borderRadius: "12px" }}
        onClick={() => window.open(msg.image)}
      />
    );
  }

  return (
    <span
      style={{
        fontSize: "0.9375rem",
        fontWeight: 400,
        lineHeight: "1.45",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        display: "block",
      }}
    >
      {msg.text}
    </span>
  );
};

export default MessageContent;

