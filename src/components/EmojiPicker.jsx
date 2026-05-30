import React, { useEffect, useRef, useState } from "react";

const CATEGORIES = [
  {
    label: "😀 Smileys",
    emojis: ["😀","😃","😄","😁","😆","😅","🤣","😂","🙂","🙃","😉","😊","😇","🥰","😍","🤩","😘","😗","😚","😙","🥲","😋","😛","😜","🤪","😝","🤑","🤗","🤭","🤫","🤔","🤐","🤨","😐","😑","😶","😏","😒","🙄","😬","🤥","😔","😪","🤤","😴","😷","🤒","🤕","🤢","🤮","🤧","🥵","🥶","😵","🤯","🤠","🥳","😎","🤓","🧐","😕","😟","🙁","☹️","😮","😯","😲","😳","🥺","😦","😧","😨","😰","😥","😢","😭","😱","😖","😣","😞","😓","😩","😫","🥱","😤","😡","😠","🤬","😈","👿","💀","☠️","💩","🤡","👹","👺","👻","👽","👾","🤖"],
  },
  {
    label: "👋 Gestures",
    emojis: ["👋","🤚","🖐️","✋","🖖","👌","🤌","🤏","✌️","🤞","🤟","🤘","🤙","👈","👉","👆","🖕","👇","☝️","👍","👎","✊","👊","🤛","🤜","👏","🙌","👐","🤲","🤝","🙏","✍️","💅","🤳","💪","🦵","🦶","👂","🦻","👃","🧠","🫀","🦷","👅","👁️","👀","👤","👥","💬","💭","💫"],
  },
  {
    label: "❤️ Hearts",
    emojis: ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❤️‍🔥","❤️‍🩹","💕","💞","💓","💗","💖","💘","💝","💟","☮️","✝️","☯️","🕎","🔯","♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓","⛎","🔀","🔁","🔂","▶️","⏩","⏭️","⏯️","🔼","⏫","🔽","⏬","⏸️","⏹️","⏺️"],
  },
  {
    label: "🎉 Celebration",
    emojis: ["🎉","🎊","🎈","🎁","🎀","🎗️","🎟️","🎫","🎖️","🏆","🥇","🥈","🥉","🏅","🎯","🎮","🎲","🧩","♟️","🃏","🀄","🎴","🎭","🎨","🖼️","🎰","🚂","🚃","🚄","🚅","🚆","🚇","🚈","🚉","🚊","🚝","🚞","🚋","🚌","🚍","🚎","🚐","🚑","🚒","🚓","🚔","🚕","🚖","🚗","🚘","🚙"],
  },
  {
    label: "🌟 Nature",
    emojis: ["🌸","🌺","🌻","🌹","🌷","💐","🍀","🌿","🌱","🌲","🌳","🌴","🌵","🌾","🍁","🍂","🍃","🍄","🌰","🦔","🐾","🌍","🌎","🌏","🌐","🗺️","🧭","🌋","⛰️","🏔️","🗻","🏕️","🏖️","🏜️","🏝️","🏞️","🌅","🌄","🌠","🎇","🎆","🌇","🌆","🏙️","🌃","🌌","🌉","🌁","⛅","🌤️","🌥️","🌦️","🌧️","⛈️","🌩️","🌨️","❄️","☃️","⛄","🌬️","💨","🌀","🌈","🌂","☂️","☔","⛱️"],
  },
  {
    label: "🍔 Food",
    emojis: ["🍕","🍔","🌭","🍟","🌮","🌯","🥙","🧆","🥚","🍳","🥘","🍲","🥗","🥣","🥫","🍝","🍜","🍛","🍣","🍱","🥟","🦪","🍤","🍙","🍚","🍘","🍥","🥮","🍡","🧁","🍰","🎂","🍮","🍭","🍬","🍫","🍿","🍩","🍪","🌰","🥜","🍯","🧂","🥤","🧃","🥛","🍵","🍺","🍻","🥂","🍷","🥃","🍸","🍹","🧉","🍾","🍶"],
  },
  {
    label: "✈️ Travel",
    emojis: ["✈️","🚀","🛸","🚁","🛶","⛵","🚤","🛥️","🚢","🏗️","🏘️","🏚️","🏠","🏡","🏢","🏣","🏤","🏥","🏦","🏧","🏨","🏩","🏪","🏫","🏬","🏭","🏯","🏰","💒","🗼","🗽","⛪","🕌","🛕","🕍","⛩️","🕋","⛲","⛺","🏟️","🎡","🎢","🎠","⛽","🚧","⚓","🗺️"],
  },
  {
    label: "💼 Objects",
    emojis: ["💡","🔦","🕯️","🪔","🧱","💎","🔧","🔨","⚒️","🛠️","⛏️","🔩","🪝","🧲","🔫","💣","🪓","🗡️","⚔️","🛡️","🪚","🔪","🗜️","🧰","🪛","🧯","📱","💻","⌨️","🖥️","🖨️","🖱️","🖲️","💾","💿","📀","🎥","📷","📸","📹","📼","📺","📻","🎙️","🎚️","🎛️","⏱️","⏰","🕰️","⌛","⏳","📡","🔋","🪫","🔌","💡","🔦"],
  },
];

const EmojiPicker = ({ onSelect, onClose }) => {
  const [activeCategory, setActiveCategory] = useState(0);
  const [search, setSearch] = useState("");
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const filtered = search
    ? CATEGORIES.flatMap((c) => c.emojis).filter(() => true) // show all when searching (emoji names not available)
    : CATEGORIES[activeCategory].emojis;

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        bottom: "100%",
        left: 0,
        zIndex: 50,
        background: "#1c1c1e",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "16px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
        width: "320px",
        maxHeight: "360px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        marginBottom: "8px",
      }}
    >
      {/* Search */}
      <div style={{ padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search emoji…"
          autoFocus
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid transparent",
            borderRadius: "8px",
            color: "#fff",
            padding: "6px 10px",
            fontSize: "0.875rem",
            outline: "none",
          }}
        />
      </div>

      {/* Category tabs */}
      {!search && (
        <div
          style={{
            display: "flex",
            overflowX: "auto",
            gap: "2px",
            padding: "6px 8px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            scrollbarWidth: "none",
          }}
        >
          {CATEGORIES.map((cat, i) => (
            <button
              key={i}
              onClick={() => setActiveCategory(i)}
              title={cat.label}
              style={{
                background: activeCategory === i ? "rgba(0,122,255,0.2)" : "transparent",
                border: "none",
                borderRadius: "8px",
                padding: "4px 6px",
                fontSize: "1.1rem",
                cursor: "pointer",
                flexShrink: 0,
                transition: "background 0.15s",
              }}
            >
              {cat.emojis[0]}
            </button>
          ))}
        </div>
      )}

      {/* Emoji grid */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "8px",
          display: "grid",
          gridTemplateColumns: "repeat(8, 1fr)",
          gap: "2px",
        }}
      >
        {(search ? CATEGORIES.flatMap((c) => c.emojis) : filtered).map((emoji, i) => (
          <button
            key={i}
            onClick={() => { onSelect(emoji); }}
            style={{
              background: "transparent",
              border: "none",
              fontSize: "1.375rem",
              cursor: "pointer",
              padding: "4px",
              borderRadius: "8px",
              transition: "background 0.1s",
              lineHeight: 1,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmojiPicker;
